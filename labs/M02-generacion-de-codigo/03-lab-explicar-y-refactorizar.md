# Laboratorio: explicar y refactorizar el cálculo de importes

[← Página anterior](02-lab-generar-devolucion.md) · [Siguiente página →](../M03-testing-y-calidad/README.md)

`calcOrderAmounts`, en `services/api/src/orders/pricing.ts`, calcula precio, gastos y comisión de cada pedido de Telón. Lo escribió el primer equipo y nadie lo ha tocado desde entonces. La devolución va a reutilizar parte de esa lógica, así que antes hay que entenderla y dejarla legible, sin cambiar ni un céntimo de lo que calcula.

### Objetivo

`pricing.ts` explicado (con cada afirmación comprobada), protegido por tests de caracterización y refactorizado con el mismo comportamiento: tests en verde antes y después.

### Punto de partida

- Telón abierto en el Dev Container, carpeta `telon/`.
- Estado: `make init-m02`. `pricing.ts` es la versión heredada y `services/api/test/pricing.test.ts` tiene 5 tests.
- Asistente en modo agente. Si tienes `AGENTS.md`, mejor; este lab funciona igual sin él.

### En qué consiste

Explicación comprobada, red de tests y refactor, en este orden. No cambias el comportamiento ni los tests que ya existen.

### 1 — Pide la explicación

**Acción:** en un chat nuevo, citando el fichero:

```text
Explícame calcOrderAmounts de services/api/src/orders/pricing.ts: qué entra, qué sale y
cada regla de negocio que aplica. Para cada regla, la línea donde está. No cambies nada.
```

**Por qué:** antes de refactorizar hay que saber qué hace el código, incluidas las reglas escondidas en un `if`. Un refactor que no las conoce se las lleva por delante.

**Resultado esperado:** algo así:
- gastos de gestión por entrada (`f = ev.fee_cents`), salvo invitaciones de precio 0;
- comisión `commission_bps` sobre el precio, con `Math.round` por entrada;
- invitaciones sin comisión;
- máximo 10 entradas;
- pedido vacío no permitido;
- precio negativo no permitido;
- total = subtotal + gastos (la comisión no la paga el comprador).

### 2 — Comprueba dos afirmaciones que suelen fallar

**Acción:** busca en el código la respuesta a estas dos preguntas y compárala con la explicación:
1. ¿El límite de 10 entradas se comprueba antes o después de calcular?
2. ¿La línea `if (p == 0) c = 0;` cambia algo?

**Por qué:** son los dos sitios donde una explicación suele «arreglar» el código sin decirlo. El orden del límite no cambia el resultado, pero sí cambia qué error sale primero si el pedido tiene precios negativos y más de 10 entradas. Y la línea del `if` es redundante (0 × bps ya es 0), aunque está ahí. Si el asistente dijo otra cosa, ya sabes cuánto fiarte del resto.

**Resultado esperado:** el límite se comprueba después del bucle, así que con 11 entradas y una negativa sale «precio negativo», no «máximo 10». El `if` no cambia el resultado.

### 3 — Ejecuta los tests existentes

**Acción:** `npm test -w @telon/api`

**Por qué:** es la foto del comportamiento antes del cambio. Si ya hay algo en rojo, no puedes saber si lo rompe tu refactor.

**Resultado esperado:** `Tests  8 passed (8)` (5 de `pricing` y 3 del QR).

### 4 — Pide tests de caracterización

**Acción:**

```text
Antes de refactorizar, añade a services/api/test/pricing.test.ts tests de caracterización que
fijen el comportamiento ACTUAL de calcOrderAmounts, aunque parezca raro:
- un precio cuya comisión acaba en ,5 céntimos (p. ej. 3540 con 750 bps) y cómo se redondea;
- un pedido mixto con una invitación;
- el desglose por entrada (lines);
- qué error sale con 11 entradas si una es negativa.
No cambies pricing.ts.
```

**Por qué:** los tests que ya hay no cubren el redondeo de media unidad ni el desglose por entrada, y es justo lo que un refactor puede cambiar sin querer. Un test de caracterización no dice si el código está bien: dice qué hace hoy.

