# Laboratorio: explicar y refactorizar el cálculo de importes

[← Página anterior](02-lab-generar-devolucion.md) · [Siguiente página →](../M03-testing-y-calidad/README.md)

`calcOrderAmounts`, en `services/api/src/orders/pricing.ts`, calcula precio, gastos y comisión de cada pedido del proyecto Telón. Lo escribió el primer equipo y nadie lo ha tocado desde entonces. La devolución va a reutilizar parte de esa lógica, así que antes hay que entenderla y dejarla legible, sin cambiar ni un céntimo de lo que calcula.

### Objetivo

`pricing.ts` explicado (con cada afirmación comprobada), protegido por tests de caracterización y refactorizado con el mismo comportamiento: tests en verde antes y después.

### Punto de partida

- El repositorio del curso abierto en el Dev Container (local o Codespaces). El explorador muestra la carpeta `telon/`.
- Una terminal en `telon/`. Escribe `CONFIRM=1 make init-m02`; responde `telon/ está en el punto de partida de m02.` `pricing.ts` es la versión heredada y `services/api/test/pricing.test.ts` tiene 5 tests.
- Un asistente en modo agente:

| Asistente | Cómo abrir una conversación nueva |
|-----------|-----------------------------------|
| VS Code o Codespaces + Copilot | <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>I</kbd> → **+** → modo **Agent** bajo la caja de texto |
| Cursor | <kbd>Ctrl</kbd>+<kbd>L</kbd> → **+** → modo **Agent** |
| Claude Code | En una terminal nueva: `claude` |

> [!NOTE]
> Este lab no necesita `AGENTS.md`: todo lo que hace falta está en `pricing.ts` y en sus tests. El asistente trabaja con el código y con lo que su herramienta trae de serie. Si tienes tu `AGENTS.md` del lab 01, déjalo; no cambia los resultados.

### En qué consiste

Explicación comprobada, red de tests y refactor, en este orden. No cambias el comportamiento ni los tests que ya existen.

### 1 — Pide la explicación

**Acción:** ve al chat, abre una conversación nueva, pega esto y pulsa <kbd>Enter</kbd>:

```text
Explícame calcOrderAmounts de services/api/src/orders/pricing.ts: qué entra, qué sale y
cada regla de negocio que aplica. Para cada regla, la línea donde está. No cambies nada.
```

**Por qué:** antes de refactorizar hay que saber qué hace el código, incluidas las reglas escondidas en un `if`. Un refactor que no las conoce se las lleva por delante.

**Resultado esperado:** el agente abre `pricing.ts` y responde con una lista de reglas, cada una con su número de línea. Algo así:
- gastos de gestión por entrada (`f = ev.fee_cents`), salvo invitaciones de precio 0;
- comisión `commission_bps` sobre el precio, con `Math.round` por entrada;
- invitaciones sin comisión;
- máximo 10 entradas;
- pedido vacío no permitido;
- precio negativo no permitido;
- total = subtotal + gastos (la comisión no la paga el comprador).

Unos modelos añaden opiniones («el código es mejorable», «usa `==` en lugar de `===`»). Ignóralas de momento: aquí solo interesa qué hace.

### 2 — Comprueba dos afirmaciones que suelen fallar

**Acción:** abre `pricing.ts` (<kbd>Ctrl</kbd>+<kbd>P</kbd> → `pricing.ts`), busca la respuesta a estas dos preguntas y compárala con la explicación del asistente:
1. ¿El límite de 10 entradas se comprueba antes o después de calcular?
2. ¿La línea `if (p == 0) c = 0;` cambia algo?

**Por qué:** son los dos sitios donde una explicación suele «arreglar» el código sin decirlo. El orden del límite no cambia el resultado, pero sí cambia qué error sale primero si el pedido tiene precios negativos y más de 10 entradas. Y la línea del `if` es redundante (0 × bps ya es 0), aunque está ahí. Si el asistente dijo otra cosa, ya sabes cuánto fiarte del resto.

**Resultado esperado:** el límite se comprueba después del bucle (líneas 52–55), así que con 11 entradas y una negativa sale «precio negativo», no «máximo 10». El `if` de la línea 46 no cambia el resultado. Es frecuente que la explicación diga que el límite se comprueba «al principio»: el modelo describe dónde estaría en un código bien escrito, no dónde está en este.

### 3 — Ejecuta los tests existentes

**Acción:** en la terminal, `npm test -w @telon/api`

**Por qué:** es la foto del comportamiento antes del cambio. Si ya hay algo en rojo, no puedes saber si lo rompe tu refactor.

**Resultado esperado:** `Tests  8 passed (8)` (5 de `pricing` y 3 del QR).

### 4 — Pide tests de caracterización

**Acción:** en el mismo chat, pega esto y pulsa <kbd>Enter</kbd>. Acepta los permisos para modificar el test y ejecutarlo.

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

**Resultado esperado:** el agente modifica solo `pricing.test.ts`, ejecuta los tests y enseña la salida: 4 tests nuevos, en verde sin tocar `pricing.ts`. Entre ellos: 3540 × 7,5 % = 265,5 → `266` (`Math.round` redondea hacia arriba), y el pedido con 11 entradas y una negativa lanza «precio negativo».

> [!WARNING]
> Si un test nuevo sale en rojo y el asistente propone «arreglar» `pricing.ts`, para. El test está mal: tiene que describir lo que el código hace, no lo que debería hacer.

