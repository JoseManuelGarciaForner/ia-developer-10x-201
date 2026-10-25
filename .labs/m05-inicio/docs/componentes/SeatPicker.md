# `SeatPicker`

Plano de butacas del evento. El comprador pulsa una butaca libre para añadirla al carrito y otra vez para quitarla.
Las vendidas o reservadas salen en gris y no se pueden pulsar. Tras un pago, el plano se recarga solo.

## Uso

```tsx
import { Cart, Checkout, SeatPicker, useEvent } from '@telon/ui';

export default function Pagina() {
  const event = useEvent();
  return (
    <main>
      <h1>{event.title}</h1>
      <SeatPicker zone="platea" />
      <Cart />
      <Checkout />
    </main>
  );
}
```

## Props

| Prop | Tipo | Por defecto | Qué hace |
|------|------|-------------|----------|
| `zone` | `string` | todas | Muestra solo una zona (`platea`, `anfiteatro`…). Las zonas del evento están en `useEvent().zones` |

## Comportamiento

- Máximo 10 entradas por pedido, sumando butacas y pases.
- Si el evento no tiene butacas numeradas, no pinta nada.
- Toma color y tipografía de la página. El color de la butaca seleccionada es `--telon-accent`:

```tsx
<main style={{ '--telon-accent': '#e4572e' } as React.CSSProperties}>
```

## Comprobado

El ejemplo de «Uso» se ha pegado tal cual en el editor del backoffice (evento `EV-FARO-0042`) y la vista previa muestra solo la platea.
