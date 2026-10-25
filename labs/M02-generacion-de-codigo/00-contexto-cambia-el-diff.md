# El contexto cambia el diff

[← Página anterior](README.md) · [Siguiente página →](01-lab-reglas-del-proyecto.md)

Cuando un asistente genera código malo, la reacción habitual es reescribir el prompt. Esta demostración muestra que muchas veces el problema no está en el prompt, sino en lo que el asistente no sabe del negocio. En el proyecto Telón se pide dos veces la misma funcionalidad, la devolución de entradas (DEV-412), con el mismo prompt. La única diferencia es que la segunda vez las reglas del proyecto están escritas en el repositorio.

## Punto de partida

- El proyecto Telón en el estado `make init-m02`: el código heredado, sin `AGENTS.md` ni reglas del proyecto.
- Asistente en modo agente, con un chat nuevo para cada intento.
- Para el segundo intento, las reglas del proyecto de referencia del curso, copiadas desde `telon/`:

```bash
cp ../.labs/m03-inicio/AGENTS.md ../.labs/m03-inicio/CLAUDE.md .
cp -r ../.labs/m03-inicio/.cursor ../.labs/m03-inicio/.github .
```

El prompt, idéntico en los dos intentos:

```text
Implementa DEV-412: el comprador puede devolver una o varias entradas de su pedido
desde "Mis entradas". Primero dame el plan y espera mi confirmación.
```

Las reglas de negocio que debe cumplir la devolución. Están en la cabeza del equipo, no en el código:

1. Un pedido pagado no se modifica: la devolución es un registro nuevo que lo referencia.
2. Los gastos de gestión no se reembolsan.
3. La comisión revertida es la suma de la de cada entrada, redondeada por entrada.
4. Solo se puede devolver hasta 48 h antes del evento.
5. El QR devuelto deja de valer y la butaca vuelve a la venta.
6. El correo sale por la cola y con el proveedor del promotor, una sola vez.

> [!NOTE]
> Lo que propone el asistente cambia con el modelo. Lo que se mantiene es qué reglas respeta cada intento y por qué.

## Recorrido

### 1. Sin contexto, el asistente aplica lo habitual

El plan es razonable para cualquier tienda de entradas, pero no para esta. Comparado con las reglas:

| Lo que propone | Regla que rompe | Consecuencia en el proyecto |
|----------------|-----------------|-----------------------------|
| Añadir `refunded` a `orders.status` y marcar el pedido entero | 1 | Un pedido pagado cambia, aunque solo se devuelva una entrada |
| Devolver `total_cents`, gastos incluidos | 2 | El promotor pierde los gastos de gestión |
| Borrar las filas de `tickets` «para liberar la butaca» | 5 | Liquidaciones pierde el rastro de esas entradas |
| Ningún límite de fecha | 4 | Se puede devolver una entrada con la función empezada |
| `transporter.sendMail` directo desde la API | 6 | El correo deja de usar el proveedor del promotor y la cola |

El asistente no se ha equivocado programando: ha rellenado con lo más común las reglas que nadie le dio. El prompt no las menciona y el código no las contiene.

### 2. Con las reglas en el repositorio, el plan cambia sin cambiar el prompt

Con `AGENTS.md` en el repositorio (y `CLAUDE.md`, `.cursor/rules/` y `.github/copilot-instructions.md` apuntando a él), el plan del chat nuevo es otro:

- tablas nuevas `refunds` y `refund_tickets` en una migración `002_…`, sin tocar la `001` (regla 1);
- importe = suma de los precios de las entradas, sin gastos (regla 2);
- comprobación de las 48 h antes del evento (regla 4);
- un estado nuevo de entrada, `refunded`, que libera la butaca porque el índice único solo mira `pending` y `valid` (regla 5);
- devolución en la pasarela con `POST /refunds` y un trabajo `refund-confirmed` en la cola `emails` (regla 6).

Al justificar cada decisión, el asistente cita `AGENTS.md`. No ha hecho falta repetir ninguna regla en el prompt: están en el repositorio, así que las aplica cualquier chat y cualquier persona del equipo.

### 3. El contexto mejora el plan, pero no lo verifica

El diff generado con contexto sigue teniendo dos fallos:

- calcula la comisión revertida sobre el total de las entradas devueltas, y no por entrada como dice la regla 3;
- en el notifier, registra el envío después de mandar el correo, así que un reintento lo manda otra vez (regla 6).

Los dos pasan desapercibidos al leer el plan y los tests generados siguen en verde. Escribir las reglas reduce los errores de partida, pero no sustituye la revisión ni los tests: estos dos fallos son el punto de partida del M03.

## Qué queda visto

| Pieza | Sin contexto | Con `AGENTS.md` |
|-------|--------------|-----------------|
| Pedido original | Se modifica | Intacto; la devolución lo referencia |
| Importe | Total con gastos | Precio de las entradas |
| Butaca | Se borra la entrada | Estado `refunded`; vuelve a la venta |
| Plazo | Ninguno | 48 h antes del evento |
| Correo | Directo desde la API | Cola `emails`, proveedor del promotor |
| Comisión revertida | — | Sobre el total: sigue mal |

Lo que cambia el diff no es un prompt más largo, sino que las reglas del negocio estén escritas en el repositorio. Y lo que no cubren las reglas lo tienen que encontrar la revisión y los tests.

En [01 — Reglas del proyecto](01-lab-reglas-del-proyecto.md) escribes ese `AGENTS.md` con el asistente. Se puede hacer sin haber seguido esta demostración.
