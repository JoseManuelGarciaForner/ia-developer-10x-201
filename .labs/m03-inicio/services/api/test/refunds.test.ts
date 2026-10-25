import { describe, expect, it } from 'vitest';
import { calcRefundAmounts, canRefundAt } from '../src/refunds/amounts.js';

const faro = { fee_cents: 90, commission_bps: 750 };
const f13 = { id: 'PED-2026-0107-2', price_cents: 3550, fee_cents: 90, commission_cents: 266 };
const vip = { id: 'PED-2026-0107-3', price_cents: 6000, fee_cents: 90, commission_cents: 450 };

describe('calcRefundAmounts', () => {
  it('devuelve el precio de la entrada', () => {
    expect(calcRefundAmounts([f13], faro).amount_cents).toBe(3550);
  });

  it('no devuelve los gastos de gestión', () => {
    const r = calcRefundAmounts([f13, vip], faro);
    expect(r.amount_cents).toBe(9550);
  });

  it('revierte la comisión', () => {
    expect(calcRefundAmounts([vip], faro).commission_reversed_cents).toBe(450);
  });
});

describe('canRefundAt', () => {
  const event = new Date('2026-11-14T20:00:00Z');

  it('permite devolver con más de 48 h de margen', () => {
    expect(canRefundAt(event, new Date('2026-11-10T20:00:00Z'))).toBe(true);
  });

  it('no permite devolver el día antes', () => {
    expect(canRefundAt(event, new Date('2026-11-13T20:00:00Z'))).toBe(false);
  });
});
