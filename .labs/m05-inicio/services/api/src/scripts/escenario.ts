// Añade datos de prueba para trabajar las devoluciones (npm run escenario).
// Idempotente: borra lo que creó en una ejecución anterior (pedidos PRU-*, evento EV-FARO-0099 y lo comprado en él).
import { config } from '../config.js';
import { pool, withTransaction } from '../db.js';
import { charge } from '../orders/payments-client.js';
import { ticketAmounts } from '../orders/pricing.js';
import { createQrToken } from '../tickets/qr.js';

const faro = { fee_cents: 90, commission_bps: 750 };

interface OrderSpec {
  id: string;
  email: string;
  status: 'paid' | 'failed';
  seats: string[];
  refund?: string[]; // butacas devueltas
}

const ORDERS: OrderSpec[] = [
  { id: 'PRU-0001', email: 'marta@ejemplo.test', status: 'paid', seats: ['C-4', 'C-5', 'C-6'] },
  { id: 'PRU-0002', email: 'jorge@ejemplo.test', status: 'paid', seats: ['K-10', 'K-11'], refund: ['K-11'] },
  { id: 'PRU-0003', email: 'sara@ejemplo.test', status: 'failed', seats: ['D-1'] },
  { id: 'PRU-0004', email: 'nico@ejemplo.test', status: 'paid', seats: ['A-1'], refund: ['A-1'] },
];

await withTransaction(async (db) => {
  const mine = `SELECT id FROM orders WHERE id LIKE 'PRU-%' OR event_id = 'EV-FARO-0099'`;
  await db.query(`DELETE FROM refund_tickets WHERE refund_id IN (SELECT id FROM refunds WHERE order_id IN (${mine}))`);
  await db.query(`DELETE FROM refunds WHERE order_id IN (${mine})`);
  await db.query(`DELETE FROM tickets WHERE order_id IN (${mine})`);
  await db.query(`DELETE FROM orders WHERE id IN (${mine})`);
  await db.query(`DELETE FROM events WHERE id = 'EV-FARO-0099'`);

  for (const o of ORDERS) {
    const seats = await db.query(`SELECT id, price_cents FROM seats WHERE event_id = 'EV-FARO-0042' AND id = ANY($1)`, [o.seats]);
    const lines = seats.rows.map((s) => ({ seat: s.id as string, ...ticketAmounts(s.price_cents, faro) }));
    const subtotal = lines.reduce((a, l) => a + l.price_cents, 0);
    const fees = lines.reduce((a, l) => a + l.fee_cents, 0);
    // El cargo se hace en la pasarela emulada para que las devoluciones de estos pedidos funcionen
    const chargeId = o.status === 'paid' ? (await charge(subtotal + fees, '4242424242424242', o.id)).id : null;
    await db.query(
      `INSERT INTO orders (id, tenant_id, event_id, buyer_email, status, subtotal_cents, fee_cents, total_cents, commission_cents, charge_id, paid_at)
       VALUES ($1, 'TN-FARO', 'EV-FARO-0042', $2, $3, $4, $5, $6, $7, $8, $9)`,
      [o.id, o.email, o.status, subtotal, fees, subtotal + fees, lines.reduce((a, l) => a + l.commission_cents, 0),
        chargeId, o.status === 'paid' ? new Date() : null],
    );
    for (const [i, l] of lines.entries()) {
      const id = `${o.id}-${i + 1}`;
      const status = o.status === 'failed' ? 'void' : o.refund?.includes(l.seat) ? 'refunded' : 'valid';
      await db.query(
        `INSERT INTO tickets (id, order_id, event_id, kind, seat_id, price_cents, fee_cents, commission_cents, status, qr_token)
         VALUES ($1, $2, 'EV-FARO-0042', 'seat', $3, $4, $5, $6, $7, $8)`,
        [id, o.id, l.seat, l.price_cents, l.fee_cents, l.commission_cents, status, createQrToken(id, config.ticketsSecret)],
      );
    }
    if (o.refund) {
      const refunded = lines.filter((l) => o.refund!.includes(l.seat));
      const refundId = `DEV-PRU-${o.id.slice(4)}`;
      await db.query(
        `INSERT INTO refunds (id, order_id, tenant_id, amount_cents, commission_reversed_cents, payment_refund_id)
         VALUES ($1, $2, 'TN-FARO', $3, $4, 're_escenario')`,
        [refundId, o.id, refunded.reduce((a, l) => a + l.price_cents, 0), refunded.reduce((a, l) => a + l.commission_cents, 0)],
      );
      for (const l of refunded) {
        const ticketId = `${o.id}-${lines.indexOf(l) + 1}`;
        await db.query('INSERT INTO refund_tickets (refund_id, ticket_id) VALUES ($1, $2)', [refundId, ticketId]);
      }
    }
  }

  // Evento a menos de 48 h: las devoluciones tienen que fallar
  const tomorrow = new Date(Date.now() + 24 * 3_600_000);
  await db.query(
    `INSERT INTO events (id, tenant_id, title, venue, starts_at, page_tsx, fee_cents, commission_bps)
     SELECT 'EV-FARO-0099', 'TN-FARO', 'Jam de mañana', venue, $1, page_tsx, 90, 750 FROM events WHERE id = 'EV-FARO-0042'`,
    [tomorrow],
  );
  await db.query(
    `INSERT INTO pass_types (id, event_id, name, description, price_cents, capacity)
     VALUES ('EV-FARO-0099-PIE', 'EV-FARO-0099', 'De pie', 'Jam session, sin butaca', 1200, 80)`,
  );
});

await pool.end();
console.log(`escenario cargado: ${ORDERS.length} pedidos PRU-* y el evento EV-FARO-0099 (mañana)`);
