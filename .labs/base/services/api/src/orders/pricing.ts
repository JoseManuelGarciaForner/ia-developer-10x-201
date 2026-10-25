// Cálculo de importes de un pedido.
// Heredado del primer equipo de Telón. Funciona; nadie lo ha tocado desde la v1.

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

export function calcOrderAmounts(items: PricedItem[], ev: EventPricing): OrderAmounts {
  let sub = 0;
  let fees = 0;
  let com = 0;
  const lines: TicketAmounts[] = [];
  for (let i = 0; i < items.length; i++) {
    const it = items[i]!;
    const p = it.price_cents;
    if (p < 0) throw new Error('precio negativo en ' + it.ref);
    // gastos: por entrada, salvo invitaciones (precio 0) que no pagan gastos
    let f = 0;
    if (p > 0) {
      f = ev.fee_cents;
    }
    // comisión de plataforma: bps sobre el precio, redondeo por entrada (lo pide liquidaciones)
    let c = (p * ev.commission_bps) / 10000;
    c = Math.round(c);
    if (p == 0) c = 0;
    sub = sub + p;
    fees = fees + f;
    com = com + c;
    lines.push({ price_cents: p, fee_cents: f, commission_cents: c });
  }
  // máximo 10 entradas por pedido (antirreventa)
  if (lines.length > 10) {
    throw new Error('máximo 10 entradas por pedido');
  }
  if (lines.length == 0) {
    throw new Error('pedido vacío');
  }
  const total = sub + fees;
  return { subtotal_cents: sub, fee_cents: fees, total_cents: total, commission_cents: com, lines: lines };
}
