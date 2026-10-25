# El contexto cambia el diff

[← Página anterior](README.md) · [Siguiente página →](01-lab-reglas-del-proyecto.md)

Cuando un asistente genera código malo, la reacción habitual es reescribir el prompt. Esta demostración muestra que muchas veces el problema no está en el prompt, sino en lo que el asistente no sabe del negocio. En el proyecto Telón se pide dos veces la misma funcionalidad, la devolución de entradas (DEV-412), con el mismo prompt. La única diferencia es que la segunda vez las reglas del proyecto están escritas en el repositorio.

## Punto de partida

- Repositorio del curso abierto en el Dev Container (local o Codespaces), con una terminal en `telon/`.
- Un asistente en modo agente: Copilot o Cursor en modo **Agent**, o Claude Code (`claude` en la terminal, desde `telon/`).

El prompt, idéntico en los dos intentos:

```text
Implementa DEV-412: el comprador puede devolver una o varias entradas de su pedido
desde "Mis entradas". Primero dame el plan y espera mi confirmación.
```

Las reglas de negocio que debe cumplir la devolución. Las conoce el equipo, pero no están en el código. Conviene tenerlas a la vista durante toda la demostración, porque cada plan se compara con ellas:

1. Un pedido pagado no se modifica: la devolución es un registro nuevo que lo referencia.
2. Los gastos de gestión no se reembolsan.
3. La comisión revertida es la suma de la de cada entrada, redondeada por entrada.
4. Solo se puede devolver hasta 48 h antes del evento.
5. El QR devuelto deja de valer y la butaca vuelve a la venta.
6. El correo sale por la cola y con el proveedor del promotor, una sola vez.

### Preparación

1. En la terminal: `CONFIRM=1 make init-m02`. Es el código heredado, sin reglas para la IA.
2. `ls AGENTS.md` responde `No such file or directory`. Así se comprueba que el asistente no tiene contexto escrito.

> [!NOTE]
> Lo que propone el asistente cambia con el modelo. Lo que se mantiene es qué reglas respeta cada intento y por qué.

## Recorrido

### 1. Sin contexto, el asistente aplica lo habitual

1. Se abre una conversación nueva en modo agente y se pega el prompt.
2. El asistente explora el repositorio (`orders/`, `001_init.sql`, `payments`, `notifier`) y devuelve un plan. El prompt le pide esperar; si empieza a escribir código, se para (botón de detener en Copilot y Cursor, <kbd>Esc</kbd> en Claude Code) y se descartan los cambios.
3. Se lee el plan en voz alta, punto por punto, contrastándolo con las seis reglas.

**Qué se ve:** un plan razonable para cualquier tienda de entradas. Lo habitual es esto:

| Lo que propone | Regla que rompe | Consecuencia en el proyecto |
|----------------|-----------------|-----------------------------|
| Añadir `refunded` a `orders.status` y marcar el pedido entero | 1 | Un pedido pagado cambia, aunque solo se devuelva una entrada |
| Devolver `total_cents`, gastos incluidos | 2 | El promotor pierde los gastos de gestión |
| Borrar las filas de `tickets` «para liberar la butaca» | 5 | Liquidaciones pierde el rastro de esas entradas |
| Ningún límite de fecha | 4 | Se puede devolver una entrada con la función empezada |
| `transporter.sendMail` directo desde la API | 6 | El correo deja de usar el proveedor del promotor y la cola |

**Qué muestra:** el asistente no se ha equivocado programando. Ha rellenado con lo más común las reglas que nadie le dio, porque no están ni en el prompt ni en el código.

4. Se cierra la conversación. La siguiente tiene que empezar de cero.

### 2. Con las reglas en el repositorio, el plan cambia sin tocar el prompt

1. En la terminal se copian las reglas del proyecto de referencia del curso:

```bash
cp ../.labs/m03-inicio/AGENTS.md ../.labs/m03-inicio/CLAUDE.md .
cp -r ../.labs/m03-inicio/.cursor ../.labs/m03-inicio/.github .
git status --short
```

`git status` muestra cuatro entradas nuevas: `AGENTS.md`, `CLAUDE.md`, `.cursor/` y `.github/`.

2. Se abre `AGENTS.md` y se enseña la sección **Reglas de negocio**: son las seis reglas de arriba, escritas para el asistente. `CLAUDE.md`, `.cursor/rules/telon.mdc` y `.github/copilot-instructions.md` solo apuntan a `AGENTS.md`, para que cada herramienta lo lea.
3. Se abre una conversación **nueva** en modo agente y se pega exactamente el mismo prompt.

**Qué se ve:** otro plan, que cita `AGENTS.md` al justificar cada decisión:

- tablas nuevas `refunds` y `refund_tickets` en una migración `002_…`, sin tocar la `001` (regla 1);
- importe = suma de los precios de las entradas, sin gastos (regla 2);
- comprobación de las 48 h antes del evento (regla 4);
- un estado nuevo de entrada, `refunded`, que libera la butaca porque el índice único solo mira `pending` y `valid` (regla 5);
- devolución en la pasarela con `POST /refunds` y un trabajo `refund-confirmed` en la cola `emails` (regla 6).

**Qué muestra:** el prompt no ha cambiado ni una palabra. Lo que ha cambiado es el repositorio, y por eso cualquier chat y cualquier persona del equipo obtiene el mismo punto de partida.

4. Se para ahí: no hace falta que implemente nada para ver la diferencia.

### 3. El contexto mejora el plan, pero no lo verifica

Con estas mismas reglas, la devolución del curso se generó entera. Ese resultado es el punto de partida del M03 y está en `../.labs/m03-inicio/`. Se abren dos ficheros:

1. `../.labs/m03-inicio/services/api/src/refunds/amounts.ts`, línea 20:

```ts
commission_reversed_cents: Math.round((amount * ev.commission_bps) / 10_000),
```

Calcula la comisión sobre el total de las entradas devueltas, no por entrada (regla 3). Con F-12 y F-13 revierte 533 céntimos en lugar de 532.

2. `../.labs/m03-inicio/services/notifier/src/jobs.ts`, líneas 95–96:

```ts
await provider.send({ from: tenant.email_from, to: refund.buyer_email, ...email });
await logEmail(tenant.id, provider.name, refund.buyer_email, email.subject, jobId);
```

Primero envía el correo y después lo registra. Si el registro falla, la cola reintenta y el correo sale otra vez (regla 6).

**Qué muestra:** los dos fallos pasan desapercibidos al leer el plan, y los tests generados con ese código están en verde. Las reglas escritas reducen los errores de partida, pero no sustituyen la revisión ni los tests: encontrar estos dos fallos es el trabajo del M03.

3. Para dejarlo como estaba: `CONFIRM=1 make init-m02` (borra también los ficheros de reglas copiados).

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
