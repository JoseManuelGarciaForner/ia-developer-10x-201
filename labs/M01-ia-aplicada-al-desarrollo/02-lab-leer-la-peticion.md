# Laboratorio: leer la petición con el asistente

[← Página anterior](01-lab-entorno-y-primer-chat.md) · [Siguiente página →](../M02-generacion-de-codigo/README.md)

Llega la primera petición para el equipo: que los compradores puedan devolver entradas. Antes de pedir código, usas el asistente para entender por dónde pasa un pedido en el proyecto Telón. Después le preguntas cómo haría el cambio y localizas lo que da por supuesto sin saberlo. Esa lista es lo que le falta saber, y es lo que se escribe en el M02.

### Objetivo

Un fichero `docs/devolucion-contexto.md` con el recorrido de un pedido comprobado en el código y la lista de lo que el asistente no sabe para hacer la devolución.

### Punto de partida

- El repositorio del curso abierto en el Dev Container (local o Codespaces). El explorador muestra la carpeta `telon/`.
- Dos terminales en `telon/` (**Terminal → New Terminal**, y el **+** del panel para la segunda).
- Terminal 1: `CONFIRM=1 make init-m01`. Responde `telon/ está en el punto de partida de m01.` Es el proyecto tal como se hereda, sin ningún fichero de contexto para la IA.
- Terminal 2: `make up-m01`, y déjala abierta.
- Un asistente en modo agente, en una conversación nueva:

| Asistente | Cómo abrirlo |
|-----------|--------------|
| VS Code o Codespaces + Copilot | <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>I</kbd> → **+** → modo **Agent** bajo la caja de texto |
| Cursor | <kbd>Ctrl</kbd>+<kbd>L</kbd> → **+** → modo **Agent** |
| Claude Code | En una terminal nueva, dentro de `telon/`: `claude` |

La petición, tal como llega:

> **DEV-412 — Devolución de entradas**
> Como comprador, quiero devolver una o varias entradas de mi pedido desde «Mis entradas» para recuperar el dinero si no puedo ir.
> Prioridad alta: la Sala Faro tiene «Jazz en el Faro» el 14 de noviembre y ya hay compradores pidiéndolo por correo.

> [!NOTE]
> En este lab el asistente solo tiene el código y lo que su herramienta trae de serie: no hay `AGENTS.md`, ni reglas, ni instrucciones del proyecto. Lo que responda es lo que deduce del código y lo que sabe de proyectos parecidos. Las respuestas exactas cambian con el modelo; los resultados esperados describen lo habitual y qué mirar.

### En qué consiste

Tres preguntas al asistente: cómo funciona, qué cambiaría y qué da por hecho. Cada respuesta se contrasta con el código. No cambias código del proyecto; solo creas un documento.

### 1 — Pide el recorrido de un pedido

**Acción:** ve al chat, escribe esto y pulsa <kbd>Enter</kbd>. Si pide permiso para leer ficheros o buscar, acéptalo.

```text
Explícame el recorrido completo de una compra en el proyecto: desde que el comprador pulsa una butaca
en SeatPicker hasta que recibe el correo con el QR. Para cada paso, dime fichero y función.
No cambies nada.
```

**Por qué:** antes de cambiar el flujo de un pedido hay que conocerlo. El agente puede leer los seis paquetes más rápido que tú, pero lo que te cuenta hay que comprobarlo.

**Resultado esperado:** mientras trabaja, el agente enseña qué busca y qué abre: `SeatPicker`, `Checkout`, rutas de la API y el notifier. Después devuelve una lista numerada parecida a esta:

1. `SeatPicker` y `Checkout` (`packages/ui/src/`): el comprador elige y paga.
2. `POST /api/public/orders` (`services/api/src/routes/public.ts`).
3. `createOrder` y `payOrder` (`services/api/src/orders/service.ts`).
4. La pasarela: `payments-client.ts` llama a `services/payments`.
5. `enqueueEmail` (`services/api/src/queue.ts`) mete el trabajo en la cola `emails`.
6. El worker de `services/notifier` lo recoge y envía el correo por SMTP a Mailpit.

Con unos modelos sale más detallado y con otros más resumido. Lo que tiene que estar son los ficheros: si un paso no trae fichero, pídeselo («¿En qué fichero está el paso 4?»).

### 2 — Comprueba tres afirmaciones en el código

**Acción:** abre cada fichero con <kbd>Ctrl</kbd>+<kbd>P</kbd> y ve a la línea con <kbd>Ctrl</kbd>+<kbd>G</kbd>:

