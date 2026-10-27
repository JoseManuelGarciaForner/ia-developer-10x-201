# Laboratorio: pull request revisado

[← Página anterior](00-el-equipo-y-el-asistente.md) · [Siguiente página →](02-lab-workflow-y-seguridad.md)

La devolución de entradas del proyecto Telón está terminada en tu puesto. En este lab la llevas a un pull request en tu fork: descripción redactada con el asistente y corregida por ti, revisión asistida con `AGENTS.md` como lista de comprobación y un comentario respondido con un commit.

### Objetivo

Un pull request abierto en tu fork, de `feat/dev-412-devoluciones` a `main`, con una descripción revisada, un comentario de revisión y su respuesta.

### Punto de partida

- Tu fork del repositorio del curso abierto en el Dev Container (local o Codespaces), con una terminal en `telon/`.
- En la terminal: `CONFIRM=1 make init-m05`; responde `telon/ está en el punto de partida de m05.` Es la devolución completa, con tests, README, OpenAPI y `AGENTS.md`.
- GitHub CLI autenticada: en la terminal, `gh auth status` tiene que responder `Logged in to github.com`. Si no, `gh auth login` y sigue las preguntas (HTTPS y navegador). En Codespaces ya lo está.
- Un asistente en modo agente:

| Asistente | Cómo abrir una conversación nueva |
|-----------|-----------------------------------|
| VS Code o Codespaces + Copilot | <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>I</kbd> → **+** → modo **Agent** bajo la caja de texto |
| Cursor | <kbd>Ctrl</kbd>+<kbd>L</kbd> → **+** → modo **Agent** |
| Claude Code | En una terminal nueva: `claude` |

> [!NOTE]
> El asistente tiene el código y `AGENTS.md`, que su herramienta carga al abrir cada conversación. No ve GitHub: el PR, sus comentarios y su estado solo los conoce si se los pegas o si ejecuta `gh` en la terminal.

### En qué consiste

Rama, commit, push, descripción del PR, revisión y respuesta. No cambias la lógica del proyecto salvo lo que salga de la revisión.

### 1 — Crea la rama con el trabajo

**Acción:**

```bash
git switch -c feat/dev-412-devoluciones
git add -A
git commit -m "DEV-412: devolución de entradas"
```

**Por qué:** `make init-m05` ha dejado en `telon/` todo el trabajo de la devolución. En tu `main` sigue el proyecto como lo heredaste, así que el PR va a mostrar la devolución entera.

**Resultado esperado:** un commit nuevo en la rama. `git status` limpio.

> [!NOTE]
> Si vienes haciendo los labs anteriores en esta misma rama, ya tienes tus commits: salta al paso 2.

### 2 — Sube la rama a tu fork

**Acción:** en la terminal, `git push -u origin feat/dev-412-devoluciones`

**Por qué:** el PR vive en GitHub. `origin` es tu fork, no el repositorio del curso.

**Resultado esperado:** `branch 'feat/dev-412-devoluciones' set up to track 'origin/feat/dev-412-devoluciones'`.

### 3 — Pide la descripción al asistente

**Acción:** ve al chat, abre una conversación nueva, pega esto y pulsa <kbd>Enter</kbd>:

```text
Escribe la descripción de un pull request a partir de `git diff main...HEAD -- telon/`.
Secciones: Qué cambia, Por qué (DEV-412), Cómo probarlo (comandos exactos y el ejemplo de
PED-2026-0107), Riesgos. Solo lo que esté en el diff. Guárdala en /tmp/pr.md.
```

**Por qué:** el asistente resume bien un diff largo. Pedir que se limite al diff y que dé comandos exactos reduce lo que tendrás que corregir.

**Resultado esperado:** el agente ejecuta `git diff` (acepta el permiso), lee el resultado y escribe `/tmp/pr.md` con las cuatro secciones. Ábrelo desde la terminal con `code /tmp/pr.md` (o `cursor /tmp/pr.md`).

Lo habitual es que el resumen sea correcto en lo grande y que añada alguna afirmación que no está en el diff, como «tests de integración» o «mejora el rendimiento». El modelo completa la descripción con lo que suele acompañar a un cambio así.

### 4 — Corrige la descripción

**Acción:** con `/tmp/pr.md` abierto, comprueba cada afirmación en la terminal:
- cada comando de **Cómo probarlo**, ejecutándolo (por ejemplo `npm test`, `npm run db:reset` y el `curl` de la devolución);
- cada fichero mencionado, con `git diff main...HEAD --stat -- telon/`;
- palabras como «integración», «e2e» o «rendimiento»: ¿hay algo en el diff que lo respalde?

**Por qué:** la descripción la firmas tú. Si dice «tests de integración» y son unitarios con mocks, quien revise confiará en algo que no existe.

**Resultado esperado:** una descripción en la que todo se puede comprobar. Quita o corrige al menos una afirmación.

### 5 — Abre el pull request

**Acción:** guarda `/tmp/pr.md` y, en la terminal:

```bash
gh pr create --repo "$(gh repo view --json nameWithOwner -q .nameWithOwner)" \
  --base main --head feat/dev-412-devoluciones \
  --title "DEV-412: devolución de entradas" --body-file /tmp/pr.md
```

