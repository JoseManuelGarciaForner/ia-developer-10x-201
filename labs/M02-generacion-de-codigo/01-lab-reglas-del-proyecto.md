# Laboratorio: reglas del proyecto

[← Página anterior](00-contexto-cambia-el-diff.md) · [Siguiente página →](02-lab-generar-devolucion.md)

Cada vez que abres un chat nuevo, el asistente vuelve a no saber nada del proyecto Telón. En este lab escribes con él el contexto del proyecto en `AGENTS.md`: cómo se arranca y se prueba, el mapa, las convenciones y las reglas de negocio de la devolución. Después compruebas que un chat nuevo las aplica sin que se las repitas.

### Objetivo

`AGENTS.md` en la raíz de `telon/`, revisado línea a línea, con un fichero por asistente que apunta a él, y un chat nuevo que responde con esas reglas.

### Punto de partida

- El repositorio del curso abierto en el Dev Container (local o Codespaces). El explorador muestra la carpeta `telon/`.
- Una terminal en `telon/` (**Terminal → New Terminal**). Escribe `CONFIRM=1 make init-m02`; responde `telon/ está en el punto de partida de m02.` Es el código heredado, sin ficheros de contexto para la IA.
- Un asistente en modo agente:

| Asistente | Cómo abrir una conversación nueva |
|-----------|-----------------------------------|
| VS Code o Codespaces + Copilot | <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>I</kbd> → **+** → modo **Agent** bajo la caja de texto |
| Cursor | <kbd>Ctrl</kbd>+<kbd>L</kbd> → **+** → modo **Agent** |
| Claude Code | En una terminal nueva, dentro de `telon/`: `claude`. Para empezar de cero dentro de `claude`: `/clear` |

- Las reglas de negocio de la devolución, tal como las da negocio:

| Pregunta | Respuesta de negocio |
|----------|----------------------|
| ¿Se toca el pedido original? | No. Un pedido pagado no se modifica; la devolución es un registro nuevo que lo referencia |
| ¿Cuánto se devuelve? | El precio de las entradas. Los gastos de gestión no se devuelven nunca |
| ¿Y la comisión del proyecto? | Se revierte la que se cobró por cada entrada (redondeada por entrada, como al comprar) |
| ¿Hasta cuándo? | Hasta 48 h antes del evento |
| ¿Qué pasa con el QR? | Deja de validar en puerta, y la butaca vuelve a la venta |
| ¿Y el correo? | Uno de confirmación, una sola vez, por la cola |

> [!NOTE]
> Al empezar, el asistente solo tiene el código y lo que su herramienta trae de serie. A partir del paso 6, cada herramienta leerá además `AGENTS.md` al abrir una conversación. Esa diferencia es lo que se comprueba en el paso 7.

### En qué consiste

El asistente redacta un borrador a partir del código. Tú quitas lo que no puedes comprobar y añades lo que solo sabe negocio. Después creas los ficheros de cada herramienta y lo pruebas en un chat nuevo.

### 1 — Pide un borrador basado solo en el código

**Acción:** ve al chat, abre una conversación nueva, escribe esto y pulsa <kbd>Enter</kbd>. Acepta los permisos de lectura y el de crear el fichero.

```text
Crea AGENTS.md en la raíz de telon/ con el contexto que necesita un agente para trabajar aquí:
1. Cómo se arranca y cómo se prueba (comandos exactos).
2. Mapa: qué hay en cada carpeta de apps/, packages/ y services/.
3. Convenciones que veas repetidas en el código (dinero, errores, SQL, imports, idioma).
Incluye solo lo que puedas comprobar en el código. No uses el README.md: no es fiable.
Máximo 60 líneas.
```

**Por qué:** el asistente lee el repositorio más rápido que tú, pero tiende a rellenar con cosas genéricas. Pedirle que se limite a lo comprobable y que ignore el README (que miente sobre el puerto, el script `seed` y SendGrid) reduce lo que tendrás que quitar.

