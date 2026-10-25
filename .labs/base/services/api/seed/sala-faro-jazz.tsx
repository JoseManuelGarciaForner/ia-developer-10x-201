import { Cart, Checkout, PassSelector, SeatPicker, formatDate, useEvent } from '@telon/ui';

// Página del evento de la Sala Faro. La edita el promotor desde el backoffice.
export default function JazzEnElFaro() {
  const event = useEvent();

  return (
    <main style={{ background: '#0b1d2e', color: '#f4efe6', minHeight: '100vh', fontFamily: 'Georgia, serif' }}>
      <header style={{ padding: '56px 24px 32px', textAlign: 'center', borderBottom: '1px solid #24425f' }}>
        <p style={{ letterSpacing: 4, textTransform: 'uppercase', color: '#f2b544', margin: 0 }}>Sala Faro presenta</p>
        <h1 style={{ fontSize: 56, margin: '12px 0' }}>{event.title}</h1>
        <p style={{ margin: 0 }}>{formatDate(event.starts_at)} · {event.venue}</p>
      </header>

      <section style={{ maxWidth: 1040, margin: '0 auto', padding: 24, display: 'grid', gap: 24, gridTemplateColumns: 'minmax(0, 2fr) minmax(280px, 1fr)' }}>
        <div>
          <h2>Elige tu butaca</h2>
          <SeatPicker />
          <h2>O entra de pie</h2>
          <PassSelector />
        </div>
        <aside>
          <Cart />
          <Checkout />
        </aside>
      </section>
    </main>
  );
}
