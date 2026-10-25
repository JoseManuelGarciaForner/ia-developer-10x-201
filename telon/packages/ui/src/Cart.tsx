import { useCart } from './context.js';
import { formatEuros } from './format.js';
import { box, muted } from './styles.js';

/** Resumen del carrito con los gastos de gestión. */
export function Cart() {
  const cart = useCart();
  return (
    <div style={box} data-telon="cart">
      <h3 style={{ marginTop: 0 }}>Tu selección</h3>
      {cart.lines.length === 0 && <p style={muted}>Todavía no has elegido entradas.</p>}
      {cart.lines.map((l) => (
        <div key={l.key} style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>{l.quantity > 1 ? `${l.quantity} × ` : ''}{l.label}</span>
          <span>{formatEuros(l.price_cents * l.quantity)}</span>
        </div>
      ))}
      {cart.lines.length > 0 && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', ...muted, marginTop: 8 }}>
            <span>Gastos de gestión</span>
            <span>{formatEuros(cart.fee_cents)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginTop: 8 }}>
            <span>Total</span>
            <span>{formatEuros(cart.total_cents)}</span>
          </div>
        </>
      )}
    </div>
  );
}