**Por qué:** `--repo` con tu fork evita que `gh` proponga abrir el PR contra el repositorio del curso.

**Resultado esperado:** una URL del tipo `https://github.com/<tu-usuario>/ia-developer-10x-201/pull/1`. Ábrela con <kbd>Ctrl</kbd>+clic: es tu PR, con la descripción corregida.

### 6 — Revisa el PR con el asistente

**Acción:** en el mismo chat, pega esto y pulsa <kbd>Enter</kbd>:

```text
Revisa el diff de este PR (git diff main...HEAD -- telon/) como revisor del equipo. Usa
AGENTS.md como lista de comprobación: reglas de negocio, convenciones, "No hacer". Para cada
hallazgo: fichero, línea, regla que incumple y gravedad (bloqueante / mejora / gusto).
No cambies nada.
```

**Por qué:** la lista de comprobación es la del equipo, no la del asistente. Clasificar por gravedad te ayuda a no publicar comentarios de gusto como si fueran bloqueantes.

**Resultado esperado:** una lista de hallazgos, cada uno con fichero, línea, regla y gravedad. Suelen salir: una consulta o un `DELETE` del script de escenario fuera de la transacción, mensajes de error en inglés y comentarios de estilo.

### 7 — Publica un comentario de revisión

**Acción:** elige un hallazgo que compartas (bloqueante o mejora). En el navegador, en tu PR:
1. Abre la pestaña **Files changed**.
2. Busca el fichero del hallazgo y pasa el ratón por la línea: aparece un **+** azul a la izquierda. Púlsalo.
3. Escribe el comentario con tus palabras (qué falla y por qué, según `AGENTS.md`) y pulsa **Add single comment**.

**Por qué:** decides qué comentarios llegan al equipo. Publicar lo que dice el asistente sin filtrar convierte la revisión en ruido.

**Resultado esperado:** un comentario en la línea, visible en la pestaña **Conversation**.

### 8 — Responde con un commit

**Acción:**
1. En el mismo chat, escribe el comentario tal cual lo publicaste y añade: `Arregla solo esto, solo en ese fichero. Ejecuta los tests al terminar.` Pulsa <kbd>Enter</kbd>.
2. Revisa el diff en la vista de cambios (<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>G</kbd>): un solo fichero.
3. En la terminal, `npm test` y, si está en verde, `git commit -am "Revisión: <qué has cambiado>"` y `git push`.
4. En el PR, responde al comentario con el enlace o el hash del commit y pulsa **Resolve conversation**.

**Por qué:** la revisión se cierra con un cambio comprobado, no con un «hecho» en el chat.

**Resultado esperado:** el PR muestra el commit nuevo y la conversación resuelta.

## Comprueba tu entendimiento

**La descripción se comprueba sola**
Copia el bloque **Cómo probarlo** de tu PR en una terminal nueva y ejecútalo de arriba abajo.
→ Todo funciona sin pasos que no estén escritos.

**El contexto llega al PR**
En la pestaña **Files changed**, busca `AGENTS.md`.
→ Está en el diff: quien revise ve las reglas con las que se generó el código.

## Reto

### 1 — Que la revisión se convierta en una regla

De lo que encontró el asistente en el paso 6, algo merece ser una regla de `AGENTS.md` para que no vuelva a pasar. Escribe un prompt para que el asistente proponga esa regla (una línea, comprobable) y el sitio exacto de `AGENTS.md` donde va. Después comprueba que funciona: en una conversación nueva, pídele un script de datos y mira si la aplica sin que se la recuerdes.

<details>
<summary>Ver solución</summary>

Un prompt que funciona:

```text
De los hallazgos de la revisión anterior, ¿cuál se repetirá en el próximo cambio si nadie lo
escribe? Proponlo como UNA regla de AGENTS.md, en una línea que se pueda comprobar en un diff,
y dime en qué sección va. No la escribas todavía.
```

Lo habitual: «Los scripts de datos (`services/api/src/scripts/`) solo borran lo que crean, con filtros explícitos, y dentro de una transacción». Va en «Convenciones» o en «No hacer», con un commit propio en el PR («AGENTS.md: regla para scripts de datos»).

La comprobación: en una conversación nueva, pide «Crea un script que cargue tres pedidos de prueba del Teatro Lumen y se pueda ejecutar varias veces». Si el script sale con transacción y `DELETE` filtrados, sin que lo hayas pedido, la regla funciona. Así la revisión deja de corregir un PR y empieza a corregir los siguientes.

</details>

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| `gh pr create` propone el repositorio del curso | `gh` toma el repositorio padre del fork | Usa `--repo <tu-usuario>/ia-developer-10x-201` |
| `gh: To get started with GitHub CLI, please run: gh auth login` | La CLI no está autenticada en el contenedor | `gh auth login` y elige HTTPS y el navegador |
| El PR muestra cientos de ficheros | La rama incluye `node_modules` | Comprueba que `telon/.gitignore` tiene `node_modules/` y rehaz el commit |
| `/tmp/pr.md` no existe | El asistente no tiene permiso para escribir fuera del proyecto | Pídele la descripción en el chat y guárdala tú |
