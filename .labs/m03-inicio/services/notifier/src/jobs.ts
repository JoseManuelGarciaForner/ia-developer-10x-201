import QRCode from 'qrcode';
import { config } from './config.js';
import { pool } from './db.js';
import { providerFor } from './providers/index.js';
import { orderConfirmedEmail, refundConfirmedEmail } from './templates.js';

export type EmailJob =
  | { type: 'order-confirmed'; orderId: string }
  | { type: 'refund-confirmed'; refundId: string }
  | { type: 'test-email'; tenantId: string; to: string };

async function loadTenant(tenantId: string) {
  const r = await pool.query(
    'SELECT id, slug, name, email_provider, email_from, email_config FROM tenants WHERE id = $1',
    [tenantId],
  );
  if (!r.rows[0]) throw new Error(`promotor ${tenantId} no encontrado`);
  return r.rows[0];
}

async function logEmail(tenantId: string, provider: string, to: string, subject: string, jobId?: string) {
  await pool.query(
    'INSERT INTO email_log (tenant_id, provider, to_address, subject, job_id) VALUES ($1, $2, $3, $4, $5)',
    [tenantId, provider, to, subject, jobId ?? null],
  );
}

export async function sendOrderConfirmed(orderId: string, jobId?: string) {
  const o = await pool.query(
    `SELECT o.id, o.tenant_id, o.buyer_email, o.total_cents, e.title, e.venue, e.starts_at
       FROM orders o JOIN events e ON e.id = o.event_id WHERE o.id = $1 AND o.status = 'paid'`,
    [orderId],
  );
  const order = o.rows[0];
  if (!order) throw new Error(`pedido ${orderId} no está pagado`);
  const tenant = await loadTenant(order.tenant_id);
  const t = await pool.query(
    `SELECT t.id, t.seat_id, t.qr_token, pt.name AS pass_name
       FROM tickets t LEFT JOIN pass_types pt ON pt.id = t.pass_type_id
      WHERE t.order_id = $1 AND t.status = 'valid' ORDER BY t.id`,
    [orderId],
  );

  const attachments = [];
  const tickets = [];
  for (const ticket of t.rows) {
    const cid = `qr-${ticket.id}@telon`;
    attachments.push({ filename: `${ticket.id}.png`, content: await QRCode.toBuffer(ticket.qr_token, { width: 320 }), cid });
    tickets.push({ id: ticket.id, label: ticket.seat_id ? `Butaca ${ticket.seat_id}` : `Pase ${ticket.pass_name}`, cid });
  }

  const ticketsUrl = `${config.storefrontUrl}/t/${tenant.slug}/mis-entradas?pedido=${order.id}&email=${encodeURIComponent(order.buyer_email)}`;
  const email = orderConfirmedEmail({
    tenantName: tenant.name,
    orderId: order.id,
    eventTitle: order.title,
    venue: order.venue,
    startsAt: order.starts_at,
    totalCents: order.total_cents,
    ticketsUrl,
    tickets,
  });

  const provider = providerFor(tenant.email_provider, tenant.email_config);
  await provider.send({ from: tenant.email_from, to: order.buyer_email, ...email, attachments });
  await logEmail(tenant.id, provider.name, order.buyer_email, email.subject, jobId);
}

export async function sendRefundConfirmed(refundId: string, jobId?: string) {
  const r = await pool.query(
    `SELECT r.id, r.order_id, r.tenant_id, r.amount_cents, o.buyer_email, e.title
       FROM refunds r JOIN orders o ON o.id = r.order_id JOIN events e ON e.id = o.event_id
      WHERE r.id = $1`,
    [refundId],
  );
  const refund = r.rows[0];
  if (!refund) throw new Error(`devolución ${refundId} no encontrada`);
  const tenant = await loadTenant(refund.tenant_id);
  const t = await pool.query(
    `SELECT t.id, t.seat_id, pt.name AS pass_name
       FROM refund_tickets rt JOIN tickets t ON t.id = rt.ticket_id
       LEFT JOIN pass_types pt ON pt.id = t.pass_type_id
      WHERE rt.refund_id = $1 ORDER BY t.id`,
    [refundId],
  );
  const email = refundConfirmedEmail({
    tenantName: tenant.name,
    refundId: refund.id,
    orderId: refund.order_id,
    eventTitle: refund.title,
    amountCents: refund.amount_cents,
    tickets: t.rows.map((x) => (x.seat_id ? `Butaca ${x.seat_id}` : `Pase ${x.pass_name}`)),
  });
  const provider = providerFor(tenant.email_provider, tenant.email_config);
  await provider.send({ from: tenant.email_from, to: refund.buyer_email, ...email });
  await logEmail(tenant.id, provider.name, refund.buyer_email, email.subject, jobId);
}

export async function sendTestEmail(tenantId: string, to: string, jobId?: string) {
  const tenant = await loadTenant(tenantId);
  const provider = providerFor(tenant.email_provider, tenant.email_config);
  const subject = `Prueba de envío de ${tenant.name}`;
  await provider.send({
    from: tenant.email_from,
    to,
    subject,
    text: `Si lees esto, ${provider.name} está bien configurado para ${tenant.name}.`,
    html: `<p>Si lees esto, <strong>${provider.name}</strong> está bien configurado para ${tenant.name}.</p>`,
  });
  await logEmail(tenant.id, provider.name, to, subject, jobId);
}

export async function handle(job: EmailJob, jobId?: string) {
  switch (job.type) {
    case 'order-confirmed':
      return sendOrderConfirmed(job.orderId, jobId);
    case 'refund-confirmed':
      return sendRefundConfirmed(job.refundId, jobId);
    case 'test-email':
      return sendTestEmail(job.tenantId, job.to, jobId);
    default:
      throw new Error(`trabajo de correo desconocido: ${JSON.stringify(job)}`);
  }
}
