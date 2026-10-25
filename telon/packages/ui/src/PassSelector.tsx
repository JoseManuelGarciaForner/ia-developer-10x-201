import { useTelon } from './context.js';
import { formatEuros } from './format.js';
import { box, muted } from './styles.js';

/** Pases sin butaca (de pie, VIP…). El comprador elige cuántos de cada uno. */
export function PassSelector() {
  const { event, cart, setPassQuantity } = useTelon();
  if (event.passes.length === 0) return null;

  return (
    <div style={box} data-telon="pass-selector">
      {event.passes.map((p) => {
        const inCart = cart.find((l) => l.key === `pass:${p.id}`)?.quantity ?? 0;
        return (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' }}>
            <div style={{ flex: 1 }}>
              <strong>{p.name}</strong> · {formatEuros(p.price_cents)}
              <div style={muted}>{p.description}{p.available < 10 ? ` · quedan ${p.available}` : ''}</div>
            </div>
            <button type="button" aria-label={`Quitar un pase ${p.name}`} onClick={() => setPassQuantity(p.id, inCart - 1)} disabled={inCart === 0}>−</button>
            <span aria-label={`Pases ${p.name}`} style={{ minWidth: 20, textAlign: 'center' }}>{inCart}</span>
            <button type="button" aria-label={`Añadir un pase ${p.name}`} onClick={() => setPassQuantity(p.id, inCart + 1)} disabled={p.available <= inCart}>+</button>
          </div>
        );
      })}
    </div>
  );
}
