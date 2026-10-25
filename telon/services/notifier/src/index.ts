import { Worker } from 'bullmq';
import { Redis } from 'ioredis';
import { config } from './config.js';
import { pool } from './db.js';
import { handle, type EmailJob } from './jobs.js';

const connection = new Redis(config.redisUrl, { maxRetriesPerRequest: null });

const worker = new Worker<EmailJob>(
  'emails',
  async (job) => {
    console.log(`→ ${job.name} #${job.id} (intento ${job.attemptsMade + 1})`);
    await handle(job.data, job.id);
  },
  { connection, concurrency: 4 },
);

worker.on('completed', (job) => console.log(`✓ ${job.name} #${job.id}`));
worker.on('failed', (job, err) => console.error(`✗ ${job?.name} #${job?.id}: ${err.message}`));
console.log(`notifier escuchando la cola «emails» · enlaces a ${config.storefrontUrl}`);

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, async () => {
    await worker.close();
    await pool.end();
    process.exit(0);
  });
}
