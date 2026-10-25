import { withTransaction, pool } from '../db.js';
import { HttpError } from '../errors.js';
import { refund as refundPayment } from '../orders/payments-client.js';
import { enqueueEmail } from '../queue.js';
import { calcRefundAmounts, canRefundAt, REFUND_DEADLINE_HOURS } from './amounts.js';

export interface RefundRequest {
  tenantId: string;
  orderId: string;
  buyerEmail: string;
  ticketIds: string[];
}

export async function requestRefund(req: RefundRequest, now = new Date()) {
  if (!Array.isArray(req.ticketIds) || req.ticketIds.length === 0) {
    throw new HttpError(400, 'indica qué entradas quieres devolver');
  }

  const o = await pool.query(
    `SELECT o.id, o.status, o.buyer_email, o.charge_id, e.starts_at, e.fee_cents, e.commission_bps
       FROM orders o JOIN events e ON e.id = o.event_id
      WHERE o.id = $1 AND o.tenant_id = $2`,
    [req.orderId, req.tenantId],
  );
  const order = o.rows[0];
  if (!order || order.buyer_email !== req.buyerEmail.toLowerCase()) {
    throw new HttpError(404, 'no hay ningún pedido con ese número y ese email');
  }
  if (order.status !== 'paid') throw new HttpError(409, 'solo se pueden devolver entradas de pedidos pagados');
  if (!canRefundAt(new Date(order.starts_at), now)) {
    throw new HttpError(409, `las devoluciones cierran ${REFUND_DEADLINE_HOURS} h antes del evento`);
  }

  const t = await pool.query(
    `SELECT id, price_cents, fee_cents, commission_cents, status FROM tickets
      WHERE order_id = $1 AND id = ANY($2::text[])`,
    [req.orderId, req.ticketIds],
  );
  if (t.rows.length !== new Set(req.ticketIds).size) throw new HttpError(400, 'alguna entrada no es de este pedido');
  const notValid = t.rows.find((row) => row.status !== 'valid');
  if (notValid) throw new HttpError(409, `la entrada ${notValid.id} no se puede devolver (${notValid.status})`);

  const amounts = calcRefundAmounts(t.rows);
  const payment = await refundPayment(order.charge_id, amounts.amount_cents);

  const refundId = await withTransaction(async (db) => {
    const seq = await db.query<{ n: string }>(`SELECT nextval('refund_number_seq') AS n`);
    const id = `DEV-${now.getFullYear()}-${String(seq.rows[0]!.n).padStart(4, '0')}`;
    await db.query(
      `INSERT INTO refunds (id, order_id, tenant_id, amount_cents, commission_reversed_cents, payment_refund_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, req.orderId, req.tenantId, amounts.amount_cents, amounts.commission_reversed_cents, payment.id],
    );
    for (const ticket of t.rows) {
      await db.query('INSERT INTO refund_tickets (refund_id, ticket_id) VALUES ($1, $2)', [id, ticket.id]);
      await db.query(`UPDATE tickets SET status = 'refunded' WHERE id = $1`, [ticket.id]);
    }
    return id;
  });

  await enqueueEmail({ type: 'refund-confirmed', refundId });
  return { id: refundId, order_id: req.orderId, ticket_ids: req.ticketIds, ...amounts };
}