### 5 — Pide el refactor con restricciones

**Acción:** en el mismo chat, pega esto y pulsa <kbd>Enter</kbd>:

```text
Refactoriza services/api/src/orders/pricing.ts:
- misma firma pública (calcOrderAmounts, tipos exportados);
- extrae ticketCommission(priceCents, commissionBps) y ticketAmounts(priceCents, ev);
- constante MAX_TICKETS_PER_ORDER;
- sin let acumuladores ni == ;
- mismo comportamiento exacto: no toques ningún test.
```

**Por qué:** la devolución necesita calcular la comisión de una entrada suelta. Con `ticketCommission` extraída, la regla «por entrada» está en un solo sitio y se puede reutilizar. Las restricciones evitan que el asistente «mejore» la lógica de paso.

**Resultado esperado:** un `pricing.ts` más corto, con las funciones nuevas exportadas y sin cambios en `test/`. Lo habitual es que el agente ejecute los tests al terminar. Si alguno falla y propone cambiar el test, recházalo: lo que hay que mirar es el refactor (paso 6).

### 6 — Revisa el diff con los tests delante

**Acción:** en la terminal:
1. `git diff --stat`: solo debe aparecer `services/api/src/orders/pricing.ts`.
2. Lee el diff buscando cambios de comportamiento: el orden de las validaciones, el redondeo y el caso de precio 0.
3. `npm test -w @telon/api`

**Por qué:** si el diff toca un test, el «verde» ya no prueba nada. Y el orden de las validaciones es lo que más cambia en un refactor «limpio».

**Resultado esperado:** `Tests  12 passed (12)`. Si falla el test del error con 11 entradas, el refactor ha movido la validación del límite: es un cambio de comportamiento, y decides tú si lo aceptas (actualizando el test a sabiendas) o no.

### 7 — Haz commit

**Acción:** en la terminal, `git add services/api && git commit -m "Refactor del cálculo de importes con tests de caracterización"`

**Por qué:** un refactor va en su propio commit, separado de funcionalidad. Así, si algo se rompe, se revierte sin perder la devolución.

**Resultado esperado:** un commit con `pricing.ts` y `pricing.test.ts`.

> [!NOTE]
> La versión de referencia del curso está en `../.labs/m03-inicio/services/api/src/orders/pricing.ts`. Compárala con la tuya: `diff services/api/src/orders/pricing.ts ../.labs/m03-inicio/services/api/src/orders/pricing.ts`.

## Comprueba tu entendimiento

**El refactor no ha cambiado ni un céntimo**
Con el proyecto arrancado, compra en la tienda la butaca **A-1** y un pase **VIP** con la tarjeta `4242 4242 4242 4242`.
→ Pagas 97,30 € (35,50 + 60,00 + 1,80 de gastos), lo mismo que habrías pagado antes del refactor.

**La regla en un solo sitio**
Pregunta al asistente: «¿Dónde se decide que la comisión se redondea por entrada?».
→ Cita `ticketCommission` en `pricing.ts`, una sola línea.

## Reto

### 1 — Que el asistente ponga a prueba tus tests

Unos tests en verde no dicen si protegen de algo. Escribe un prompt para que el asistente compruebe tu red de tests de `pricing.ts` introduciendo errores pequeños en el código, uno cada vez (cambiar `Math.round` por `Math.floor`, quitar el `if (p == 0)`, mover el límite de 10 entradas), ejecutando los tests después de cada uno y deshaciéndolo. Tiene que devolverte una tabla: error introducido y si algún test lo detectó.

<details>
<summary>Ver solución</summary>

Un prompt que funciona:

```text
Comprueba la calidad de services/api/test/pricing.test.ts con mutaciones manuales en
services/api/src/orders/pricing.ts. Para cada mutación: aplícala, ejecuta
npm test -w @telon/api, di qué test falla (o ninguno) y deshazla con git checkout
antes de la siguiente. Mutaciones: Math.round -> Math.floor en la comisión; quitar la
regla de invitaciones sin comisión; comprobar el límite de 10 antes del bucle; gastos
también en invitaciones. Al final, una tabla: mutación, ¿detectada?, por qué. No dejes
ningún cambio en pricing.ts.
```

Lo que suele salir: `Math.floor` solo lo detecta el test de caracterización de 3540 → 266 (con los heredados no falla, porque 6000 × 7,5 % da exacto). Quitar la regla de invitaciones no lo detecta nadie, porque 0 × bps ya es 0: esa línea es redundante. Mover el límite lo detecta el test de 11 entradas con una negativa. Los gastos en invitaciones, el test del pedido mixto.

Al acabar, `git status` no tiene que mostrar cambios en `pricing.ts`. Si los muestra, el agente no deshizo alguna mutación: `git checkout services/api/src/orders/pricing.ts`. Esta técnica le saca partido al agente en lo que hace bien (repetir cambio, ejecución y vuelta atrás) y te deja a ti la decisión de qué test falta.

</details>

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| El asistente cambió el test para que pasara | No dejaste claro que los tests no se tocan | `git checkout services/api/test` y repite el paso 5 con la restricción en mayúsculas |
| `ticketCommission is not exported` en otro fichero | El refactor no exportó la función | Pide exportarla; es pública a propósito |
| Typecheck falla con `possibly undefined` | Acceso a `items[i]` sin comprobar | Usa `map`/`reduce` en lugar de índices |
