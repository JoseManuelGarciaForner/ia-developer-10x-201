// Tipos que ve el editor del backoffice cuando el promotor escribe su página.
// Si cambias la API pública de @telon/ui, actualiza también esto.
export const UI_TYPES = `declare module '@telon/ui' {
  import type { ReactElement } from 'react';
  export interface PassType { id: string; name: string; description: string; price_cents: number; available: number }
  export interface EventInfo {
    id: string; title: string; venue: string; starts_at: string; fee_cents: number;
    passes: PassType[]; zones: { zone: string; price_cents: number; seats: number }[];
  }
  /** Datos del evento que se está mostrando. */
  export function useEvent(): EventInfo;
  /** Estado del carrito: líneas, número de entradas e importes en céntimos. */
  export function useCart(): { lines: { key: string; label: string; price_cents: number; quantity: number }[]; tickets: number; subtotal_cents: number; fee_cents: number; total_cents: number; clear(): void };
  /** Plano de butacas. zone filtra por zona (platea, anfiteatro…). */
  export function SeatPicker(props: { zone?: string }): ReactElement | null;
  /** Pases sin butaca (de pie, VIP…). */
  export function PassSelector(): ReactElement | null;
  /** Resumen del carrito con gastos de gestión. */
  export function Cart(): ReactElement;
  /** Email, tarjeta y pago. */
  export function Checkout(): ReactElement;
  /** QR de una entrada con botón de descarga. */
  export function TicketQR(props: { token: string; label: string; filename?: string }): ReactElement;
  export function formatEuros(cents: number): string;
  export function formatDate(iso: string): string;
}`;
