# Del autocompletado al agente

[← Página anterior](README.md) · [Siguiente página →](01-lab-entorno-y-primer-chat.md)

Autocompletado, chat y agente parecen la misma IA con distinta interfaz, pero no lo son: cada uno trabaja con una parte diferente del proyecto, y eso decide cuándo acierta y cómo se equivoca. Para verlo, en el proyecto Telón se plantea a las tres formas de asistente el mismo problema: **cómo se calcula la comisión de las entradas**. La respuesta correcta está en el código, así que cada resultado se puede comparar con ella.

## Punto de partida

- Repositorio del curso abierto en el Dev Container (local o Codespaces). La carpeta de trabajo es `telon/`.
- Una terminal en `telon/` (**Terminal → New Terminal**).
- La respuesta correcta, para comparar. Está en `services/api/src/orders/pricing.ts`, líneas 43–45:

```ts
// comisión de plataforma: bps sobre el precio, redondeo por entrada (lo pide liquidaciones)
let c = (p * ev.commission_bps) / 10000;
c = Math.round(c);
```

La comisión se calcula **por entrada**, como un porcentaje del precio de esa entrada (`commission_bps`, 750 = 7,5 % en la Sala Faro), y se **redondea por entrada**. Con dos butacas de 35,50 € da 266 + 266 = **532 céntimos**. Si se calculara sobre el total (7100 × 7,5 % = 532,5), saldría **533**.

### Qué asistente hace cada paso

| Paso | GitHub Copilot (VS Code o Codespaces) | Cursor | Claude Code |
|------|---------------------------------------|--------|-------------|
| 1 · Autocompletado | Sugerencias en gris al escribir; <kbd>Tab</kbd> acepta, <kbd>Esc</kbd> descarta, <kbd>Alt</kbd>+<kbd>\\</kbd> pide una, <kbd>Alt</kbd>+<kbd>]</kbd> muestra la siguiente | Cursor Tab, con las mismas teclas <kbd>Tab</kbd> y <kbd>Esc</kbd> | No tiene autocompletado: este paso se hace con Copilot (el plan gratuito incluye las sugerencias) |
| 2 · Chat | Vista de chat (<kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>I</kbd>), modo **Ask** | Chat (<kbd>Ctrl</kbd>+<kbd>L</kbd>), modo **Ask** | No tiene un chat sin acceso al repositorio: este paso se hace con Copilot o Cursor |
| 3 · Agente | Vista de chat, modo **Agent** | Chat, modo **Agent** | `claude` en la terminal, dentro de `telon/` |

### Preparación

1. En la terminal: `CONFIRM=1 make init-m01`. Deja el proyecto tal como lo hereda el equipo, sin ficheros de contexto para la IA. Responde `telon/ está en el punto de partida de m01.`
2. Se cierran todas las pestañas del editor (<kbd>Ctrl</kbd>+<kbd>K</kbd> <kbd>W</kbd>). El autocompletado y el chat de Copilot usan como contexto los ficheros abiertos; para que el paso 1 y el 2 sean limpios, no puede haber ninguno.

> [!NOTE]
> Las respuestas exactas cambian con el modelo y la versión del asistente. Lo que se repite es el tipo de error de cada forma, porque depende de lo que cada una tiene delante. Si sale otra cosa, la pregunta que hay que hacerse es la misma: qué tenía delante para responder eso.

## Recorrido

### 1. El autocompletado completa lo más habitual

En `pricing.ts` el comentario de la línea 43 ya dice la regla. Si se trabaja ahí, el autocompletado la copia. La situación interesante es la de quien empieza código nuevo en otro fichero, donde esa regla no está a la vista.

1. En el explorador, clic derecho sobre `services/api/src/orders` → **New File** → `refund-commission.ts`. Es un fichero nuevo y vacío; no se toca `pricing.ts`.
2. Se escriben a mano estas cuatro líneas. Si aparece alguna sugerencia gris mientras tanto, se descarta con <kbd>Esc</kbd>:

```ts
import type { EventPricing } from './pricing.js';

// comisión de plataforma que se revierte cuando el comprador devuelve varias entradas
export function commissionToReverse(prices_cents: number[], ev: EventPricing): number {
```

3. Con el cursor al final de la última línea, se pulsa <kbd>Enter</kbd> y se espera un par de segundos. Si no aparece nada, <kbd>Alt</kbd>+<kbd>\\</kbd> la pide.

**Qué se ve:** una sugerencia en gris que suma los precios y redondea una sola vez al final, del tipo:

```ts
  const total = prices_cents.reduce((acc, p) => acc + p, 0);
  return Math.round((total * ev.commission_bps) / 10000);
```

No se acepta. <kbd>Alt</kbd>+<kbd>]</kbd> enseña otras sugerencias, y casi todas calculan sobre el total.

