import { describe, expect, it } from 'vitest';
import { buildGateway } from '../src/gateway.js';

async function charge(app: ReturnType<typeof buildGateway>, card: string, amount = 1000) {
  const res = await app.inject({ method: 'POST', url: '/charges', payload: { amount_cents: amount, card, reference: 'PED-TEST' } });
  return { status: res.statusCode, body: res.json() };
}

describe('pasarela emulada', () => {
  it('aprueba la tarjeta 4242', async () => {
    const r = await charge(buildGateway(), '4242 4242 4242 4242');
    expect(r.status).toBe(201);
    expect(r.body.status).toBe('approved');
  });

  it('rechaza la tarjeta 0002 por fondos', async () => {
    const r = await charge(buildGateway(), '4000000000000002');
    expect(r.status).toBe(402);
    expect(r.body.reason).toBe('fondos insuficientes');
  });

  it('la tarjeta 9995 tarda pero aprueba', async () => {
    const r = await charge(buildGateway({ slowMs: 10 }), '4000000000009995');
    expect(r.body.status).toBe('approved');
  });

  it('no devuelve más de lo cobrado', async () => {
    const app = buildGateway();
    const c = await charge(app, '4242424242424242', 1000);
    const ok = await app.inject({ method: 'POST', url: '/refunds', payload: { charge_id: c.body.id, amount_cents: 600 } });
    expect(ok.statusCode).toBe(201);
    const ko = await app.inject({ method: 'POST', url: '/refunds', payload: { charge_id: c.body.id, amount_cents: 600 } });
    expect(ko.statusCode).toBe(409);
  });
});
