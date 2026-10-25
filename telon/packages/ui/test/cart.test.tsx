import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import type { EventInfo, TelonApi } from '../src/api.js';
import { Cart, PassSelector, TelonProvider } from '../src/index.js';

const event: EventInfo = {
  id: 'EV-FARO-0042',
  title: 'Jazz en el Faro',
  venue: 'Sala Faro',
  starts_at: '2026-11-14T20:00:00Z',
  fee_cents: 90,
  page_tsx: '',
  zones: [],
  passes: [{ id: 'EV-FARO-0042-VIP', name: 'VIP', description: '', price_cents: 6000, available: 2 }],
};

afterEach(cleanup);

function renderShop() {
  return render(
    <TelonProvider api={{} as TelonApi} event={event}>
      <PassSelector />
      <Cart />
    </TelonProvider>,
  );
}

describe('carrito', () => {
  it('suma los gastos de gestión por entrada', () => {
    renderShop();
    act(() => screen.getByLabelText('Añadir un pase VIP').click());
    act(() => screen.getByLabelText('Añadir un pase VIP').click());
    expect(screen.getByText('Total').nextSibling?.textContent).toMatch(/^121,80\s€$/);
  });

  it('no deja añadir más pases de los disponibles', () => {
    renderShop();
    for (let i = 0; i < 3; i++) act(() => screen.getByLabelText('Añadir un pase VIP').click());
    expect(screen.getByLabelText('Pases VIP').textContent).toBe('2');
  });
});
