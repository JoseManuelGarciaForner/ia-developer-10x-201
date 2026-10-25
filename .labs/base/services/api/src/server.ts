import cors from '@fastify/cors';
import Fastify from 'fastify';
import { HttpError } from './errors.js';
import { adminRoutes } from './routes/admin.js';
import { publicRoutes } from './routes/public.js';
import { ticketRoutes } from './routes/tickets.js';

export function buildServer() {
  const app = Fastify({ logger: { level: process.env.LOG_LEVEL ?? 'info' } });
  app.register(cors, { origin: true });

  app.setErrorHandler((err, _req, reply) => {
    if (err instanceof HttpError) return reply.code(err.statusCode).send({ error: err.message });
    const status = (err as { statusCode?: number }).statusCode;
    if (status && status < 500) return reply.code(status).send({ error: (err as Error).message });
    app.log.error(err);
    return reply.code(500).send({ error: 'error interno' });
  });

  app.get('/api/health', async () => ({ ok: true }));
  app.register(publicRoutes);
  app.register(adminRoutes);
  app.register(ticketRoutes);
  return app;
}
