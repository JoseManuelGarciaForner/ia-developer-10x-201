import { describe, expect, it } from 'vitest';
import { ticketAmounts } from '../src/orders/pricing.js';
import { calcRefundAmounts, canRefundAt } from '../src/refunds/amounts.js';

// Entradas del pedido PED-2026-0107, con sus importes calculados como al comprarlas
const faro = { fee_cents: 90, commission_bps: 750 };
const ticket = (id: string, price: number) => ({ id, ...ticketAmounts(price, faro) });
const f12 = ticket('PED-2026-0107-1', 3550);
const f13 = ticket('PED-2026-0107-2', 3550);
const vip = ticket('PED-2026-0107-3', 6000);

describe('calcRefundAmounts', () => {
  it('devuelve el precio de las entradas y no los gastos de gestión', () => {
    expect(calcRefundAmounts([f13, vip]).amount_cents).toBe(9550);
  });

  it('revierte la comisión redondeada por entrada, no la del total', () => {
    // 3550 × 7,5 % = 266,25 → 266 por entrada. Dos entradas: 532 (sobre el total saldría 533)
    expect(calcRefundAmounts([f12, f13]).commission_reversed_cents).toBe(532);
  });

  it('la comisión revertida cuadra con la que se cobró', () => {
    const tickets = [f12, f13, vip];
    const charged = tickets.reduce((acc, t) => acc + t.commission_cents, 0);
    expect(calcRefundAmounts(tickets).commission_reversed_cents).toBe(charged);
  });

  it('una invitación no devuelve nada', () => {
    expect(calcRefundAmounts([ticket('INV-1', 0)])).toEqual({ amount_cents: 0, commission_reversed_cents: 0 });
  });
});

describe('canRefundAt', () => {
  const event = new Date('2026-11-14T20:00:00Z');

  it('permite devolver con más de 48 h de margen', () => {
    expect(canRefundAt(event, new Date('2026-11-10T20:00:00Z'))).toBe(true);
  });

  it('permite devolver justo a 48 h', () => {
    expect(canRefundAt(event, new Date('2026-11-12T20:00:00Z'))).toBe(true);
  });

  it('no permite devolver el día antes', () => {
    expect(canRefundAt(event, new Date('2026-11-13T20:00:00Z'))).toBe(false);
  });
});
