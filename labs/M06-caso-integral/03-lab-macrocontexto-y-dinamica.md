# Laboratorio: macrocontexto y dinámica de equipo (dev1)

[← Página anterior](02-lab-explorar-y-contextualizar.md) · [Siguiente página →](04-lab-dev2-sin-memoria.md)

Cada repositorio heredado ya tiene su `AGENTS.md`, pero el fallo de DEV-430 no está en ninguno: está entre ellos. El proyecto Telón añadió un estado de entrada (`refunded`) y dos repositorios que leen su base de datos no se enteraron. En este lab escribes el contexto que los une, la forma de trabajar del equipo, y practicas un cambio de contexto en una rama con su conflicto al fusionar.

### Objetivo

`contexto-equipo` con el mapa de dependencias, los contratos y la dinámica del equipo; cada repositorio apuntando a él; y un conflicto en un `AGENTS.md` resuelto al fusionar.

### Punto de partida

- Desde `telon/`: `make init-m06` y, si no has hecho el lab anterior, `make contexto-m06` (sube como `dev1` un `AGENTS.md` comprobado en cada repositorio).
- Si lo hiciste, sigue con tus clones de `workspace/m06/dev1`.
- El asistente abierto en `workspace/m06/dev1`.

### En qué consiste

Contratos, mapa, punteros, dinámica escrita y un ejercicio de ramas. Solo tocas ficheros de contexto, no código.

### 1 — Saca los contratos

**Acción:**

```text
Lee los AGENTS.md y el código de control-acceso, liquidaciones, tarifas y widget-embebido.
Haz una tabla de contratos: qué usa cada repo de otro repo o del proyecto Telón (tablas y columnas de la
base de datos, rutas de ficheros, endpoints), qué asume y qué se rompe si cambia. Cita fichero.
```

**Por qué:** un contrato que nadie ha escrito se rompe sin que nadie lo vea. DEV-430 es justo eso: el proyecto Telón amplió `tickets.status` y nadie avisó a la puerta ni a liquidaciones.

**Resultado esperado:** al menos cuatro filas:
- `control-acceso` lee y escribe `tickets` y asume que solo `void` es inválido;
- `liquidaciones` lee `orders`, `tickets` y `seats` y asume que toda entrada de un pedido pagado es venta;
- `liquidaciones` lee `../tarifas` por ruta relativa;
- `widget-embebido` usa `GET /api/public/events/:id`.

### 2 — Comprueba el estado nuevo en el proyecto Telón

**Acción:** en `telon/`, busca los estados de entrada: `grep -rn "refunded" services/api/src services/api/migrations`

**Por qué:** el contrato con el proyecto Telón tiene que decir qué estados existen hoy, no los que había cuando se escribió el repositorio heredado. El dato sale del código del proyecto Telón, no del asistente.

**Resultado esperado:** `refunded` aparece en `refunds/service.ts` (`SET status = 'refunded'`), en `routes/tickets.ts` y en un comentario de `002_refunds.sql`. Los estados son `pending`, `valid`, `void` y `refunded`.

### 3 — Escribe el contexto del equipo

**Acción:** en `dev1/contexto-equipo`, crea `AGENTS.md` con:
1. un mapa (texto o diagrama ASCII) de quién lee qué;
2. la tabla de contratos del paso 1;
3. los estados de `tickets.status`, con la fecha en que apareció `refunded`;
4. una sección «Cuando cambies…» que diga a quién afecta cada tipo de cambio.

**Por qué:** cada `AGENTS.md` de repositorio explica su repositorio. Este explica lo que pasa entre ellos, que es donde se pierde el conocimiento.

**Resultado esperado:** un fichero de una página, con cada contrato comprobable en el código.

### 4 — Haz que cada repositorio apunte a él

**Acción:** añade al principio de cada `AGENTS.md` de repositorio:

```markdown
Antes de cambiar nada, lee también `../contexto-equipo/AGENTS.md` (contratos con el proyecto Telón y entre repos).
```

**Por qué:** el agente de `dev2` se abrirá en un repositorio concreto. Si el `AGENTS.md` no le manda al contexto común, no lo leerá.

**Resultado esperado:** la línea en los cuatro `AGENTS.md`.

### 5 — Escribe la dinámica del equipo

