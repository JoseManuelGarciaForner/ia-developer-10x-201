import { Cart, Checkout, PassSelector, formatDate, useEvent } from '@telon/ui';

export default function ImproLumen() {
  const event = useEvent();
  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: 32, fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ color: '#b0306a' }}>{event.title}</h1>
      <p>{formatDate(event.starts_at)} — {event.venue}</p>
      <p>Una hora de improvisación con lo que el público proponga. Sin butacas numeradas.</p>
      <PassSelector />
      <Cart />
      <Checkout />
    </main>
  );
}
