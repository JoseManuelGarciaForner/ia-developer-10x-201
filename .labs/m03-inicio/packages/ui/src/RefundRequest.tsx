import { useState } from 'react';
import type { BuyerOrder, RefundResult, TelonApi } from './api.js';
import { formatEuros } from './format.js';
import { box, button, muted } from './styles.js';

export interface RefundRequestProps {
  api: TelonApi;
  order: BuyerOrder;
  /** Se llama tras una devolución correcta, para recargar el pedido. */
  onRefunded?: (refund: RefundResult) => void;
}

/** El comprador elige qué entradas válidas de su pedido devuelve. */
export function RefundRequest({ api, order, onRefunded }: RefundRequestProps) {
  const refundable = order.tickets.filter((t) => t.status === 'valid');
  const [selected, setSelected] = useState<string[]>([]);
  const [state, setState] = useState<{ status: 'idle' | 'sending' | 'done' | 'error'; message?: string }>({
    status: 'idle',
  });

  if (refundable.length === 0) return null;

  const toggle = (id: string) =>
    setSelected((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  const amount = refundable.filter((t) => selected.includes(t.id)).reduce((acc, t) => acc + t.price_cents, 0);

  async function submit() {
    setState({ status: 'sending' });
    try {
      const refund = await api.refund(order.id, order.buyer_email, selected);
      setSelected([]);
      setState({ status: 'done', message: `Devolución ${refund.id}: ${formatEuros(refund.amount_cents)}` });
      onRefunded?.(refund);
    } catch (err) {
      setState({ status: 'error', message: (err as Error).message });
    }
  }

  return (
    <div style={box} data-telon="refund-request">
      <h3 style={{ marginTop: 0 }}>Devolver entradas</h3>
      {refundable.map((t) => (
        <label key={t.id} style={{ display: 'block', padding: '4px 0' }}>
          <input type="checkbox" checked={selected.includes(t.id)} onChange={() => toggle(t.id)} />{' '}
          {t.seat_id ? `Butaca ${t.seat_id}` : `Pase ${t.pass_name}`} · {formatEuros(t.price_cents)}
        </label>
      ))}
      <p style={muted}>Se devuelve el precio de la entrada; los gastos de gestión no. Hasta 48 h antes del evento.</p>
      {state.message && <p role={state.status === 'error' ? 'alert' : 'status'}>{state.message}</p>}
      <button style={button} type="button" disabled={selected.length === 0 || state.status === 'sending'} onClick={submit}>
        {selected.length === 0 ? 'Elige qué entradas devolver' : `Devolver ${formatEuros(amount)}`}
      </button>
    </div>
  );
}