**Resultado esperado:** el agente lee `package.json`, varios ficheros de cada carpeta y crea `AGENTS.md` (aparece en el explorador, junto a `package.json`). Ábrelo con <kbd>Ctrl</kbd>+<kbd>P</kbd> → `AGENTS.md`. Tiene tres secciones. Seguramente aparecen `npm test`, `npm run lint`, `npm run typecheck`, `npm run dev`, los seis paquetes y convenciones como «importes en céntimos» o «errores con `HttpError`».

Según el modelo, el borrador sale más largo o más corto, y con más o menos cosas genéricas («seguimos buenas prácticas», «código limpio»). Es normal: sin un límite y sin una lista de lo que interesa, el modelo escribe lo que suelen tener estos ficheros.

### 2 — Comprueba cada comando

**Acción:** en la terminal, ejecuta uno a uno los comandos que aparezcan en `AGENTS.md`. Como mínimo: `npm test`, `npm run lint`, `npm run typecheck` y `npm run db:reset`.

**Por qué:** un comando inventado en `AGENTS.md` es peor que no tener ninguno: el agente lo ejecutará con confianza y perderá tiempo con el error. Lo que entra en el contexto tiene que funcionar.

**Resultado esperado:** `npm test` termina con `Tests  21 passed (21)`; `lint` y `typecheck`, sin errores; `db:reset`, con `base de datos reiniciada` o similar. Si el borrador incluía otro (por ejemplo `npm run seed` o `npm run build` en la raíz), bórralo o corrígelo.

### 3 — Revisa el mapa y las convenciones

**Acción:** para cada línea del mapa y de las convenciones de `AGENTS.md`, abre el fichero que lo demuestra con <kbd>Ctrl</kbd>+<kbd>P</kbd>. Estas, por ejemplo:
- «importes en céntimos»: `services/api/migrations/001_init.sql`, columnas `*_cents`;
- «errores HTTP con `HttpError`»: `services/api/src/errors.ts` y el `setErrorHandler` de `server.ts`;
- «SQL parametrizado»: cualquier `pool.query(` de `routes/admin.ts`.

Borra lo que no encuentres.

**Por qué:** cada regla de `AGENTS.md` va a guiar cientos de cambios. Una regla falsa («usamos Prisma») genera código que no encaja.

**Resultado esperado:** un mapa y una lista de convenciones más cortos que el borrador y que puedes defender línea a línea.

### 4 — Añade las reglas de negocio

**Acción:** abre `AGENTS.md`, ve al final (<kbd>Ctrl</kbd>+<kbd>End</kbd>) y pega una sección `## Reglas de negocio` con la tabla del punto de partida, escrita como reglas. Añade también las dos que se ven en el código: gastos de gestión por entrada y máximo 10 entradas por pedido. Puedes pegar esto tal cual y retocarlo:

```markdown
## Reglas de negocio

- Un pedido pagado no se modifica. Cambios posteriores (devoluciones) son registros nuevos que lo referencian.
- Gastos de gestión: por entrada, no se reembolsan nunca.
- Comisión de plataforma: `commission_bps` sobre el precio, redondeada por entrada. La de un pedido o una devolución es la suma de las de sus entradas.
- Devoluciones: solo de pedidos pagados, solo entradas válidas, hasta 48 h antes del evento. La entrada devuelta deja de validar en puerta y su butaca vuelve a la venta.
- Lo que sale por la cola tiene que poder reintentarse sin efectos duplicados.
- Máximo 10 entradas por pedido.
```

**Por qué:** es lo que el asistente no puede deducir del código, y es justo donde se equivocó en el M01. Escrito aquí, deja de depender de que alguien lo recuerde en el prompt.

**Resultado esperado:** `AGENTS.md` con la sección nueva. Las reglas son frases que se pueden comprobar, no intenciones («hay que tener cuidado con las devoluciones»).