**Acción:** crea `dev1/contexto-equipo/DINAMICA.md` con cuatro apartados:
- **Qué va al repositorio y qué no** (tabla de dos columnas).
- **Cómo entra un cambio de contexto**: comprobado, commit propio, revisado por otra persona.
- **Handoff**: dónde se deja (en la rama o el PR, no en el chat) y qué lleva (hecho, pendiente, comprobado, dudas).
- **Contexto por rama**: si una rama cambia un contrato, cambia su contexto en la misma rama.

**Por qué:** las reglas del equipo sobre el contexto también son contexto. Escritas, el asistente las aplica y una persona nueva las encuentra.

**Resultado esperado:** `DINAMICA.md` enlazado desde `contexto-equipo/AGENTS.md`.

### 6 — Sube todo

**Acción:** en cada repositorio de `dev1` con cambios: `git add -A && git commit -m "contexto: contratos y dinámica del equipo" && git push`

**Por qué:** `dev2` trabajará solo con lo que haya en el remoto.

**Resultado esperado:** `make up-m06` sin cambios pendientes en `dev1`.

### 7 — Provoca un conflicto de contexto

**Acción:**
1. **Como `dev2`**, en `workspace/m06/dev2/contexto-equipo`: `git pull`, añade al final de la tabla de contratos de `AGENTS.md` una fila sobre `widget-embebido` con otra redacción, y haz `git commit -am "contexto: widget" && git push`.
2. **Como `dev1`**, en `workspace/m06/dev1/contexto-equipo`: `git switch -c contexto/tarifas-desde`, cambia la misma tabla para añadir que `DESDE` no se aplica y haz `git commit -am "contexto: DESDE no se aplica"`.
3. Sigue como `dev1`: `git switch main && git pull && git merge contexto/tarifas-desde`

**Por qué:** dos personas tocando el mismo contexto a la vez es lo normal en un equipo. Un conflicto en `AGENTS.md` se resuelve como uno de código: leyendo las dos versiones, no quedándose con la última.

**Resultado esperado:** `CONFLICT (content): Merge conflict in AGENTS.md`.

### 8 — Resuelve el conflicto con el asistente

**Acción:**

```text
Hay un conflicto de merge en contexto-equipo/AGENTS.md. Resuélvelo conservando la información
de las dos versiones, sin duplicar filas. Enséñame el resultado antes de guardar.
```

Revisa el resultado y termina: `git add AGENTS.md && git commit --no-edit && git push`

**Por qué:** el asistente resuelve bien conflictos de texto, pero tiende a quedarse con una de las dos versiones. Pedir que conserve ambas y revisarlo evita perder contexto en silencio.

**Resultado esperado:** la tabla tiene las dos filas nuevas y no quedan marcas `<<<<<<<`. `git log --graph --oneline -5` muestra el merge.

## Comprueba tu entendimiento

**El contexto común llega a cada repo**
Abre un chat nuevo en `dev1/control-acceso` y pregunta: «¿Qué estados puede tener una entrada en el proyecto Telón?».
→ Responde con los cuatro estados, citando `../contexto-equipo/AGENTS.md`.

## Reto

### 1 — ¿Quién debería haber avisado?

Con la sección «Cuando cambies…», ¿en qué momento de DEV-412 (la devolución, M02–M05) se habría evitado DEV-430? ¿Qué cambiarías en el `AGENTS.md` del proyecto Telón?

<details>
<summary>Ver solución</summary>

Al añadir el estado `refunded` en la migración 002 del proyecto Telón. Si el `AGENTS.md` del proyecto Telón tuviera una regla del tipo «la tabla `tickets` la leen directamente control-acceso y liquidaciones: un estado o columna nuevos se comunican a esos repos (ver contexto-equipo)», el asistente lo habría señalado al generar la devolución, y la revisión del PR lo habría pedido. El contexto común sirve en las dos direcciones.

</details>

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| No hay conflicto al fusionar | `dev1` y `dev2` editaron sitios distintos del fichero | Editad la misma tabla, en líneas contiguas |
| `! [rejected] main -> main (fetch first)` | `dev2` subió antes | `git pull` y repite el `push` |
| El asistente borró la fila de `dev2` | Resolvió quedándose con «ours» | `git checkout --conflict=merge AGENTS.md` y repite el paso 8 |
