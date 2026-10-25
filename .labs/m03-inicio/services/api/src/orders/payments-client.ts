import { config } from '../config.js';
import { HttpError } from '../errors.js';

export interface ChargeResult {
  id: string;
  status: 'approved' | 'declined';
  reason?: string;
}

// Cliente de la pasarela. En el curso es services/payments (emulada).
export async function charge(amountCents: number, card: string, reference: string): Promise<ChargeResult> {
  const res = await fetch(`${config.paymentsUrl}/charges`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ amount_cents: amountCents, card, reference }),
  });
  if (!res.ok && res.status !== 402) {
    throw new Error(`pasarela: HTTP ${res.status}`);
  }
  return (await res.json()) as ChargeResult;
}

export interface RefundResult {
  id: string;
  status: 'approved';
}

export async function refund(chargeId: string, amountCents: number): Promise<RefundResult> {
  const res = await fetch(`${config.paymentsUrl}/refunds`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ charge_id: chargeId, amount_cents: amountCents }),
  });
  if (!res.ok) throw new HttpError(502, `la pasarela no ha podido hacer la devolución (HTTP ${res.status})`);
  return (await res.json()) as RefundResult;
}