1. **Dónde se bloquea una butaca:** `services/api/migrations/001_init.sql`, línea 84: `CREATE UNIQUE INDEX tickets_one_active_seat`.
2. **Dónde se calcula la comisión:** `services/api/src/orders/pricing.ts`, línea 45: `c = Math.round(c);`, dentro del bucle de entradas.
3. **Cómo llega el correo:** `services/api/src/queue.ts`, líneas 14 (`new Queue('emails'…)`) y 21 (`attempts: 3`), y `services/notifier/src/index.ts`, línea 9 (`new Worker`).

**Por qué:** si el asistente se ha inventado un paso, aquí lo ves. Además, los tres puntos tienen que ver con la devolución: la butaca tiene que volver a la venta, la comisión tiene que revertirse y el correo de confirmación pasará por la misma cola.

**Resultado esperado:** las tres cosas existen donde dicen. La butaca se bloquea con un índice único sobre entradas `pending` o `valid`, no con un campo en `seats`. La comisión se redondea entrada a entrada. La cola reintenta hasta 3 veces.

> [!TIP]
> Si el asistente nombró un fichero o una función que no existe, escríbelo en el apartado 2 del documento del paso 6. Es el primer tipo de alucinación que vas a ver: un nombre plausible para un proyecto de entradas, como `refundService.ts` o `tickets.controller.ts`.

### 3 — Pregunta cómo haría la devolución

**Acción:** en el **mismo** chat, escribe y pulsa <kbd>Enter</kbd>:

```text
¿Qué cambiarías para implementar DEV-412? Solo el plan: tablas, endpoints, componentes
y servicios afectados. No escribas código.
```

**Por qué:** el plan muestra lo que el asistente da por hecho. Sin contexto, rellena los huecos con lo que suele hacer un sistema de entradas cualquiera.

**Resultado esperado:** un plan con migración, endpoint, cambio en la pasarela, correo y algo en la tienda. Lo importante son los supuestos. Busca frases como estas:

- «se actualiza el estado del pedido a `refunded`»;
- «se devuelve el importe total» o «se reembolsa `total_cents`»;
- «se elimina la entrada» o «se borra la fila de `tickets`»;
- ninguna mención a un plazo.

Ningún modelo puede saber estas reglas, porque no están en el repositorio. Lo que cambia entre modelos es cuáles supone y cómo de seguro suena.

### 4 — Contrasta el plan con las reglas del negocio

**Acción:** compara el plan, frase a frase, con lo que responde negocio a las preguntas del equipo:

| Pregunta | Respuesta de negocio |
|----------|----------------------|
| ¿Se toca el pedido original? | No. Un pedido pagado no se modifica; la devolución es un registro nuevo que lo referencia |
| ¿Cuánto se devuelve? | El precio de las entradas. Los gastos de gestión no se devuelven nunca |
| ¿Y la comisión del proyecto? | Se revierte la que se cobró por cada entrada (redondeada por entrada, como al comprar) |
| ¿Hasta cuándo? | Hasta 48 h antes del evento |
| ¿Qué pasa con el QR? | Deja de validar en puerta, y la butaca vuelve a la venta |
| ¿Y el correo? | Uno de confirmación, una sola vez |

**Por qué:** ninguna de estas reglas está escrita en el repositorio. Dos se intuyen en el código (gastos y comisión por entrada) y el resto solo las sabe negocio. Si no se las das, el asistente hace lo que hizo en el paso 3.

**Resultado esperado:** al menos tres supuestos del plan contradicen la tabla.

### 5 — Encuentra lo que el README dice y el código no

**Acción:** en el mismo chat, escribe y pulsa <kbd>Enter</kbd>:

```text
Compara el README.md con el código y dime qué afirmaciones del README no son ciertas.
Para cada una, cita el fichero que lo demuestra.
```

Después comprueba tú cada punto que te dé, abriendo el fichero que cite.

**Por qué:** el asistente lee el README como si fuera verdad. Si el README miente, el asistente también te mentirá, con seguridad. Saber qué documento no es fiable es contexto.

**Resultado esperado:** tres afirmaciones falsas como mínimo:

- la API no está en el `8080`, sino en el `3000` (`services/api/src/config.ts`, línea 2);
- `npm run seed` no existe (`package.json`, sección `scripts`), porque los datos se cargan al arrancar la API;
- el correo no se envía «con SendGrid»: cada promotor elige proveedor y en el curso solo SMTP envía de verdad (`services/notifier/src/providers/`).

Si el asistente da por buena alguna de las tres, es porque esta vez no ha ido al código. Pídele que lo compruebe: «¿Dónde se define el puerto de la API?».

