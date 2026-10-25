import { pool } from './db.js';
import type { EmailProvider, OutgoingEmail } from './providers/index.js';

/**
 * Envía un correo una sola vez por clave, aunque la cola reintente el trabajo.
 * 1. Reserva la clave en email_log (si ya existe, el correo ya salió: no se envía).
 * 2. Envía.
 * 3. Si el envío falla, libera la clave para que el reintento pueda enviarlo.
 */
export async function sendOnce(
  key: string,
  tenantId: string,
  provider: EmailProvider,
  email: OutgoingEmail,
  jobId?: string,
): Promise<'sent' | 'already-sent'> {
  const claim = await pool.query(
    `INSERT INTO email_log (tenant_id, provider, to_address, subject, job_id, dedupe_key)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (dedupe_key) DO NOTHING RETURNING id`,
    [tenantId, provider.name, email.to, email.subject, jobId ?? null, key],
  );
  if (claim.rowCount === 0) return 'already-sent';
  try {
    await provider.send(email);
  } catch (err) {
    await pool.query('DELETE FROM email_log WHERE dedupe_key = $1', [key]);
    throw err;
  }
  return 'sent';
}
