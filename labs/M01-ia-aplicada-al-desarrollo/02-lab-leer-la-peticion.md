# Laboratorio: leer la petición con el asistente

[← Página anterior](01-lab-entorno-y-primer-chat.md) · [Siguiente página →](../M02-generacion-de-codigo/README.md)

Llega la primera petición para el equipo: que los compradores puedan devolver entradas. Antes de pedir código, usas el asistente para entender por dónde pasa un pedido en Telón. Después le preguntas cómo haría el cambio y anotas lo que da por supuesto sin saberlo. Esa lista es lo que le falta saber, y es lo que se escribe en el M02.

### Objetivo

Un fichero `docs/devolucion-contexto.md` con el recorrido de un pedido comprobado en el código y la lista de lo que el asistente no sabe para hacer la devolución.

### Punto de partida

- Telón abierto en el Dev Container (local o Codespaces), carpeta `telon/`.
- Estado: `make init-m01` y después `make up-m01`. Es Telón tal como se hereda, sin ficheros de contexto para la IA.
- Asistente en modo agente (Cursor **Agent**, Copilot **Agent** o `claude` en la terminal).

La petición, tal como llega:

> **DEV-412 — Devolución de entradas**
> Como comprador, quiero devolver una o varias entradas de mi pedido desde «Mis entradas» para recuperar el dinero si no puedo ir.
> Prioridad alta: la Sala Faro tiene «Jazz en el Faro» el 14 de noviembre y ya hay compradores pidiéndolo por correo.

### En qué consiste

Tres preguntas al asistente: cómo funciona, qué cambiaría y qué da por hecho. Cada respuesta se contrasta con el código. No cambias código de Telón; solo creas un documento.

### 1 — Pide el recorrido de un pedido

**Acción:** en un chat nuevo, escribe:

```text
Explícame el recorrido completo de una compra en Telón: desde que el comprador pulsa una butaca
en SeatPicker hasta que recibe el correo con el QR. Para cada paso, dime fichero y función.
No cambies nada.
```

**Por qué:** antes de cambiar el flujo de un pedido hay que conocerlo. El agente puede leer los seis paquetes más rápido que tú, pero lo que te cuenta hay que comprobarlo.

**Resultado esperado:** una secuencia parecida a esta: `SeatPicker` y `Checkout` (`packages/ui`) → `POST /api/public/orders` (`services/api/src/routes/public.ts`) → `createOrder` y `payOrder` (`services/api/src/orders/service.ts`) → la pasarela (`payments-client.ts` → `services/payments`) → `enqueueEmail` (`queue.ts`) → el worker de `services/notifier` → el proveedor SMTP → Mailpit.

### 2 — Comprueba tres afirmaciones en el código

**Acción:** abre cada fichero y localiza la línea:
1. **Dónde se bloquea una butaca:** busca `tickets_one_active_seat` en `services/api/migrations/001_init.sql`.
2. **Dónde se calcula la comisión:** `services/api/src/orders/pricing.ts`, el `Math.round` dentro del bucle.
3. **Cómo llega el correo:** `services/api/src/queue.ts` (cola `emails`, `attempts: 3`) y `services/notifier/src/index.ts` (el `Worker`).

**Por qué:** si el asistente se ha inventado un paso, aquí lo ves. Además, cada uno de estos tres puntos tiene que ver con la devolución: la butaca tiene que volver a la venta, la comisión tiene que revertirse y el correo de confirmación pasará por la misma cola.

**Resultado esperado:** las tres cosas existen donde dicen. La butaca se bloquea con un índice único sobre entradas `pending` o `valid`, no con un campo en `seats`. La comisión se redondea entrada a entrada. La cola reintenta hasta 3 veces.

> [!TIP]
> Si el asistente nombró un fichero o una función que no existe, apúntalo. Es el primer tipo de alucinación que vas a ver: un nombre plausible para un proyecto de entradas.

### 3 — Pregunta cómo haría la devolución

**Acción:** en el mismo chat:

```text
¿Qué cambiarías para implementar DEV-412? Solo el plan: tablas, endpoints, componentes
y servicios afectados. No escribas código.
```

**Por qué:** el plan muestra lo que el asistente da por hecho. Sin contexto, rellena los huecos con lo que suele hacer un sistema de entradas cualquiera.

**Resultado esperado:** un plan con migración, endpoint, cambio en la pasarela, correo y algo en la tienda. Lo importante son los supuestos. Busca frases como estas: «se actualiza el estado del pedido a `refunded`», «se devuelve el importe total», «se elimina la entrada», «se puede devolver en cualquier momento».

