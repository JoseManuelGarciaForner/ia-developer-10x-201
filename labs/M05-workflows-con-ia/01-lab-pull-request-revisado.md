# Laboratorio: pull request revisado

[← Página anterior](00-el-equipo-y-el-asistente.md) · [Siguiente página →](02-lab-workflow-y-seguridad.md)

La devolución de entradas de Telón está terminada en tu puesto. En este lab la llevas a un pull request en tu fork: descripción redactada con el asistente y corregida por ti, revisión asistida con `AGENTS.md` como lista de comprobación y un comentario respondido con un commit.

### Objetivo

Un pull request abierto en tu fork, de `feat/dev-412-devoluciones` a `main`, con una descripción revisada, un comentario de revisión y su respuesta.

### Punto de partida

- Tu fork del repositorio del curso abierto en el Dev Container, carpeta `telon/`.
- Estado: `make init-m05` (la devolución completa, con tests, README, OpenAPI y `AGENTS.md`).
- GitHub CLI autenticada: `gh auth status` dentro del contenedor. Si no lo está, `gh auth login` (en Codespaces ya lo está).

### En qué consiste

Rama, commit, push, descripción del PR, revisión y respuesta. No cambias la lógica de Telón salvo lo que salga de la revisión.

### 1 — Crea la rama con el trabajo

**Acción:**

```bash
git switch -c feat/dev-412-devoluciones
git add -A
git commit -m "DEV-412: devolución de entradas"
```

**Por qué:** `make init-m05` ha dejado en `telon/` todo el trabajo de la devolución. En tu `main` sigue Telón como lo heredaste, así que el PR va a mostrar la devolución entera.

**Resultado esperado:** un commit nuevo en la rama. `git status` limpio.

> [!NOTE]
> Si vienes haciendo los labs anteriores en esta misma rama, ya tienes tus commits: salta al paso 2.

### 2 — Sube la rama a tu fork

**Acción:** `git push -u origin feat/dev-412-devoluciones`

**Por qué:** el PR vive en GitHub. `origin` es tu fork, no el repositorio del curso.

**Resultado esperado:** `branch 'feat/dev-412-devoluciones' set up to track 'origin/feat/dev-412-devoluciones'`.

### 3 — Pide la descripción al asistente

**Acción:** en un chat nuevo:

```text
Escribe la descripción de un pull request a partir de `git diff main...HEAD -- telon/`.
Secciones: Qué cambia, Por qué (DEV-412), Cómo probarlo (comandos exactos y el ejemplo de
PED-2026-0107), Riesgos. Solo lo que esté en el diff. Guárdala en /tmp/pr.md.
```

**Por qué:** el asistente resume bien un diff largo. Pedir que se limite al diff y que dé comandos exactos reduce lo que tendrás que corregir.

**Resultado esperado:** `/tmp/pr.md` con las cuatro secciones.

### 4 — Corrige la descripción

**Acción:** abre `/tmp/pr.md` y comprueba cada afirmación:
- cada comando de **Cómo probarlo**, ejecutándolo (por ejemplo `npm test`, `npm run db:reset` y el `curl` de la devolución);
- cada fichero mencionado, con `git diff main...HEAD --stat -- telon/`;
- palabras como «integración», «e2e» o «rendimiento»: ¿hay algo en el diff que lo respalde?

**Por qué:** la descripción la firmas tú. Si dice «tests de integración» y son unitarios con mocks, quien revise confiará en algo que no existe.

**Resultado esperado:** una descripción en la que todo se puede comprobar. Quita o corrige al menos una afirmación.

### 5 — Abre el pull request

**Acción:**

```bash
gh pr create --repo "$(gh repo view --json nameWithOwner -q .nameWithOwner)" \
  --base main --head feat/dev-412-devoluciones \
  --title "DEV-412: devolución de entradas" --body-file /tmp/pr.md
```

**Por qué:** `--repo` con tu fork evita que `gh` proponga abrir el PR contra el repositorio del curso.

**Resultado esperado:** una URL del tipo `https://github.com/<tu-usuario>/ia-developer-10x-201/pull/1`.

### 6 — Revisa el PR con el asistente

**Acción:**

```text
Revisa el diff de este PR (git diff main...HEAD -- telon/) como revisor del equipo. Usa
AGENTS.md como lista de comprobación: reglas de negocio, convenciones, "No hacer". Para cada
hallazgo: fichero, línea, regla que incumple y gravedad (bloqueante / mejora / gusto).
No cambies nada.
```

**Por qué:** la lista de comprobación es la del equipo, no la del asistente. Clasificar por gravedad te ayuda a no publicar comentarios de gusto como si fueran bloqueantes.

**Resultado esperado:** una lista de hallazgos. Suelen salir: una consulta o un `DELETE` del script de escenario fuera de la transacción, mensajes de error en inglés y comentarios de estilo.

### 7 — Publica un comentario de revisión

**Acción:** elige un hallazgo que compartas (bloqueante o mejora) y publícalo en el PR, en la pestaña **Files changed**: pulsa el **+** junto a la línea, escribe el comentario y pulsa **Add single comment**.

**Por qué:** decides qué comentarios llegan al equipo. Publicar lo que dice el asistente sin filtrar convierte la revisión en ruido.

**Resultado esperado:** un comentario en la línea, visible en la pestaña **Conversation**.

### 8 — Responde con un commit

**Acción:**
1. Pide al asistente el arreglo de ese comentario, acotado a ese fichero.
2. Revisa el diff, ejecuta `npm test` y haz commit: `git commit -am "Revisión: <qué has cambiado>"`.
3. `git push`
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

### 1 — Una regla que salió de la revisión

De lo que encontró el asistente en el paso 6, ¿hay algo que debería ser una regla nueva de `AGENTS.md` para que no vuelva a pasar? Proponla en el mismo PR.

<details>
<summary>Ver solución</summary>

Por ejemplo: «Los scripts de datos (`services/api/src/scripts/`) solo borran lo que crean, con filtros explícitos, y dentro de una transacción». Va en la sección de convenciones o en «No hacer», con un commit propio en el PR («AGENTS.md: regla para scripts de datos»). Así el siguiente script que genere cualquier asistente ya la tiene en cuenta.

</details>

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| `gh pr create` propone el repositorio del curso | `gh` toma el repositorio padre del fork | Usa `--repo <tu-usuario>/ia-developer-10x-201` |
| `gh: To get started with GitHub CLI, please run: gh auth login` | La CLI no está autenticada en el contenedor | `gh auth login` y elige HTTPS y el navegador |
| El PR muestra cientos de ficheros | La rama incluye `node_modules` | Comprueba que `telon/.gitignore` tiene `node_modules/` y rehaz el commit |
| `/tmp/pr.md` no existe | El asistente no tiene permiso para escribir fuera del proyecto | Pídele la descripción en el chat y guárdala tú |
