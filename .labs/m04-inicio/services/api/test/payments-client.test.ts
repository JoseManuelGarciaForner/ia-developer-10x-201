import { afterEach, describe, expect, it, vi } from 'vitest';
import { HttpError } from '../src/errors.js';
import { charge, refund } from '../src/orders/payments-client.js';

// La pasarela se simula sustituyendo fetch: el test no necesita services/payments arrancado.
function mockGateway(status: number, body: unknown) {
  const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status }));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

afterEach(() => vi.unstubAllGlobals());

describe('cliente de la pasarela', () => {
  it('manda el importe en céntimos y la referencia del pedido', async () => {
    const fetchMock = mockGateway(201, { id: 'ch_1', status: 'approved' });
    await charge(13370, '4242424242424242', 'PED-2026-0107');
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toMatch(/\/charges$/);
    expect(JSON.parse(init.body)).toEqual({ amount_cents: 13370, card: '4242424242424242', reference: 'PED-2026-0107' });
  });

  it('un rechazo (402) no es una excepción: se devuelve el motivo', async () => {
    mockGateway(402, { id: 'ch_2', status: 'declined', reason: 'fondos insuficientes' });
    await expect(charge(1000, '4000000000000002', 'PED-X')).resolves.toMatchObject({ status: 'declined' });
  });

  it('si la pasarela no puede devolver, la API responde 502', async () => {
    mockGateway(409, { error: 'la devolución supera lo cobrado' });
    const err = await refund('ch_1', 99999).catch((e) => e);
    expect(err).toBeInstanceOf(HttpError);
    expect(err.statusCode).toBe(502);
  });
});
