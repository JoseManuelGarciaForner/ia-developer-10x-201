# El equipo y el asistente

[← Página anterior](README.md) · [Siguiente página →](01-lab-pull-request-revisado.md)

Hasta aquí, el asistente ha trabajado para una sola persona. En un equipo, el trabajo llega a `main` por un camino compartido: rama, pull request, revisión y CI. Esta demostración recorre ese camino con la devolución de entradas del proyecto Telón y muestra dos cosas en cada parada. El asistente puede acelerar casi todos los pasos, pero hay decisiones que no puede tomar él: qué se publica, qué se fusiona y qué se comparte. Esas decisiones son de las personas y del repositorio.

## Punto de partida

- Repositorio del curso abierto en el Dev Container (local o Codespaces), con una terminal en `telon/`.
- Un asistente en modo agente: Copilot o Cursor en modo **Agent**, o Claude Code (`claude` en la terminal, desde `telon/`).
- La demostración trabaja solo en local, en una rama que se borra al final. No sube nada al fork.

### Preparación

1. `CONFIRM=1 make init-m05`. Deja en `telon/` el trabajo completo de la devolución (código, tests, README, OpenAPI y `AGENTS.md`) sin commit.
2. Se crea una rama de demostración con todo ese trabajo:

```bash
git switch -c demo/dev-412
git add -A
git commit -q -m "DEV-412: devolución de entradas (demostración)"
git diff --stat main...HEAD | tail -1
```

La última línea resume el tamaño del cambio: una treintena de ficheros. Es lo que vería quien revisa el pull request.

## Recorrido

### 1. Qué es del equipo y qué es de cada uno

1. En la terminal: `ls AGENTS.md CLAUDE.md .cursor/rules .github`. Son las reglas del proyecto y los punteros de cada herramienta. Están en el commit de la rama, así que entran por pull request como el código.
2. `cat .gitignore`. Aparece `.env` en la lista: la configuración y los secretos de cada uno no se suben.

| En el repositorio (entra por PR) | En tu máquina (no se sube) |
|----------------------------------|----------------------------|
| `AGENTS.md`, `CLAUDE.md`, `.cursor/rules/`, `.github/copilot-instructions.md` | Historial de chats y «memorias» del asistente |
| Prompts reutilizables (`.github/prompts/`, `.cursor/commands/`, `.claude/commands/`) | Preferencias personales del editor y del asistente |
| Dev Container, `Makefile`, scripts | `.env`, tokens, la API key de tu cuenta del asistente |
| Workflow de CI | Cachés e índices del asistente |

Cuando el asistente descubre algo que vale para todos, no se deja en el chat. Por ejemplo: «la pasarela olvida los cargos si no se hace `db:reset` con ella arrancada». Se propone como cambio a `AGENTS.md` y entra por pull request, igual que el código.

**Qué muestra:** lo que está solo en un chat lo aprovecha una persona una vez. Lo que está en el repositorio lo aplican todos los asistentes del equipo a partir del siguiente `git pull`.

### 2. La descripción del pull request: la escribe el asistente, la firma una persona

1. Se abre una conversación nueva en modo agente y se pide:

```text
Escribe la descripción del PR a partir de git diff main...HEAD: qué cambia, por qué, cómo
probarlo (comandos exactos) y riesgos. Nada que no esté en el diff.
```

2. El agente pide permiso para ejecutar `git diff`; se le permite.
3. Se lee la descripción contrastándola con el diff. Hay dos cosas fáciles de comprobar: `ls services/api/test` (qué tests hay de verdad) y `ls services/api/src/migrations` (qué migraciones).

**Qué se ve:** un resumen que acierta en lo importante: migraciones 002 y 003, `refunds/`, `sendOnce`, `RefundRequest`, OpenAPI. Y algún detalle que no está en el diff. El típico es «se añaden tests de integración», cuando `services/api/test` solo tiene tests unitarios con mocks.

**Qué muestra:** el asistente ahorra el trabajo de redactar, pero la descripción va firmada por quien abre el PR. Si dice algo falso, el error es suyo, no del asistente.

