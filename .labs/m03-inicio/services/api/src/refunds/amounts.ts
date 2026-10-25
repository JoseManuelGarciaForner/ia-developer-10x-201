import type { EventPricing } from '../orders/pricing.js';

export interface RefundableTicket {
  id: string;
  price_cents: number;
  fee_cents: number;
  commission_cents: number;
}

export interface RefundAmounts {
  amount_cents: number;
  commission_reversed_cents: number;
}

/** Importe a devolver al comprador y comisión que se revierte. Los gastos de gestión no se devuelven. */
export function calcRefundAmounts(tickets: RefundableTicket[], ev: EventPricing): RefundAmounts {
  const amount = tickets.reduce((acc, t) => acc + t.price_cents, 0);
  return {
    amount_cents: amount,
    commission_reversed_cents: Math.round((amount * ev.commission_bps) / 10_000),
  };
}

export const REFUND_DEADLINE_HOURS = 48;

export function canRefundAt(eventStartsAt: Date, now: Date): boolean {
  return eventStartsAt.getTime() - now.getTime() >= REFUND_DEADLINE_HOURS * 3_600_000;
}
