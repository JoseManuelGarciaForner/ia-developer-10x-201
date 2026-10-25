import { useCallback, useEffect, useState } from 'react';
import type { Seat } from './api.js';
import { useTelon } from './context.js';
import { formatEuros } from './format.js';
import { accent, box, muted } from './styles.js';

export interface SeatPickerProps {
  /** Muestra solo una zona (platea, anfiteatro…). Por defecto, todas. */
  zone?: string;
}

/** Plano de butacas del evento. Añade y quita butacas del carrito. */
export function SeatPicker({ zone }: SeatPickerProps) {
  const { api, event, cart, toggleSeat, stockVersion } = useTelon();
  const [seats, setSeats] = useState<Seat[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    api.seats(event.id).then(setSeats, (e: Error) => setError(e.message));
  }, [api, event.id, stockVersion]);

  useEffect(load, [load]);

  if (error) return <p role="alert">No se pudo cargar el plano: {error}</p>;
  if (!seats) return <p>Cargando el plano…</p>;
  if (seats.length === 0) return null;

  const selected = new Set(cart.filter((l) => 'seat_id' in l.item).map((l) => (l.item as { seat_id: string }).seat_id));
  const visible = zone ? seats.filter((s) => s.zone === zone) : seats;
  const rows = [...new Set(visible.map((s) => s.row_label))];

  return (
    <div style={box} data-telon="seat-picker">
      <div style={{ textAlign: 'center', ...muted, marginBottom: 12, letterSpacing: 6 }}>ESCENARIO</div>
      {rows.map((row) => (
        <div key={row} style={{ display: 'flex', gap: 4, justifyContent: 'center', marginBottom: 4 }}>
          <span style={{ width: 18, ...muted }}>{row}</span>
          {visible
            .filter((s) => s.row_label === row)
            .map((s) => {
              const isSelected = selected.has(s.id);
              const taken = s.status === 'taken';
              return (
                <button
                  key={s.id}
                  type="button"
                  disabled={taken}
                  aria-pressed={isSelected}
                  title={`${s.id} · ${s.zone} · ${formatEuros(s.price_cents)}`}
                  onClick={() => toggleSeat(s)}
                  style={{
                    width: 22,
                    height: 22,
                    padding: 0,
                    borderRadius: '6px 6px 3px 3px',
                    border: '1px solid color-mix(in srgb, currentColor 40%, transparent)',
                    background: isSelected ? accent : taken ? 'color-mix(in srgb, currentColor 30%, transparent)' : 'transparent',
                    cursor: taken ? 'not-allowed' : 'pointer',
                    fontSize: 9,
                    color: isSelected ? '#111' : 'inherit',
                  }}
                >
                  {s.number}
                </button>
              );
            })}
        </div>
      ))}
      <p style={{ ...muted, textAlign: 'center', marginTop: 12 }}>
        {event.zones.map((z) => `${z.zone} ${formatEuros(z.price_cents)}`).join(' · ')} · Gris: vendida
      </p>
    </div>
  );
}