### 3. La revisión: el asistente propone y quien revisa decide

1. En la misma conversación se pide:

```text
Revisa el diff de este PR (git diff main...HEAD) como revisor del equipo. Usa AGENTS.md
como lista de comprobación: reglas de negocio, convenciones, "No hacer". Para cada hallazgo:
fichero, línea, regla que incumple y gravedad (bloqueante / mejora / gusto). No cambies nada.
```

2. Se recorre la lista y se clasifica cada hallazgo en voz alta: se publica, se descarta o se discute.

**Qué se ve:** comentarios útiles, como un `DELETE` del script de escenario que convendría meter en una transacción o un mensaje de error en inglés, mezclados con otros de puro gusto, como renombrar variables.

**Qué muestra:** una revisión asistida encuentra más cosas en menos tiempo, pero también genera ruido. Pedir la gravedad ayuda a filtrar, y el criterio final sigue siendo de quien revisa.

### 4. Más herramientas, con permisos acotados

**MCP** (Model Context Protocol) es la forma estándar de conectar el asistente a herramientas externas. Dónde se ven los servidores configurados en cada asistente:

| Asistente | Servidores MCP | Agentes especializados |
|-----------|----------------|------------------------|
| Copilot (VS Code) | Paleta de comandos → **MCP: List Servers** | Modos y agentes personalizados de la vista de chat |
| Cursor | **Cursor Settings** → sección MCP | Modos personalizados del chat |
| Claude Code | `/mcp` dentro de `claude` | `/agents` dentro de `claude` |

En este proyecto tendrían sentido, por ejemplo:

- el servidor MCP de GitHub, para leer issues y PR sin copiarlos al chat;
- un servidor MCP de PostgreSQL **de solo lectura** contra la base de datos de desarrollo, para que el agente consulte la tabla `tickets` en lugar de suponer su esquema.

Cada servidor MCP es código que se ejecuta con tus permisos. Un MCP con escritura sobre la base de datos de producción no tiene sitio en el día a día del equipo.

Los **agentes especializados** son el mismo asistente con instrucciones y herramientas limitadas. Un «revisor» solo lee y comenta; un «escritor de tests» solo toca `test/`.

**Qué muestra:** cuanto más puede hacer el asistente por su cuenta, más importa limitar qué puede hacer. Con los permisos acotados se le puede dar autonomía sin perder el control.

### 5. Qué medir para saber si funciona

Las líneas que genera el asistente no dicen nada útil. En este equipo se miden dos cosas:

- el tiempo desde que llega la petición (DEV-412) hasta que se fusiona el PR;
- el número de idas y vueltas en la revisión.

Con PR reales en GitHub, los datos salen de la propia herramienta, por ejemplo con `gh pr view <número> --json createdAt,mergedAt,reviews`. El objetivo es que bajen las dos sin que suban los fallos en producción. Así se mide el trabajo que llega a `main`, no cuánto escribe el asistente.

### Para dejarlo como estaba

```bash
git switch main
git branch -D demo/dev-412
CONFIRM=1 make init-m05
```

## Qué queda visto

| Paso hacia `main` | Qué hace el asistente | Qué decide una persona o el repositorio |
|-------------------|-----------------------|-----------------------------------------|
| Reglas y prompts | Propone cambios a `AGENTS.md` | El PR que los acepta |
| Descripción del PR | La redacta desde el diff | Quien la firma la corrige |
| Revisión | Comenta con `AGENTS.md` como lista | Quien revisa filtra y publica |
| Herramientas y agentes | Consulta y actúa | Los permisos que tiene |
| Resultado | — | Tiempo hasta el merge e idas y vueltas |

El asistente acelera cada paso, pero no decide ninguno: las reglas, los prompts y la CI son del repositorio, y la firma y la revisión, de las personas.

En [01 — Pull request revisado](01-lab-pull-request-revisado.md) llevas la devolución a `main`. Se puede hacer sin haber seguido esta demostración.