**Resultado esperado:** 4 tests nuevos, en verde sin tocar `pricing.ts`. Entre ellos: 3540 × 7,5 % = 265,5 → `266` (`Math.round` redondea hacia arriba), y el pedido con 11 entradas y una negativa lanza «precio negativo».

> [!WARNING]
> Si un test nuevo sale en rojo y el asistente propone «arreglar» `pricing.ts`, para. El test está mal: tiene que describir lo que el código hace, no lo que debería hacer.

### 5 — Pide el refactor con restricciones

**Acción:**

```text
Refactoriza services/api/src/orders/pricing.ts:
- misma firma pública (calcOrderAmounts, tipos exportados);
- extrae ticketCommission(priceCents, commissionBps) y ticketAmounts(priceCents, ev);
- constante MAX_TICKETS_PER_ORDER;
- sin let acumuladores ni == ;
- mismo comportamiento exacto: no toques ningún test.
```

**Por qué:** la devolución necesita calcular la comisión de una entrada suelta. Con `ticketCommission` extraída, la regla «por entrada» está en un solo sitio y se puede reutilizar. Las restricciones evitan que el asistente «mejore» la lógica de paso.

**Resultado esperado:** un `pricing.ts` más corto, con las funciones nuevas exportadas y sin cambios en `test/`.

### 6 — Revisa el diff con los tests delante

**Acción:**
1. `git diff --stat`: solo debe aparecer `services/api/src/orders/pricing.ts`.
2. Lee el diff buscando cambios de comportamiento: el orden de las validaciones, el redondeo y el caso de precio 0.
3. `npm test -w @telon/api`

**Por qué:** si el diff toca un test, el «verde» ya no prueba nada. Y el orden de las validaciones es lo que más cambia en un refactor «limpio».

**Resultado esperado:** `Tests  12 passed (12)`. Si falla el test del error con 11 entradas, el refactor ha movido la validación del límite: es un cambio de comportamiento, y decides tú si lo aceptas (actualizando el test a sabiendas) o no.

### 7 — Haz commit

**Acción:** `git add services/api && git commit -m "Refactor del cálculo de importes con tests de caracterización"`

**Por qué:** un refactor va en su propio commit, separado de funcionalidad. Así, si algo se rompe, se revierte sin perder la devolución.

**Resultado esperado:** un commit con `pricing.ts` y `pricing.test.ts`.

> [!NOTE]
> La versión de referencia del curso está en `../.labs/m03-inicio/services/api/src/orders/pricing.ts`. Compárala con la tuya: `diff services/api/src/orders/pricing.ts ../.labs/m03-inicio/services/api/src/orders/pricing.ts`.

## Comprueba tu entendimiento

**El refactor no ha cambiado ni un céntimo**
Con Telón arrancado, compra en la tienda la butaca **A-1** y un pase **VIP** con la tarjeta `4242 4242 4242 4242`.
→ Pagas 97,30 € (35,50 + 60,00 + 1,80 de gastos), lo mismo que habrías pagado antes del refactor.

**La regla en un solo sitio**
Pregunta al asistente: «¿Dónde se decide que la comisión se redondea por entrada?».
→ Cita `ticketCommission` en `pricing.ts`, una sola línea.

## Reto

### 1 — El test que no debía pasar

Cambia a mano `Math.round` por `Math.floor` en `ticketCommission` y ejecuta los tests. ¿Cuántos fallan? Deshaz el cambio.

<details>
<summary>Ver solución</summary>

Con los tests heredados solo falla alguno si un precio de prueba da decimales (con 6000 a 750 bps sale 450 exacto, así que no falla). El test de caracterización de 3540 → 266 sí falla (`Math.floor` da 265). Por eso sirve: protege justo el comportamiento que los tests originales no veían. Deshaz con `git checkout services/api/src/orders/pricing.ts`.

</details>

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| El asistente cambió el test para que pasara | No dejaste claro que los tests no se tocan | `git checkout services/api/test` y repite el paso 5 con la restricción en mayúsculas |
| `ticketCommission is not exported` en otro fichero | El refactor no exportó la función | Pide exportarla; es pública a propósito |
| Typecheck falla con `possibly undefined` | Acceso a `items[i]` sin comprobar | Usa `map`/`reduce` en lugar de índices |
