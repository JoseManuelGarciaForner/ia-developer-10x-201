import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { CartItem, EventInfo, Seat, TelonApi } from './api.js';

export interface CartLine {
  key: string;
  label: string;
  price_cents: number;
  quantity: number;
  item: CartItem;
}

interface TelonContextValue {
  api: TelonApi;
  event: EventInfo;
  basePath: string;
  cart: CartLine[];
  /** Cambia cada vez que se paga un pedido: los componentes que muestran disponibilidad recargan. */
  stockVersion: number;
  markSold(): void;
  toggleSeat(seat: Seat): void;
  setPassQuantity(passId: string, quantity: number): void;
  clearCart(): void;
}

const TelonContext = createContext<TelonContextValue | null>(null);

export const MAX_TICKETS = 10;

export function TelonProvider(props: { api: TelonApi; event: EventInfo; basePath?: string; children: ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [stockVersion, setStockVersion] = useState(0);

  const value = useMemo<TelonContextValue>(() => {
    const count = (lines: CartLine[]) => lines.reduce((n, l) => n + l.quantity, 0);
    return {
      api: props.api,
      event: props.event,
      basePath: props.basePath ?? '',
      cart,
      stockVersion,
      markSold: () => setStockVersion((v) => v + 1),
      toggleSeat(seat) {
        setCart((lines) => {
          const key = `seat:${seat.id}`;
          if (lines.some((l) => l.key === key)) return lines.filter((l) => l.key !== key);
          if (count(lines) >= MAX_TICKETS) return lines;
          return [...lines, { key, label: `Butaca ${seat.id}`, price_cents: seat.price_cents, quantity: 1, item: { seat_id: seat.id } }];
        });
      },
      setPassQuantity(passId, quantity) {
        setCart((lines) => {
          const pass = props.event.passes.find((p) => p.id === passId);
          if (!pass) return lines;
          const key = `pass:${passId}`;
          const others = lines.filter((l) => l.key !== key);
          const q = Math.max(0, Math.min(quantity, pass.available, MAX_TICKETS - count(others)));
          if (q === 0) return others;
          return [...others, { key, label: `Pase ${pass.name}`, price_cents: pass.price_cents, quantity: q, item: { pass_type_id: passId, quantity: q } }];
        });
      },
      clearCart: () => setCart([]),
    };
  }, [props.api, props.event, props.basePath, cart, stockVersion]);

  return <TelonContext.Provider value={value}>{props.children}</TelonContext.Provider>;
}

export function useTelon(): TelonContextValue {
  const ctx = useContext(TelonContext);
  if (!ctx) throw new Error('Los componentes de Telón tienen que estar dentro de <TelonProvider>');
  return ctx;
}

export const useEvent = () => useTelon().event;

export function useCart() {
  const { cart, event, clearCart } = useTelon();
  const tickets = cart.reduce((n, l) => n + l.quantity, 0);
  const subtotal_cents = cart.reduce((n, l) => n + l.price_cents * l.quantity, 0);
  const fee_cents = cart.reduce((n, l) => n + (l.price_cents > 0 ? event.fee_cents * l.quantity : 0), 0);
  return { lines: cart, tickets, subtotal_cents, fee_cents, total_cents: subtotal_cents + fee_cents, clear: clearCart };
}