### 5 — Añade lo que no hay que hacer

**Acción:** al final de `AGENTS.md`, pega una sección `## No hacer` con tres líneas, y guarda con <kbd>Ctrl</kbd>+<kbd>S</kbd>:

```markdown
## No hacer

- No pegar credenciales reales ni API keys de proveedores de los promotores.
- No añadir dependencias sin comprobar que existen en npm y que hacen falta.
- No editar migraciones ya aplicadas ni los datos de ejemplo para que un test pase.
```

**Por qué:** son los tres atajos que un agente toma cuando algo falla: pegar un secreto, instalar un paquete que «suena bien» y cambiar el dato en lugar del código.

**Resultado esperado:** `AGENTS.md` completo, en torno a 60 líneas.

### 6 — Conecta cada asistente con `AGENTS.md`

**Acción:** crea tres ficheros. Para cada uno: en el explorador, clic derecho en el espacio vacío bajo los ficheros de `telon/` → **New File…**, escribe la ruta tal cual (con las barras: VS Code crea las carpetas), pega el contenido y guarda con <kbd>Ctrl</kbd>+<kbd>S</kbd>.

`CLAUDE.md` (Claude Code; `@` importa el fichero):

```markdown
@AGENTS.md
```

`.github/copilot-instructions.md` (GitHub Copilot):

```markdown
Lee y aplica `AGENTS.md` en la raíz del proyecto: stack, cómo se prueba, convenciones y reglas de negocio.
```

`.cursor/rules/telon.mdc` (Cursor):

```markdown
---
description: Contexto del proyecto Telón
alwaysApply: true
---

Lee y aplica `AGENTS.md` en la raíz de `telon/`: stack, cómo se prueba, convenciones y reglas de negocio.
```

**Por qué:** cada herramienta busca su propio fichero. Si cada una tiene una copia de las reglas, acabarán divergiendo. Con una sola fuente (`AGENTS.md`) y punteros finos, cualquiera del equipo, con el asistente que use, trabaja con las mismas reglas.

**Resultado esperado:** `git status` muestra `AGENTS.md`, `CLAUDE.md`, `.github/` y `.cursor/` como nuevos.

### 7 — Pruébalo en un chat nuevo

**Acción:** cierra la conversación y abre una **nueva** (**+**, o `/clear` en Claude Code). Así no queda nada de lo que habéis hablado. Escribe esto, sin dar más contexto, y pulsa <kbd>Enter</kbd>:

```text
Si un comprador devuelve la butaca F-13 del pedido PED-2026-0107, ¿cuánto se le devuelve
y qué pasa con la comisión? ¿Puede hacerlo el 13 de noviembre?
```

**Por qué:** es la prueba de que el contexto viaja con el repositorio y no con la conversación.

**Resultado esperado:** 35,50 € (sin los 0,90 de gastos). Se revierten 2,66 € de comisión (3550 × 7,5 % = 266,25, redondeado por entrada). El 13 de noviembre no puede, porque el evento es el 14 a las 21:00 y las devoluciones cierran 48 h antes. El asistente cita `AGENTS.md`: en Copilot y Cursor aparece en la lista de referencias de la respuesta; en Claude Code, `CLAUDE.md` se carga al arrancar.

Para saber el precio de F-13 y la fecha del evento, el agente suele consultar `services/api/src/seed.ts`. Es lo esperado: los datos están en el código, las reglas en `AGENTS.md`.

**Por qué pasa:** la conversación es nueva y el prompt no menciona ninguna regla. Las reglas llegan porque cada herramienta añade su fichero de instrucciones al empezar la conversación, y ese fichero apunta a `AGENTS.md`. Sin el paso 6, la respuesta sería la del M01: «se devuelve el total» y ninguna mención al plazo.

