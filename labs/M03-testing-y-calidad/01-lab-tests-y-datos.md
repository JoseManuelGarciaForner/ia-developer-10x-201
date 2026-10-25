# Laboratorio: tests y datos a partir de la regla

[← Página anterior](00-la-red-de-tests.md) · [Siguiente página →](02-lab-mocks.md)

La devolución del proyecto Telón tiene tests y pasan. Pero los escribió el mismo asistente que escribió el código, mirando el código. En este lab pides tests que salen de las reglas de negocio, con datos que cubren los tipos de entrada de verdad (butaca, pase de pie, VIP, invitación), y encuentras el que falla.

### Objetivo

Una batería de tests de la devolución basada en las reglas de `AGENTS.md`, con datos generados, que deja al descubierto el fallo de la comisión.

### Punto de partida

- El repositorio del curso abierto en el Dev Container (local o Codespaces). El explorador muestra la carpeta `telon/`.
- Una terminal en `telon/`. Escribe `CONFIRM=1 make init-m03`; responde `telon/ está en el punto de partida de m03.` La devolución está en `services/api/src/refunds/` y `services/api/test/refunds.test.ts` tiene 5 tests en verde.
- Un asistente en modo agente:

| Asistente | Cómo abrir una conversación nueva |
|-----------|-----------------------------------|
| VS Code o Codespaces + Copilot | <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>I</kbd> → **+** → modo **Agent** bajo la caja de texto |
| Cursor | <kbd>Ctrl</kbd>+<kbd>L</kbd> → **+** → modo **Agent** |
| Claude Code | En una terminal nueva, dentro de `telon/`: `claude` |

> [!NOTE]
> En este estado el proyecto tiene `AGENTS.md` con las reglas de negocio, y cada herramienta lo carga al abrir una conversación. El asistente tiene el código, esas reglas y nada más.

### En qué consiste

Generas datos de prueba, generas tests desde las reglas, los ejecutas y analizas el que falla. No arreglas el código en este lab: el arreglo está en [03 — El caso límite del redondeo](03-lab-caso-limite-redondeo.md).

### 1 — Ejecuta los tests de partida

**Acción:** en la terminal, `npm test -w @telon/api`

**Por qué:** es la foto de partida: todo en verde. Al final del lab sabrás cuánto valía ese verde.

**Resultado esperado:** `Tests  13 passed (13)`.

### 2 — Lee los tests que hay

**Acción:** abre `services/api/test/refunds.test.ts` (<kbd>Ctrl</kbd>+<kbd>P</kbd> → `refunds.test.ts`) y responde para cada test: ¿de dónde sale el valor esperado?

**Por qué:** un test cuyo valor esperado sale de ejecutar el código no prueba la regla, prueba que el código hace lo que hace.

**Resultado esperado:** los tres tests de `calcRefundAmounts` usan una o dos entradas cuyo redondeo es exacto o no se nota (6000 × 7,5 % = 450). Ninguno devuelve dos butacas de 35,50 €.

### 3 — Genera los datos de prueba

**Acción:** ve al chat, abre una conversación nueva, pega esto y pulsa <kbd>Enter</kbd>:

```text
Crea services/api/test/fixtures.ts con entradas de prueba del evento EV-FARO-0042
(fee_cents 90, commission_bps 750), calculando sus importes con ticketAmounts de
src/orders/pricing.ts:
- butaca de platea (3550), butaca de anfiteatro (2400), pase De pie (1800), pase VIP (6000),
  invitación (0);
- las tres entradas del pedido PED-2026-0107 (F-12, F-13, VIP).
Exporta cada una con un nombre claro. No inventes precios: usa los del seed
(services/api/src/seed.ts).
```

**Por qué:** los datos vienen del seed y los importes de la misma función que usa la compra. Así el test de la devolución parte de entradas iguales a las que existen, no de números inventados.

**Resultado esperado:** el agente abre `seed.ts` y `pricing.ts` y crea `services/api/test/fixtures.ts` con unas ocho entradas. Ábrelo y comprueba dos: la butaca de platea lleva `commission_cents: 266` y la invitación `fee_cents: 0`.

### 4 — Genera tests desde las reglas

**Acción:** en el mismo chat, pega esto y pulsa <kbd>Enter</kbd>:

```text
Genera tests de calcRefundAmounts y canRefundAt a partir de las reglas de AGENTS.md, NO del
código. Para cada test, calcula el valor esperado a mano desde la regla y explícalo en un
comentario. Usa test/fixtures.ts. Incluye:
- devolver F-12 y F-13 juntas;
- devolver todo el pedido PED-2026-0107;
- una invitación;
- el límite exacto de 48 h y un minuto menos.
```

**Por qué:** «a partir de la regla» cambia de dónde sale el número esperado. El comentario con el cálculo a mano te deja revisar el test sin ejecutarlo.

