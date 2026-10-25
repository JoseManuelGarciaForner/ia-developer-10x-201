import { describe, expect, it } from 'vitest';
import { calcOrderAmounts } from '../src/orders/pricing.js';

const faro = { fee_cents: 90, commission_bps: 750 };

describe('calcOrderAmounts', () => {
  it('suma precio y gastos de gestión por entrada', () => {
    const r = calcOrderAmounts(
      [
        { kind: 'seat', ref: 'F-12', price_cents: 3550 },
        { kind: 'seat', ref: 'F-13', price_cents: 3550 },
        { kind: 'pass', ref: 'EV-FARO-0042-VIP', price_cents: 6000 },
      ],
      faro,
    );
    expect(r.subtotal_cents).toBe(13100);
    expect(r.fee_cents).toBe(270);
    expect(r.total_cents).toBe(13370);
  });

  it('calcula la comisión de plataforma', () => {
    const r = calcOrderAmounts([{ kind: 'pass', ref: 'VIP', price_cents: 6000 }], faro);
    expect(r.commission_cents).toBe(450);
  });

  it('las invitaciones no pagan gastos ni comisión', () => {
    const r = calcOrderAmounts([{ kind: 'seat', ref: 'A-1', price_cents: 0 }], faro);
    expect(r.total_cents).toBe(0);
    expect(r.commission_cents).toBe(0);
  });

  it('rechaza más de 10 entradas', () => {
    const items = Array.from({ length: 11 }, (_, i) => ({ kind: 'seat' as const, ref: `A-${i + 1}`, price_cents: 2500 }));
    expect(() => calcOrderAmounts(items, faro)).toThrow('máximo 10');
  });

  it('rechaza un pedido vacío', () => {
    expect(() => calcOrderAmounts([], faro)).toThrow('vacío');
  });
});