### 6 — Escribe lo que le falta saber

**Acción:** en el mismo chat, escribe y pulsa <kbd>Enter</kbd>:

```text
Crea docs/devolucion-contexto.md con tres apartados:
1. Recorrido de un pedido: los pasos que hemos comprobado, con fichero y línea.
2. Supuestos falsos: lo que dabas por hecho en tu plan y lo que el README dice y no es cierto.
3. Reglas que faltan: las reglas de negocio de la devolución, como lista.
Usa solo lo que hemos visto en esta conversación. Reglas de negocio:
- un pedido pagado no se modifica; la devolución es un registro nuevo;
- los gastos de gestión no se devuelven;
- la comisión revertida es la suma de la de cada entrada, redondeada por entrada;
- hasta 48 h antes del evento;
- el QR devuelto deja de valer y la butaca vuelve a la venta;
- un correo de confirmación, una sola vez.
```

Cuando termine, ábrelo (<kbd>Ctrl</kbd>+<kbd>P</kbd> → `devolucion-contexto.md`) y corrige lo que no se haya comprobado.

**Por qué:** esta lista es la entrada del M02, donde se convierte en reglas del proyecto que cualquier chat aplica sin repetirlas.

**Resultado esperado:** `docs/devolucion-contexto.md`, de una página, con los tres apartados. Cada línea se puede comprobar en el código o en la tabla de negocio. Si el asistente ha añadido algo que no se vio en la conversación (una regla nueva, un fichero que no abrió), bórralo.

## Comprueba tu entendimiento

**El chat no recuerda**
Abre una conversación **nueva** (botón **+**, o `/clear` en Claude Code) y pregunta: «¿Se pueden devolver los gastos de gestión en el proyecto?».
→ El asistente no lo sabe, o se lo inventa. Lo que hablasteis en la otra conversación no ha llegado a esta, y `docs/devolucion-contexto.md` no lo lee si no se lo pides.

**La regla que sí está en el código**
En la conversación nueva, pregunta: «¿La comisión se redondea por entrada o sobre el total? Cita la línea».
→ Responde «por entrada», citando `pricing.ts`. Lo que está en el código, lo encuentra. Lo que solo sabe negocio, no.

## Reto

### 1 — Que el asistente demuestre lo que afirma

Quieres saber qué pasaría hoy en la puerta si una entrada se «devolviera» borrándola de la base de datos. Escribe un prompt que obligue al asistente a responder **solo** con lo que pueda demostrar en el código: cada afirmación con su fichero y línea, y la marca «supuesto» en lo que no haya podido comprobar. Después comprueba tú dos de sus afirmaciones.

<details>
<summary>Ver solución</summary>

Un prompt que funciona:

```text
Sin cambiar nada: ¿qué pasaría hoy si una entrada se "devolviera" borrando su fila de tickets?
Piensa en la validación en puerta, en el pedido y en lo que se le paga al promotor.
Cada afirmación con fichero y línea. Si algo no lo puedes demostrar en el código,
márcalo como SUPUESTO y no lo des por hecho.
```

Lo habitual es que encuentre `services/api/src/routes/tickets.ts`: la validación busca la entrada por el id del QR y, si no existe, responde `entrada desconocida` (línea 17), así que no entraría. También ve que el pedido quedaría con menos entradas de las que suma `orders.subtotal_cents`. Lo de liquidar al promotor tiene que marcarlo como supuesto, porque la liquidación no está en este repositorio.

Lo que entrena el reto es el formato de la respuesta: pedir la prueba y la marca de supuesto convierte una explicación convincente en una que puedes comprobar línea a línea. Sin esas dos instrucciones, el modelo mezcla lo que ha leído con lo que es habitual sin distinguirlo.

</details>

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| El asistente empieza a crear ficheros | El modo agente interpreta «implementar» como tarea | Páralo, rechaza los cambios y repite el prompt con «No cambies nada». Si quedó algo, `git checkout .` y `git clean -fd` |
| El asistente responde sobre otro proyecto | El chat se abrió en la raíz del repositorio y no en `telon/` | Abre el editor en `telon/` (el Dev Container ya lo hace) o lanza `claude` desde `telon/` |
| La respuesta cita ficheros de `node_modules` | El agente ha buscado en dependencias | Pídele que se limite a `apps/`, `packages/` y `services/` |
| El asistente dice que no puede leer ficheros | El chat está en modo **Ask**, no **Agent** | Cambia el selector de modo a **Agent** y repite la pregunta |
