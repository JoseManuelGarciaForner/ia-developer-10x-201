# Laboratorio: el caso límite del redondeo

[← Página anterior](02-lab-mocks.md) · [Siguiente página →](04-lab-debugging-correo-duplicado.md)

Cuando un comprador del proyecto Telón devuelve dos butacas de 35,50 €, la plataforma revierte 5,33 € de comisión. Al comprarlas se cobraron 5,32. Ese céntimo, multiplicado por miles de devoluciones, es el que liquidaciones no consigue cuadrar. En este lab escribes el test que lo demuestra, buscas más precios que lo provocan y corriges la regla en un solo sitio.

### Objetivo

`calcRefundAmounts` corregida para que la comisión revertida sea la suma de la de cada entrada, con tests que cubren los precios en los que el redondeo difiere.

### Punto de partida

- El proyecto abierto en el Dev Container, carpeta `telon/`.
- Estado: `make init-m03`. `services/api/src/refunds/amounts.ts` calcula la comisión sobre el total y sus tests (`test/refunds.test.ts`) están en verde.
- La regla, en `AGENTS.md`: «Comisión de plataforma: `commission_bps` sobre el precio, redondeada por entrada. La de un pedido o una devolución es la suma de las de sus entradas.»

### En qué consiste

Test en rojo, búsqueda de casos, arreglo mínimo y comprobación contra la API. Solo tocas `amounts.ts`, su llamada en `service.ts` y los tests.

### 1 — Escribe el test que falla

**Acción:** añade a `services/api/test/refunds.test.ts`, dentro de `describe('calcRefundAmounts')`:

```ts
it('revierte la comisión redondeada por entrada, no la del total', () => {
  // 3550 × 7,5 % = 266,25 → 266 por butaca. Dos butacas: 532 (sobre el total saldría 533)
  const f12 = { id: 'PED-2026-0107-1', price_cents: 3550, fee_cents: 90, commission_cents: 266 };
  expect(calcRefundAmounts([f12, f13], faro).commission_reversed_cents).toBe(532);
});
```

y ejecuta `npm test -w @telon/api`.

**Por qué:** el test fija la regla antes de tocar el código. Si el arreglo es correcto, este test pasa de rojo a verde y nada más cambia.

**Resultado esperado:** `AssertionError: expected 533 to be 532`.

### 2 — Pide al asistente que busque más casos

**Acción:**

```text
Con commission_bps = 750, busca precios de entrada (en céntimos, entre 1000 y 8000) en los que
devolver dos entradas iguales da distinta comisión redondeando por entrada que redondeando el
total. Hazlo con un script de una sola vez en la terminal, no en el código del proyecto.
Dame cinco ejemplos y explica el patrón.
```

**Por qué:** el asistente es bueno haciendo una exploración rápida que tú no harías a mano. El script es para entender el caso; no entra en el repositorio.

**Resultado esperado:** precios como 3550, 1830 o 3540: aquellos en los que `precio × 0,075` acaba en ,25 o en ,5 céntimos. El patrón: por entrada se pierde un cuarto de céntimo (o se gana medio) en cada una, y al sumar dos, el total redondea hacia el otro lado. Con ,75 no pasa: los dos caminos dan lo mismo.

### 3 — Convierte los casos en un test con tabla

**Acción:**

```text
Añade a refunds.test.ts un it.each con tres de esos precios, y también 6000 (sin decimales)
y 0 (invitación). Para cada uno, devuelve dos entradas iguales y espera
2 × ticketCommission(precio, 750). Importa ticketCommission de src/orders/pricing.ts.
```

**Por qué:** el valor esperado sale de la misma función que calcula la comisión al comprar. Así el test dice exactamente lo que pide la regla: «lo que se revierte es lo que se cobró».

**Resultado esperado:** cinco casos nuevos; los tres con decimales, en rojo.

### 4 — Pide el arreglo mínimo

**Acción:**

```text
Arregla calcRefundAmounts para que commission_reversed_cents sea la suma de commission_cents
de las entradas devueltas (ya está guardada en tickets, es lo que se cobró). Diff mínimo: si el
parámetro ev deja de hacer falta, quítalo y ajusta la llamada en service.ts. No toques tests.
```

**Por qué:** la comisión de cada entrada ya está calculada y guardada (`tickets.commission_cents`). Sumar lo guardado garantiza que se revierte justo lo que se cobró, aunque mañana cambie el porcentaje del evento.

**Resultado esperado:** un diff de pocas líneas en `amounts.ts` y `service.ts`. `calcRefundAmounts(tickets)` suma `t.commission_cents`.

### 5 — Pasa los tests

**Acción:** `npm test && npm run typecheck`

**Por qué:** los tests en rojo de los pasos 1 y 3 pasan a verde. Los demás no cambian.

**Resultado esperado:** todo en verde. Si `typecheck` se queja en algún test que pasaba `faro` como segundo argumento, quita el argumento: ya no existe.

### 6 — Compruébalo contra la API

**Acción:** con `make up-m03` arrancado en otra terminal:

```bash
npm run db:reset
curl -s localhost:3000/api/public/orders/PED-2026-0107/refunds \
  -H 'x-telon-tenant-slug: sala-faro' -H 'content-type: application/json' \
  -d '{"email":"ana.compradora@ejemplo.test","ticket_ids":["PED-2026-0107-1","PED-2026-0107-2"]}'
```

**Por qué:** los tests prueban la función; esto prueba que la API usa la función arreglada con datos reales.

**Resultado esperado:** `"amount_cents":7100,"commission_reversed_cents":532`.

### 7 — Haz commit

**Acción:** `git add services/api && git commit -m "Devolución: comisión revertida por entrada"`

**Por qué:** un commit, un arreglo, con sus tests.

**Resultado esperado:** commit con `amounts.ts`, `service.ts` y `refunds.test.ts`.

## Comprueba tu entendimiento

**El pedido completo**
Tras `npm run db:reset`, devuelve las tres entradas de `PED-2026-0107`.
→ `commission_reversed_cents: 982`, igual que `orders.commission_cents` del pedido. Lo revertido cuadra con lo cobrado.

## Reto

### 1 — Si cambia el porcentaje

La Sala Faro negocia bajar la comisión al 6 % desde mañana. Alguien cambia `commission_bps` del evento a 600. ¿Qué pasa con la devolución de una entrada comprada ayer, con la versión arreglada y con la original?

<details>
<summary>Ver solución</summary>

Con la versión arreglada se revierte lo que se cobró al comprar (266, al 7,5 %), porque suma `tickets.commission_cents`. Con la original se recalcularía con el porcentaje actual del evento (3550 × 6 % = 213), y el proyecto devolvería al promotor menos comisión de la que le cobró. Por eso «sumar lo guardado» es mejor regla que «recalcular»: no depende de la configuración de hoy.

</details>

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| El asistente cambió `532` por `533` en el test | Interpretó el rojo como test desactualizado | Rechaza el diff: el test describe la regla |
| `commission_cents` es `undefined` | La consulta de `service.ts` no selecciona esa columna | Añádela al `SELECT` de entradas |
| La API sigue devolviendo 533 | La API no se ha recargado o no se reinició la base de datos | Mira que `[api]` se reinició y repite `npm run db:reset` |