**Qué muestra:** el código compila y parece razonable, pero con F-12 y F-13 devuelve 533, no 532. El autocompletado no ha ido a buscar cómo calcula el proyecto la comisión: ha seguido el texto con lo más frecuente en cualquier código parecido. Es el mismo fallo que aparece en la devolución del M03.

4. Se abre `pricing.ts` en otra pestaña (<kbd>Ctrl</kbd>+<kbd>P</kbd> → `pricing.ts`) y se vuelve a `refund-commission.ts`. Se borra lo que haya debajo de la firma y se pulsa <kbd>Enter</kbd> otra vez.

**Qué se ve:** a menudo la sugerencia cambia y redondea entrada a entrada, por ejemplo con `Math.round` dentro del `reduce`.

**Qué muestra:** el autocompletado usa como contexto las pestañas abiertas. Con `pricing.ts` delante, imita su regla; sin él, inventa. Si la sugerencia no cambia, la conclusión es la misma: lo que propone depende de lo que tiene alrededor, no de lo que es correcto.

5. Para dejarlo como estaba: se cierra la pestaña y, en la terminal, `rm services/api/src/orders/refund-commission.ts`.

### 2. El chat solo sabe lo que se le da

1. Se cierran todas las pestañas (<kbd>Ctrl</kbd>+<kbd>K</kbd> <kbd>W</kbd>).
2. Se abre el chat en modo **Ask** y se empieza una conversación nueva (botón **+** de la vista de chat).
3. Se comprueba que no hay ningún fichero adjunto. En Copilot, el fichero activo aparece como una etiqueta encima de la caja de texto; si está, se desactiva con un clic.
4. Se pregunta:

```text
En el proyecto, ¿cómo se calcula la comisión de plataforma de una entrada?
```

**Qué se ve:** una respuesta segura y genérica, del tipo «un porcentaje configurable sobre el total del pedido, redondeado al final».

**Qué muestra:** falla en los dos puntos importantes, porque el código calcula por entrada y redondea por entrada. El chat no ha abierto ningún fichero: ha descrito cómo suele funcionar una tienda de entradas.

5. En una conversación nueva, la misma pregunta con el fichero adjunto: en Copilot se escribe `#` y se elige `pricing.ts`; en Cursor, `@pricing.ts`.

**Qué se ve:** la regla correcta, citando las líneas 43–45 y el `Math.round` por entrada.

**Qué muestra:** el modelo es el mismo y la pregunta también. La respuesta cambia porque ahora tiene el código delante.

### 3. El agente busca la respuesta, ejecuta y propone cambios

1. Se abre una conversación nueva en modo **Agent** (en Claude Code: `claude` en la terminal, desde `telon/`).
2. Se pide:

```text
Explícame cómo se calcula la comisión de una entrada en el proyecto y compruébalo con un test.
```

3. El agente va contando lo que hace: busca `commission` en el repositorio y abre `pricing.ts` y `services/api/test/pricing.test.ts`. Antes de ejecutar un comando pide permiso; se le permite `npm test -w @telon/api`.
4. Si propone crear o modificar ficheros (lo habitual es un test nuevo), se enseña el diff y se rechaza: **Undo** en Copilot, **Reject** en Cursor, «No» en Claude Code.

**Qué se ve:** la regla correcta, con fichero y líneas, y la salida de Vitest en verde que la confirma. Y, casi siempre, más cambios de los pedidos: un test nuevo, a veces un retoque en `pricing.ts`.

**Qué muestra:** el agente acierta porque busca la respuesta en lugar de suponerla, y la comprueba ejecutando. El riesgo ya no es que invente, sino que haga más de lo que se le ha pedido. A un agente hay que decirle qué puede tocar.

5. Para dejarlo como estaba: `git status` en la terminal. Si hay cambios, `CONFIRM=1 make init-m01`.

## Qué queda visto

| Forma | Qué tiene delante | Cómo se equivoca en el proyecto |
|-------|-------------------|---------------------------------|
| Autocompletado | El fichero, el cursor y las pestañas abiertas | Calcula la comisión sobre el total: lo más habitual, no lo que hace el proyecto |
| Chat | Lo que se le pega o se le cita | Describe una comisión «sobre el total» sin haber leído el código |
| Agente | El repositorio, la terminal y los ficheros | Acierta y lo comprueba, pero cambia más de lo pedido si no se le pone límite |

La calidad de la respuesta depende de lo que el asistente tiene delante. Lo que no ve, lo rellena con lo más habitual. Por eso, en todo el curso, una respuesta se acepta cuando se ha comprobado en el código o con un test.

En [01 — Entorno y primer chat](01-lab-entorno-y-primer-chat.md) arrancas el proyecto y el asistente en tu puesto, y haces tu primera pregunta comprobada. Se puede hacer sin haber seguido esta demostración.
