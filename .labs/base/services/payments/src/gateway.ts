import { randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import Fastify from 'fastify';

// Pasarela de pago emulada. Se comporta según la tarjeta de prueba:
//   4242 4242 4242 4242  aprueba
//   4000 0000 0000 0002  rechaza (fondos insuficientes)
//   4000 0000 0000 9995  aprueba tras 3 s (pasarela lenta)
// Cualquier otra tarjeta se rechaza como «tarjeta no válida».

export interface Charge {
  id: string;
  amount_cents: number;
  reference: string;
  status: 'approved' | 'declined';
  reason?: string;
  refunded_cents: number;
  created_at: string;
}

export interface Refund {
  id: string;
  charge_id: string;
  amount_cents: number;
  status: 'approved';
  created_at: string;
}

const newId = (prefix: string) => `${prefix}_${randomBytes(8).toString('hex')}`;

// Cargo del pedido de ejemplo PED-2026-0107 (lo crea el seed de la API)
const SEED_CHARGES: Charge[] = [
  {
    id: 'ch_seed_0107',
    amount_cents: 13370,
    reference: 'PED-2026-0107',
    status: 'approved',
    refunded_cents: 0,
    created_at: '2026-10-02T16:42:00.000Z',
  },
];

export interface GatewayOptions {
  slowMs?: number;
  /** Fichero donde se guardan cargos y devoluciones entre reinicios. Sin él, todo vive en memoria. */
  dataFile?: string;
}

export function buildGateway(opts: GatewayOptions = {}) {
  const slowMs = opts.slowMs ?? 3000;
  const charges = new Map<string, Charge>(SEED_CHARGES.map((c) => [c.id, { ...c }]));
  const refunds = new Map<string, Refund>();

  if (opts.dataFile && existsSync(opts.dataFile)) {
    const saved = JSON.parse(readFileSync(opts.dataFile, 'utf8')) as { charges: Charge[]; refunds: Refund[] };
    for (const c of saved.charges) charges.set(c.id, c);
    for (const r of saved.refunds) refunds.set(r.id, r);
  }
  const persist = () => {
    if (!opts.dataFile) return;
    mkdirSync(dirname(opts.dataFile), { recursive: true });
    writeFileSync(opts.dataFile, JSON.stringify({ charges: [...charges.values()], refunds: [...refunds.values()] }, null, 2));
  };
  const app = Fastify({ logger: { level: process.env.LOG_LEVEL ?? 'info' } });

  app.get('/health', async () => ({ ok: true }));

  // Solo para el curso: lo llama `npm run db:reset` para empezar con la pasarela limpia
  app.post('/_reset', async () => {
    charges.clear();
    refunds.clear();
    for (const c of SEED_CHARGES) charges.set(c.id, { ...c });
    persist();
    return { reset: true };
  });

  app.post<{ Body: { amount_cents: number; card: string; reference: string } }>('/charges', async (req, reply) => {
    const { amount_cents, card, reference } = req.body ?? ({} as never);
    if (!Number.isInteger(amount_cents) || amount_cents < 0) {
      return reply.code(400).send({ error: 'amount_cents debe ser un entero positivo' });
    }
    const digits = String(card ?? '').replace(/\D/g, '');
    let status: Charge['status'] = 'approved';
    let reason: string | undefined;
    if (digits === '4000000000009995') {
      await new Promise((r) => setTimeout(r, slowMs));
    } else if (digits === '4000000000000002') {
      status = 'declined';
      reason = 'fondos insuficientes';
    } else if (digits !== '4242424242424242') {
      status = 'declined';
      reason = 'tarjeta no válida';
    }
    const charge: Charge = {
      id: newId('ch'),
      amount_cents,
      reference: String(reference ?? ''),
      status,
      reason,
      refunded_cents: 0,
      created_at: new Date().toISOString(),
    };
    charges.set(charge.id, charge);
    persist();
    return reply.code(status === 'approved' ? 201 : 402).send(charge);
  });

  app.get<{ Params: { id: string } }>('/charges/:id', async (req, reply) => {
    const charge = charges.get(req.params.id);
    if (!charge) return reply.code(404).send({ error: 'cargo no encontrado' });
    return charge;
  });

  // Devoluciones: total o parcial, nunca más de lo cobrado.
  app.post<{ Body: { charge_id: string; amount_cents: number } }>('/refunds', async (req, reply) => {
    const { charge_id, amount_cents } = req.body ?? ({} as never);
    const charge = charges.get(charge_id);
    if (!charge) return reply.code(404).send({ error: 'cargo no encontrado' });
    if (charge.status !== 'approved') return reply.code(409).send({ error: 'el cargo no está aprobado' });
    if (!Number.isInteger(amount_cents) || amount_cents <= 0) {
      return reply.code(400).send({ error: 'amount_cents debe ser un entero mayor que cero' });
    }
    if (charge.refunded_cents + amount_cents > charge.amount_cents) {
      return reply.code(409).send({ error: 'la devolución supera lo cobrado' });
    }
    charge.refunded_cents += amount_cents;
    const refund: Refund = {
      id: newId('re'),
      charge_id,
      amount_cents,
      status: 'approved',
      created_at: new Date().toISOString(),
    };
    refunds.set(refund.id, refund);
    persist();
    return reply.code(201).send(refund);
  });

  return app;
}
