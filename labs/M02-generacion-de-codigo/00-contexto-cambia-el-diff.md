# El contexto cambia el diff

[← Página anterior](README.md) · [Siguiente página →](01-lab-reglas-del-proyecto.md)

El mismo prompt para la devolución de entradas (DEV-412), en el mismo repositorio, da dos diffs muy distintos según lo que el asistente sabe del proyecto. Esta demostración pone los dos uno al lado del otro.

## Punto de partida

- Telón en el estado `make init-m02`: el código heredado, sin `AGENTS.md` ni reglas del proyecto.
- Asistente en modo agente, chat nuevo cada vez.
- Para la segunda pasada, las reglas del proyecto de referencia del curso, copiadas desde `telon/`:

```bash
cp ../.labs/m03-inicio/AGENTS.md ../.labs/m03-inicio/CLAUDE.md .
cp -r ../.labs/m03-inicio/.cursor ../.labs/m03-inicio/.github .
```

El prompt, idéntico en las dos pasadas:

```text
Implementa DEV-412: el comprador puede devolver una o varias entradas de su pedido
desde "Mis entradas". Primero dame el plan y espera mi confirmación.
```

## Recorrido

> [!NOTE]
> Lo que propone el asistente cambia con el modelo. Lo que se mantiene es de dónde salen las diferencias.

### 1. Sin contexto

El plan es razonable para cualquier tienda de entradas, y erróneo para Telón:

- añade `refunded` a `orders.status` y marca el pedido entero como devuelto, aunque solo se devuelva una entrada;
- devuelve `total_cents`, gastos de gestión incluidos;
- borra las filas de `tickets` devueltas «para liberar la butaca»;
- no pone límite de fecha;
- añade el correo con un `transporter.sendMail` directo en la API, sin pasar por la cola.

Cada punto es plausible y cada uno rompe algo: el pedido pagado se modifica, el promotor pierde los gastos, liquidaciones pierde el rastro de las entradas y el correo deja de usar el proveedor del promotor.

### 2. Con las reglas del proyecto

Con `AGENTS.md` en el repositorio (y `CLAUDE.md`, `.cursor/rules/` y `.github/copilot-instructions.md` apuntando a él), el plan del chat nuevo cambia:

- tablas nuevas `refunds` y `refund_tickets` en una migración `002_…`, sin tocar la `001`;
- un estado nuevo de entrada, `refunded`, que libera la butaca porque el índice único solo mira `pending` y `valid`;
- importe = suma de precios de las entradas, sin gastos;
- comprobación de las 48 h antes del evento;
- devolución en la pasarela con `POST /refunds` y un trabajo nuevo `refund-confirmed` en la cola `emails`.

El asistente cita `AGENTS.md` al justificar cada decisión. No ha hecho falta repetir ninguna regla en el prompt.

### 3. Lo que el contexto no arregla

El diff con contexto sigue teniendo detalles que revisar. Calcula la comisión revertida sobre el total de las entradas devueltas, aunque la regla dice «suma de las de cada entrada». Y en el notifier registra el envío después de mandar el correo. Las reglas mejoran el punto de partida, pero no sustituyen la revisión ni los tests: esos dos fallos son el punto de partida del M03.

## Qué queda visto

| Pieza | Sin contexto | Con `AGENTS.md` |
|-------|--------------|-----------------|
| Pedido original | Se modifica | Intacto; la devolución lo referencia |
| Importe | Total con gastos | Precio de las entradas |
| Butaca | Se borra la entrada | Estado `refunded`; vuelve a la venta |
| Plazo | Ninguno | 48 h antes del evento |
| Correo | Directo desde la API | Cola `emails`, proveedor del promotor |

En [01 — Reglas del proyecto](01-lab-reglas-del-proyecto.md) escribes ese `AGENTS.md` con el asistente. Se puede hacer sin haber seguido esta demostración.
