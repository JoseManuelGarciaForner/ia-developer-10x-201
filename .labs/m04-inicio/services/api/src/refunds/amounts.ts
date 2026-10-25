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

/**
 * Importe a devolver al comprador y comisión que se revierte. Los gastos de gestión no se devuelven.
 * La comisión revertida es la suma de la que se cobró por cada entrada (redondeo por entrada),
 * no la comisión del total: si no, liquidaciones no cuadra por céntimos.
 */
export function calcRefundAmounts(tickets: RefundableTicket[]): RefundAmounts {
  return {
    amount_cents: tickets.reduce((acc, t) => acc + t.price_cents, 0),
    commission_reversed_cents: tickets.reduce((acc, t) => acc + t.commission_cents, 0),
  };
}

export const REFUND_DEADLINE_HOURS = 48;

export function canRefundAt(eventStartsAt: Date, now: Date): boolean {
  return eventStartsAt.getTime() - now.getTime() >= REFUND_DEADLINE_HOURS * 3_600_000;
}
