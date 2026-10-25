// Imprime el contenido del QR de una entrada, esté como esté (npm run qr -- PED-2026-0107-2).
// Sirve para probar la validación en puerta sin escanear nada.
import { config } from '../config.js';
import { pool } from '../db.js';
import { createQrToken } from '../tickets/qr.js';

const ticketId = process.argv[2];
if (!ticketId) {
  console.error('Uso: npm run qr -- <id de entrada>   (p. ej. PED-2026-0107-2)');
  process.exit(1);
}
const r = await pool.query('SELECT status FROM tickets WHERE id = $1', [ticketId]);
await pool.end();
if (!r.rows[0]) {
  console.error(`No existe la entrada ${ticketId}`);
  process.exit(1);
}
console.log(createQrToken(ticketId, config.ticketsSecret));
