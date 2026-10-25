// Cálculo de importes de un pedido. Todo en céntimos.

export interface PricedItem {
  kind: 'seat' | 'pass';
  ref: string; // id de butaca o de tipo de pase
  price_cents: number;
}

export interface EventPricing {
  fee_cents: number;
  commission_bps: number;
}

export interface TicketAmounts {
  price_cents: number;
  fee_cents: number;
  commission_cents: number;
}

export interface OrderAmounts {
  subtotal_cents: number;
  fee_cents: number;
  total_cents: number;
  commission_cents: number;
  lines: TicketAmounts[];
}

export const MAX_TICKETS_PER_ORDER = 10;

/** Comisión de plataforma de una entrada, redondeada por entrada (lo exige liquidaciones). */
export function ticketCommission(priceCents: number, commissionBps: number): number {
  return Math.round((priceCents * commissionBps) / 10_000);
}

/** Gastos, comisión y precio de una entrada. Las invitaciones (precio 0) no pagan gastos ni comisión. */
export function ticketAmounts(priceCents: number, ev: EventPricing): TicketAmounts {
  if (priceCents === 0) return { price_cents: 0, fee_cents: 0, commission_cents: 0 };
  return {
    price_cents: priceCents,
    fee_cents: ev.fee_cents,
    commission_cents: ticketCommission(priceCents, ev.commission_bps),
  };
}

const sum = (lines: TicketAmounts[], key: keyof TicketAmounts) => lines.reduce((acc, l) => acc + l[key], 0);

export function calcOrderAmounts(items: PricedItem[], ev: EventPricing): OrderAmounts {
  if (items.length === 0) throw new Error('pedido vacío');
  if (items.length > MAX_TICKETS_PER_ORDER) throw new Error(`máximo ${MAX_TICKETS_PER_ORDER} entradas por pedido`);
  const negative = items.find((it) => it.price_cents < 0);
  if (negative) throw new Error(`precio negativo en ${negative.ref}`);

  const lines = items.map((it) => ticketAmounts(it.price_cents, ev));
  const subtotal_cents = sum(lines, 'price_cents');
  const fee_cents = sum(lines, 'fee_cents');
  return {
    subtotal_cents,
    fee_cents,
    total_cents: subtotal_cents + fee_cents,
    commission_cents: sum(lines, 'commission_cents'),
    lines,
  };
}
