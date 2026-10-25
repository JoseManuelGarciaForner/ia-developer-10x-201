import { readFile } from 'node:fs/promises';
import { config } from './config.js';
import { pool, withTransaction } from './db.js';
import { createQrToken } from './tickets/qr.js';

// Datos de ejemplo del curso. Se cargan solo si la base de datos está vacía.
// Los tokens de backoffice son de desarrollo: identifican al promotor en local.

const seedFile = (name: string) => readFile(new URL(`../seed/${name}`, import.meta.url), 'utf8');

export async function seedIfEmpty(): Promise<boolean> {
  const { rows } = await pool.query('SELECT count(*)::int AS n FROM tenants');
  if (rows[0].n > 0) return false;

  const faroPage = await seedFile('sala-faro-jazz.tsx');
  const lumenPage = await seedFile('teatro-lumen-impro.tsx');

  await withTransaction(async (db) => {
    await db.query(
      `INSERT INTO tenants (id, slug, name, admin_token, email_provider, email_from, email_config) VALUES
         ('TN-FARO', 'sala-faro', 'Sala Faro', 'faro-dev-token', 'smtp', 'entradas@salafaro.test', '{}'),
         ('TN-LUMEN', 'teatro-lumen', 'Teatro Lumen', 'lumen-dev-token', 'sendgrid', 'taquilla@teatrolumen.test',
          '{"apiKey": "SG.ejemplo-no-real.0000000000"}')`,
    );
    await db.query(
      `INSERT INTO domains (host, tenant_id) VALUES
         ('entradas.salafaro.localhost', 'TN-FARO'),
         ('entradas.teatrolumen.localhost', 'TN-LUMEN')`,
    );
    await db.query(
      `INSERT INTO events (id, tenant_id, title, venue, starts_at, page_tsx, fee_cents, commission_bps) VALUES
         ('EV-FARO-0042', 'TN-FARO', 'Jazz en el Faro', 'Sala Faro, A Coruña', '2026-11-14T21:00:00+01:00', $1, 90, 750),
         ('EV-LUMEN-0007', 'TN-LUMEN', 'Impro a la carta', 'Teatro Lumen, Madrid', '2026-11-21T20:30:00+01:00', $2, 75, 750)`,
      [faroPage, lumenPage],
    );
    await db.query(
      `INSERT INTO pass_types (id, event_id, name, description, price_cents, capacity) VALUES
         ('EV-FARO-0042-PIE', 'EV-FARO-0042', 'De pie', 'Zona de barra, sin butaca', 1800, 150),
         ('EV-FARO-0042-VIP', 'EV-FARO-0042', 'VIP', 'Barra libre y encuentro con la banda', 6000, 20),
         ('EV-LUMEN-0007-GEN', 'EV-LUMEN-0007', 'General', 'Entrada libre hasta completar aforo', 1500, 120)`,
    );
    // 300 butacas: platea A–J a 35,50 € y anfiteatro K–O a 24,00 €
    const rows = 'ABCDEFGHIJKLMNO'.split('');
    const values: string[] = [];
    for (const row of rows) {
      const zone = row <= 'J' ? 'platea' : 'anfiteatro';
      const price = zone === 'platea' ? 3550 : 2400;
      for (let n = 1; n <= 20; n++) values.push(`('EV-FARO-0042', '${row}-${n}', '${zone}', '${row}', ${n}, ${price})`);
    }
    await db.query(`INSERT INTO seats (event_id, id, zone, row_label, number, price_cents) VALUES ${values.join(',')}`);

    // El pedido que recorre el curso: dos butacas de platea y un pase VIP, ya pagado.
    await db.query(
      `INSERT INTO orders (id, tenant_id, event_id, buyer_email, status, subtotal_cents, fee_cents, total_cents,
                           commission_cents, charge_id, created_at, paid_at)
       VALUES ('PED-2026-0107', 'TN-FARO', 'EV-FARO-0042', 'ana.compradora@ejemplo.test', 'paid',
               13100, 270, 13370, 982, 'ch_seed_0107', '2026-10-02T18:41:00+02:00', '2026-10-02T18:42:00+02:00')`,
    );
    const tickets = [
      ['PED-2026-0107-1', 'seat', 'F-12', null, 3550, 266],
      ['PED-2026-0107-2', 'seat', 'F-13', null, 3550, 266],
      ['PED-2026-0107-3', 'pass', null, 'EV-FARO-0042-VIP', 6000, 450],
    ] as const;
    for (const [id, kind, seat, pass, price, commission] of tickets) {
      await db.query(
        `INSERT INTO tickets (id, order_id, event_id, kind, seat_id, pass_type_id, price_cents, fee_cents,
                              commission_cents, status, qr_token)
         VALUES ($1, 'PED-2026-0107', 'EV-FARO-0042', $2, $3, $4, $5, 90, $6, 'valid', $7)`,
        [id, kind, seat, pass, price, commission, createQrToken(id, config.ticketsSecret)],
      );
    }
  });
  return true;
}
