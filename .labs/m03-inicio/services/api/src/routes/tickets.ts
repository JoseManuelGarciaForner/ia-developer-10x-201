import type { FastifyInstance } from 'fastify';
import { config } from '../config.js';
import { pool } from '../db.js';
import { parseQrToken } from '../tickets/qr.js';

const STATUS_LABEL: Record<string, string> = { pending: 'sin pagar', void: 'anulada', refunded: 'devuelta' };

// Validación en puerta: el lector manda el contenido del QR.
export async function ticketRoutes(app: FastifyInstance) {
  app.post<{ Body: { token: string; event_id?: string } }>('/api/tickets/validate', async (req) => {
    const ticketId = parseQrToken(String(req.body?.token ?? ''), config.ticketsSecret);
    if (!ticketId) return { ok: false, reason: 'QR no válido' };
    const r = await pool.query(
      `SELECT t.id, t.event_id, t.status, t.seat_id, t.checked_in_at, pt.name AS pass_name
         FROM tickets t LEFT JOIN pass_types pt ON pt.id = t.pass_type_id WHERE t.id = $1`,
      [ticketId],
    );
    const ticket = r.rows[0];
    if (!ticket) return { ok: false, reason: 'entrada desconocida' };
    if (req.body.event_id && req.body.event_id !== ticket.event_id) return { ok: false, reason: 'entrada de otro evento' };
    if (ticket.status !== 'valid') return { ok: false, reason: `entrada ${STATUS_LABEL[ticket.status] ?? ticket.status}` };
    if (ticket.checked_in_at) return { ok: false, reason: 'entrada ya usada', checked_in_at: ticket.checked_in_at };
    await pool.query('UPDATE tickets SET checked_in_at = now() WHERE id = $1', [ticketId]);
    return { ok: true, ticket_id: ticket.id, seat: ticket.seat_id, pass: ticket.pass_name };
  });
}