### 4 — Contrasta el plan con las reglas del negocio

**Acción:** compara el plan con lo que responde negocio a las preguntas del equipo:

| Pregunta | Respuesta de negocio |
|----------|----------------------|
| ¿Se toca el pedido original? | No. Un pedido pagado no se modifica; la devolución es un registro nuevo que lo referencia |
| ¿Cuánto se devuelve? | El precio de las entradas. Los gastos de gestión no se devuelven nunca |
| ¿Y la comisión de Telón? | Se revierte la que se cobró por cada entrada (redondeada por entrada, como al comprar) |
| ¿Hasta cuándo? | Hasta 48 h antes del evento |
| ¿Qué pasa con el QR? | Deja de validar en puerta, y la butaca vuelve a la venta |
| ¿Y el correo? | Uno de confirmación, una sola vez |

**Por qué:** ninguna de estas reglas está escrita en el repositorio. Dos se intuyen en el código (gastos y comisión por entrada) y el resto solo las sabe negocio. Si no se las das, el asistente hace lo que hizo en el paso 3.

**Resultado esperado:** al menos tres supuestos del plan contradicen la tabla.

### 5 — Encuentra lo que el README dice y el código no

**Acción:** pide:

```text
Compara el README.md con el código y dime qué afirmaciones del README no son ciertas.
Para cada una, cita el fichero que lo demuestra.
```

y comprueba cada punto que te dé.

**Por qué:** el asistente lee el README como si fuera verdad. Si el README miente, el asistente también te mentirá, con seguridad. Saber qué documento no es fiable es contexto.

**Resultado esperado:** tres afirmaciones falsas como mínimo:
- la API no está en el `8080`, sino en el `3000` (`services/api/src/config.ts`);
- `npm run seed` no existe (`package.json`), porque los datos se cargan al arrancar la API;
- el correo no se envía «con SendGrid»: cada promotor elige proveedor y en el curso solo SMTP envía de verdad (`services/notifier/src/providers/`).

### 6 — Escribe lo que le falta saber

**Acción:** crea `docs/devolucion-contexto.md` (puedes pedírselo al asistente y corregirlo tú) con tres apartados:
1. **Recorrido de un pedido**: los pasos comprobados en el paso 2, con fichero.
2. **Supuestos falsos del asistente**: lo que encontraste en los pasos 3 y 5.
3. **Reglas que faltan**: la tabla del paso 4, en forma de reglas.

**Por qué:** esta lista es la entrada del M02, donde se convierte en reglas del proyecto que cualquier chat aplica sin repetirlas.

**Resultado esperado:** un fichero de una página, sin nada inventado: cada línea se puede comprobar en el código o en la tabla de negocio.

## Comprueba tu entendimiento

**El chat no recuerda**
Abre un chat nuevo y pregunta: «¿Se pueden devolver los gastos de gestión en Telón?».
→ El asistente no sabe la respuesta (o se la inventa). Lo que hablasteis en el otro chat no ha llegado a este.

**La regla que sí está en el código**
Pregunta en el chat nuevo: «¿La comisión se redondea por entrada o sobre el total? Cita la línea».
→ Responde «por entrada», citando `pricing.ts`. Lo que está en el código, lo encuentra. Lo que solo sabe negocio, no.

## Reto

### 1 — La entrada que no debería entrar

Sin cambiar nada, averigua con el asistente qué pasaría hoy en la puerta si una entrada se «devolviera» borrándola de la base de datos.

<details>
<summary>Ver solución</summary>

`POST /api/tickets/validate` (`services/api/src/routes/tickets.ts`) busca la entrada por el id del QR; si no existe, responde `entrada desconocida`, así que no entraría. Pero borrar rompe la regla «un pedido pagado no se modifica», pierde el rastro para liquidar al promotor y deja `orders.subtotal_cents` sin cuadrar con sus entradas. Lo correcto es un estado nuevo de la entrada (por ejemplo `refunded`) y un registro de devolución.

</details>

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| El asistente empieza a crear ficheros | El modo agente interpreta «implementar» como tarea | Repite el prompt con «No cambies nada» y descarta los cambios (`git checkout .`) |
| El asistente responde sobre otro proyecto | El chat se abrió en la raíz del repositorio y no en `telon/` | Abre el editor en `telon/` (el Dev Container ya lo hace) o lanza `claude` desde `telon/` |
| La respuesta cita ficheros de `node_modules` | El agente ha buscado en dependencias | Pídele que se limite a `apps/`, `packages/` y `services/` |
