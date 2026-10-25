# Laboratorio: workflow de CI y revisión de seguridad

[← Página anterior](01-lab-pull-request-revisado.md) · [Siguiente página →](../M06-caso-integral/README.md)

El pull request de la devolución necesita algo que lo valide sin depender de que alguien ejecute los tests en su máquina. En este lab el asistente escribe el workflow de GitHub Actions, y hay que llevarlo a donde GitHub lo busca. Después revisas el PR con una lista de seguridad y encuentras una API key que el proyecto Telón devuelve en claro. Por último limitas lo que el agente puede ejecutar sin preguntarte.

### Objetivo

Un workflow que ejecuta lint, typecheck y tests del proyecto en cada push, en verde en tu PR. Además, la API key del proveedor de email enmascarada en el backoffice y una configuración del agente con lo que puede ejecutar solo y lo que no.

### Punto de partida

- Tu fork abierto en el Dev Container, carpeta `telon/`.
- Estado: `make init-m05`. Si hiciste el [lab anterior](01-lab-pull-request-revisado.md), sigue en tu rama `feat/dev-412-devoluciones` con el PR abierto. Si no, crea la rama y el PR con los pasos 1, 2 y 5 de ese lab.
- `make up-m05` arrancado en otra terminal.

### En qué consiste

Workflow, Actions activado en el fork, revisión de seguridad con tres comprobaciones y permisos del agente. Tocas `.github/workflows/` en la raíz del repositorio, `services/api/src/routes/admin.ts` y la configuración de tu asistente.

### 1 — Pide el workflow

**Acción:** en un chat nuevo:

```text
Crea un workflow de GitHub Actions que en cada push y pull request ejecute, con Node 22:
npm ci, npm run lint, npm run typecheck y npm test, en el proyecto Telón.
```

**Por qué:** el prompt es deliberadamente corto, como el que escribe casi todo el mundo. Fíjate en dónde pone el fichero.

**Resultado esperado:** casi seguro, `telon/.github/workflows/ci.yml`, porque el asistente está abierto en `telon/` y esa es la raíz que ve.

### 2 — Lleva el workflow a donde GitHub lo busca

**Acción:**
1. Mueve el fichero a la raíz del repositorio: `mkdir -p ../.github/workflows && git mv .github/workflows/ci.yml ../.github/workflows/telon.yml` (si no estaba versionado, usa `mv`).
2. Pide al asistente que lo adapte:

```text
El workflow está ahora en ../.github/workflows/telon.yml (raíz del repositorio; telon/ es una
subcarpeta). Ajústalo: defaults.run.working-directory: telon, cache de npm con
cache-dependency-path: telon/package-lock.json, y que solo se dispare con cambios en telon/
o en el propio workflow.
```

**Por qué:** GitHub solo lee workflows de `.github/workflows/` en la raíz del repositorio. Uno en `telon/.github/workflows/` no se ejecuta nunca, y nadie avisa. Es el tipo de error que el asistente no puede ver porque su raíz es `telon/`.

**Resultado esperado:** `.github/workflows/telon.yml` en la raíz, con `working-directory: telon` y `paths: ['telon/**', '.github/workflows/telon.yml']`.

### 3 — Activa Actions en tu fork

**Acción:** en GitHub, en tu fork, abre la pestaña **Actions** y pulsa **I understand my workflows, go ahead and enable them**.

**Por qué:** GitHub desactiva los workflows en los forks hasta que su dueño los activa, para que un fork no ejecute código ajeno con tus minutos.

**Resultado esperado:** la pestaña **Actions** muestra «There are no workflow runs yet» o la lista de ejecuciones.

### 4 — Sube el workflow y mira el PR

**Acción:**

```bash
git add ../.github/workflows/telon.yml
git commit -m "CI del proyecto: lint, typecheck y tests"
git push
```

Abre el PR en GitHub.

**Por qué:** desde ahora, cada push del PR se valida solo, y quien revise ve el resultado antes de leer código.

**Resultado esperado:** en la pestaña **Checks** (o al pie de **Conversation**), el job del workflow en verde, con unos 33 tests pasados en su log.

> [!TIP]
> Los tests del proyecto no necesitan PostgreSQL ni Redis: los que tocan esos servicios usan mocks (M03). Por eso el workflow no necesita `services:`.

### 5 — Revisa la seguridad del PR

**Acción:** en un chat nuevo:

```text
Revisa la seguridad del proyecto con esta lista, citando fichero y línea:
1. Secretos: ¿algún endpoint devuelve o registra credenciales (API keys, tokens)?
2. Dependencias: ¿hay alguna en los package.json que no exista en npm o no se use?
3. Entrada no confiable: ¿dónde se ejecuta código o SQL que viene de fuera?
No cambies nada.
```

**Por qué:** la seguridad no se revisa «en general». Con una lista concreta, el asistente busca en los sitios correctos y tú puedes comprobar cada respuesta.

**Resultado esperado:** al menos estos hallazgos:
1. `GET /api/admin/email` (`services/api/src/routes/admin.ts`) devuelve `email_config` entero, con el `apiKey` del proveedor del promotor en claro.
2. Ninguna dependencia inventada. Si te propone una, compruébala con `npm view <paquete> version`.
3. El TSX del promotor se ejecuta en el navegador con `new Function` (`packages/page-runtime/src/compile.ts`). Limitar los imports no lo convierte en un sandbox: la página tiene acceso a `window` y a `fetch` en el dominio de la tienda.