**Resultado esperado:** un `describe` nuevo con cinco tests o más. En el de F-12 + F-13 aparece algo como `// 266 + 266 = 532 (redondeo por entrada)`.

Es frecuente que el agente ejecute los tests nada más escribirlos, vea dos en rojo y proponga «corregirlos». No le dejes: páralo y rechaza ese cambio. El paso 6 explica por qué están en rojo.

### 5 — Revisa los valores esperados

**Acción:** abre el fichero de tests y busca los dos casos. Recalcula a mano:
- F-12 + F-13: importe 3550 + 3550 = **7100**; comisión 266 + 266 = **532**.
- Pedido completo: importe 3550 + 3550 + 6000 = **13 100** (sin los 270 de gastos); comisión 266 + 266 + 450 = **982**.

**Por qué:** si el asistente se equivocó al calcular a mano, un test «desde la regla» falla por el motivo equivocado. Revisar dos cálculos es rápido y te da confianza en el resto.

**Resultado esperado:** los dos coinciden con tus cuentas.

### 6 — Ejecuta la batería

**Acción:** en la terminal, `npm test -w @telon/api`

**Por qué:** ahora el verde o el rojo dicen algo sobre la regla.

**Resultado esperado:** dos tests en rojo:

```text
AssertionError: expected 533 to be 532
AssertionError: expected 983 to be 982
```

El código calcula la comisión sobre el importe total devuelto (7100 × 7,5 % = 532,5 → 533), no sumando la de cada entrada.

> [!WARNING]
> Si el asistente propone cambiar el `532` del test por `533` «para que pase», no lo aceptes: el test describe la regla. El que está mal es el código.

### 7 — Pide el diagnóstico, no el arreglo

**Acción:** en la terminal, selecciona las líneas del test que falla (desde `FAIL` hasta el `AssertionError`) y cópialas. En el chat, escribe esto, pega la salida donde dice `[salida]` y pulsa <kbd>Enter</kbd>:

```text
Este test falla: [salida]. ¿Cuál es la causa en el código? No lo arregles todavía.
```

**Por qué:** la causa antes que el arreglo. Si el asistente arregla sin explicar, no sabes si ha entendido la regla o ha ajustado números.

**Resultado esperado:** señala `calcRefundAmounts` en `services/api/src/refunds/amounts.ts`: redondea `amount × bps` una sola vez sobre el total, y la regla pide sumar `commission_cents` de cada entrada (que ya viene calculado y guardado en `tickets`).

### 8 — Haz commit de los tests

**Acción:** en la terminal, `git add services/api/test && git commit -m "Tests de devolución a partir de las reglas"`

**Por qué:** los tests en rojo documentan el fallo. El arreglo irá en otro commit, y el historial contará la historia en orden.

**Resultado esperado:** un commit con `fixtures.ts` y los tests nuevos.

## Comprueba tu entendimiento

**El mismo fallo en la API**
Con el proyecto arrancado (`make up-m03`) y `npm run db:reset`, devuelve F-12 y F-13:

```bash
curl -s localhost:3000/api/public/orders/PED-2026-0107/refunds \
  -H 'x-telon-tenant-slug: sala-faro' -H 'content-type: application/json' \
  -d '{"email":"ana.compradora@ejemplo.test","ticket_ids":["PED-2026-0107-1","PED-2026-0107-2"]}'
```

→ `"commission_reversed_cents":533`. El mismo céntimo que dice el test.

## Reto

### 1 — La matriz de reglas y tests

Escribe un prompt para que el asistente cruce cada regla de devolución de `AGENTS.md` con los tests que la cubren y te diga qué regla no tiene ningún test, y por qué no se puede probar en `amounts.ts`.

<details>
<summary>Ver solución</summary>

Un prompt que funciona:

```text
Haz una tabla con cada regla de devolución de AGENTS.md y, para cada una, los tests de
services/api/test/ que la comprueban (fichero y nombre del test). Marca las reglas sin test
y dime en qué función habría que probarlas y qué haría falta simular. No escribas tests.
```

Lo que suele salir: la regla «solo entradas válidas» (no se puede devolver dos veces la misma entrada ni una de un pedido sin pagar) no tiene test. Está en `requestRefund` (`services/api/src/refunds/service.ts`), que consulta la base de datos y llama a la pasarela, así que para probarla sin levantarlas hacen falta mocks: es el lab [02 — Mocks](02-lab-mocks.md).

Pedir la tabla en lugar de «¿faltan tests?» obliga a recorrer todas las reglas, no solo las que el modelo recuerde primero.

</details>

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| Los tests nuevos pasan todos | El asistente sacó los valores esperados del código | Repite el paso 4 insistiendo en «calcula a mano desde la regla» |
| `Cannot find module './fixtures.js'` | Import sin extensión `.js` | En este proyecto los imports llevan `.js` (está en `AGENTS.md`) |
| El test de 48 h falla según la hora | Usa `new Date()` sin fijar | Pasa la fecha como segundo argumento de `canRefundAt` |