> [!TIP]
> Si no lo aplica, comprueba que el chat está abierto en `telon/` y que el fichero de tu herramienta está en la ruta exacta. En Cursor, **Settings → Rules** muestra las reglas activas; en Claude Code, `/memory` muestra los ficheros cargados.

### 8 — Compara con la referencia y haz commit

**Acción:** en la terminal:
1. Compara tu versión con la de referencia del curso: `diff AGENTS.md ../.labs/m03-inicio/AGENTS.md`
2. Incorpora lo que te parezca que falta y quita lo que sobre.
3. Haz commit: `git add AGENTS.md CLAUDE.md .github .cursor && git commit -m "Contexto del proyecto para asistentes"`

**Por qué:** la referencia no es «la buena», es otra versión revisada. Comparar dos versiones obliga a decidir cada línea. El commit hace que el contexto llegue a quien clone el repositorio.

**Resultado esperado:** `git log --oneline -1` muestra tu commit, y `git show --stat HEAD` lista `AGENTS.md`, `CLAUDE.md`, `.github/copilot-instructions.md` y `.cursor/rules/telon.mdc`.

## Comprueba tu entendimiento

**La regla que no está**
En un chat nuevo, pregunta: «¿Cuál es la comisión mínima por entrada en el proyecto?».
→ El asistente responde que no hay comisión mínima en el código ni en `AGENTS.md`, en lugar de inventarse una cifra.

**Un comando del contexto**
Pide: «Ejecuta las comprobaciones que indica AGENTS.md antes de dar un cambio por bueno».
→ El agente ejecuta `npm test`, `npm run lint` y `npm run typecheck` sin preguntarte cómo se hace.

## Reto

### 1 — Contexto para quien escribe páginas de eventos

Los promotores escriben sus páginas en TSX con `@telon/ui`, y un agente que les ayude necesita reglas distintas de las del backend. Escribe un prompt para que el asistente redacte esa sección de `AGENTS.md` (máximo diez líneas, solo lo que pueda demostrar en el código) y compruébalo: en una conversación nueva, pídele una página de evento y pégala en el editor del backoffice.

<details>
<summary>Ver solución</summary>

Un prompt que funciona:

```text
Añade a AGENTS.md una sección "Páginas de eventos (TSX de los promotores)" de máximo 10 líneas
con lo que necesita un agente para escribir una página: qué puede importar, qué tiene que
exportar, qué componentes hay y cómo se cambia el color. Solo lo que puedas demostrar en
packages/page-runtime y packages/ui; cita el fichero de cada regla.
```

Lo que tiene que salir, y se comprueba en `packages/page-runtime/src/compile.ts` y `packages/ui/src/index.ts`: la página es un módulo TSX con `export default`; solo puede importar de `react`, `react/jsx-runtime` y `@telon/ui`; los componentes son `SeatPicker`, `PassSelector`, `Cart`, `Checkout` y `TicketQR`; `useEvent()` da los datos del evento; el color de acento es la variable CSS `--telon-accent`.

La prueba es pedir en una conversación nueva «Escribe la página de un evento con platea, carrito y pago, y el acento en verde» y pegar el resultado en **Editar página** del backoffice. Si importa algo fuera de esos tres módulos, la vista previa muestra un error de `require`: falta esa regla en la sección o no está clara.

</details>

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| El chat nuevo no aplica las reglas | El editor está abierto en la raíz del repositorio, no en `telon/` | Abre `telon/` o lanza `claude` desde `telon/` |
| `AGENTS.md` de 300 líneas | El borrador copió media base de código | Pide «máximo 60 líneas» y quita lo que no sea una regla o un comando |
| Copilot no lee `.github/copilot-instructions.md` | La opción de instrucciones está desactivada | En VS Code, activa `github.copilot.chat.codeGeneration.useInstructionFiles` |
| `git status` no muestra `AGENTS.md` | Lo has creado fuera de `telon/` | Muévelo a `telon/AGENTS.md` |