### 6 — Comprueba la fuga de la API key

**Acción:** `curl -s localhost:3000/api/admin/email -H 'authorization: Bearer lumen-dev-token'`

**Por qué:** el Teatro Lumen usa SendGrid. Su API key no debería salir nunca de la base de datos una vez guardada: cualquiera con acceso al backoffice, o un fallo de XSS, la tendría.

**Resultado esperado:** `"config":{"apiKey":"SG.ejemplo-no-real.0000000000"}`. En el backoffice del Lumen, **Email** la muestra en el campo, también en claro.

> [!WARNING]
> En este entorno la key es inventada. Con una real, no la pegues en el chat para «que el asistente la vea»: descríbela (`SG.…`) o usa la de ejemplo.

### 7 — Enmascara las credenciales

**Acción:**

```text
En services/api/src/routes/admin.ts, GET /api/admin/email no debe devolver secretos: enmascara
apiKey, secretAccessKey y serverToken mostrando solo los 4 últimos caracteres ("••••0000").
En PUT, si llega un valor enmascarado, conserva el que había guardado. Añade un test con
Fastify inject y la base de datos mockeada. Diff mínimo.
```

**Por qué:** el backoffice necesita saber que hay una key configurada, no conocerla. Y si el formulario reenvía el valor enmascarado al guardar, no debe sobrescribir la buena.

**Resultado esperado:** el `curl` del paso 6 devuelve `"apiKey":"••••0000"`. En el backoffice del Lumen, cambiar el remitente y pulsar **Guardar** no rompe el envío: **Enviar correo de prueba** sigue apareciendo en **Pedidos y correos** como `sendgrid`.

### 8 — Limita lo que el agente ejecuta sin preguntar

**Acción:** configura tu asistente para que ejecute sin preguntar solo comandos de lectura y comprobación, y pida confirmación para el resto:

| Asistente | Dónde |
|-----------|-------|
| Claude Code | `.claude/settings.json` en `telon/` (ver abajo) |
| Cursor | **Settings → Agents**: lista de comandos que se ejecutan solos (*auto-run* / *allowlist*) |
| VS Code + Copilot | Ajustes de aprobación automática de herramientas y comandos de terminal del modo agente |

Para Claude Code:

```json
{
  "permissions": {
    "allow": ["Bash(npm test:*)", "Bash(npm run lint)", "Bash(npm run typecheck)", "Bash(git diff:*)", "Bash(git status)"],
    "deny": ["Bash(git push:*)", "Read(./.env)", "Read(./**/.env)"]
  }
}
```

**Por qué:** un agente que hace `git push` o lee `.env` sin preguntar es un riesgo, aunque no tenga mala intención: basta una instrucción escondida en un fichero que lee. Las comprobaciones, en cambio, puede ejecutarlas sin que tengas que aprobar cada una.

**Resultado esperado:** al pedirle «ejecuta los tests» lo hace sin preguntar. Al pedirle «sube los cambios», pide permiso o se niega.

### 9 — Haz commit y súbelo

**Acción:**

```bash
git add -A
git commit -m "Seguridad: credenciales de email enmascaradas y permisos del agente"
git push
```

**Por qué:** el arreglo de seguridad y la configuración del agente son del equipo: entran por el mismo PR y pasan por la misma CI.

**Resultado esperado:** el workflow vuelve a ejecutarse en el PR y termina en verde.

## Comprueba tu entendimiento

**La CI detecta lo que se rompe**
En una rama aparte, cambia `toBe(450)` por `toBe(451)` en `services/api/test/pricing.test.ts`, súbela y abre un PR de prueba contra `main`.
→ El job termina en rojo y el PR lo muestra antes de que nadie lo revise. Cierra el PR y borra la rama.

**La key ya no sale**
Repite el `curl` del paso 6.
→ `"apiKey":"••••0000"`.

## Reto

### 1 — El código del promotor

El hallazgo 3 del paso 5 no se arregla con un diff pequeño. Pregunta al asistente qué opciones hay para aislar el TSX de los promotores y qué cuesta cada una. Decide cuál propondrías al equipo.

<details>
<summary>Ver solución</summary>

Las opciones habituales son tres:
- servir la página del promotor en un **origen distinto** (`*.paginas.telon.test`) dentro de un iframe con `sandbox`, de modo que no comparta cookies ni `localStorage` con la tienda ni con el backoffice;
- compilar en el servidor y añadir una **Content Security Policy** estricta;
- ejecutar el código en un **Web Worker o un realm aislado**, que no tiene DOM y complica los componentes.

La primera es la más común en plataformas así. Implica cambiar cómo se comunican la página y los componentes troncales (postMessage, como el editor), así que no es un cambio para este PR: es una decisión de arquitectura que va en su propia petición.

</details>

## Errores frecuentes

| Síntoma | Causa probable | Cómo arreglarlo |
|---------|----------------|-----------------|
| El PR no muestra ningún check | El workflow está en `telon/.github/` o Actions no está activado en el fork | Paso 2 y paso 3 |
| `npm ci` falla con `lockfile … not in sync` | `package-lock.json` desactualizado | `npm install` en `telon/`, commit del lock y push |
| `Cannot find package-lock.json` en la caché | Ruta de la caché relativa a la raíz | `cache-dependency-path: telon/package-lock.json` |
| El backoffice muestra `••••0000` y al guardar falla el envío | El PUT guardó el valor enmascarado | Revisa la condición del paso 7: si el valor empieza por `••••`, se conserva el anterior |
