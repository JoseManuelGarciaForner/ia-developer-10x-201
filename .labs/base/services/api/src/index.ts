import { config } from './config.js';
import { migrate, pool } from './db.js';
import { seedIfEmpty } from './seed.js';
import { buildServer } from './server.js';

const applied = await migrate();
if (applied.length) console.log('migraciones aplicadas:', applied.join(', '));
if (await seedIfEmpty()) console.log('datos de ejemplo cargados (Sala Faro, Teatro Lumen)');

const app = buildServer();
await app.listen({ port: config.port, host: '0.0.0.0' });

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, async () => {
    await app.close();
    await pool.end();
    process.exit(0);
  });
}
