// Borra la base de datos de Telón y la deja con los datos de ejemplo.
import { config } from '../config.js';
import { migrate, pool } from '../db.js';
import { seedIfEmpty } from '../seed.js';

await pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
await migrate();
await seedIfEmpty();
await pool.end();

// La pasarela emulada guarda sus cargos aparte: se vacía también para que cuadre con la base de datos
try {
  await fetch(`${config.paymentsUrl}/_reset`, { method: 'POST' });
} catch {
  console.log('(la pasarela no está arrancada; se vaciará al arrancar sin datos)');
}
console.log('base de datos reiniciada con los datos de ejemplo');
