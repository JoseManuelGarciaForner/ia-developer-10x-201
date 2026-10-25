# El equipo y el asistente

[← Página anterior](README.md) · [Siguiente página →](01-lab-pull-request-revisado.md)

La devolución de entradas funciona en el puesto de quien la hizo. Para que llegue a `main` tiene que pasar por el equipo: revisión, validación automática y las mismas reglas para todos. Esta demostración recorre dónde encaja el asistente en ese camino y dónde no debe estar solo.

## Punto de partida

- Telón en el estado `make init-m05`: devolución, tests, README, OpenAPI y `AGENTS.md`, todo en el fork y todavía sin pull request.
- Repositorio del curso en GitHub (fork del alumno).
- Asistente en modo agente.

## Recorrido

### 1. Lo que es del equipo y lo que es tuyo

En `telon/` conviven ficheros de los dos tipos:

| En el repositorio (se revisa por PR) | En tu máquina (no se sube) |
|--------------------------------------|----------------------------|
| `AGENTS.md`, `CLAUDE.md`, `.cursor/rules/`, `.github/copilot-instructions.md` | Historial de chats y «memorias» del asistente |
| Prompts reutilizables (`.github/prompts/`, `.cursor/commands/`, `.claude/commands/`) | Preferencias personales del editor y del asistente |
| Dev Container, `Makefile`, scripts | `.env`, tokens, la API key de tu cuenta del asistente |
| Workflow de CI | Cachés e índices del asistente |

Cuando el asistente descubre algo que vale para todos (por ejemplo, «la pasarela olvida los cargos si no se hace `db:reset` con ella arrancada»), eso no se queda en el chat: se propone como cambio a `AGENTS.md` y entra por pull request, como el código.

### 2. El resumen del pull request

Con la rama de la devolución lista, se pide al asistente:

```text
Escribe la descripción del PR a partir de git diff main...HEAD: qué cambia, por qué, cómo
probarlo (comandos exactos) y riesgos. Nada que no esté en el diff.
```

Sale un resumen correcto en lo grande (migraciones 002 y 003, `refunds/`, `sendOnce`, `RefundRequest`, OpenAPI). Tiene un detalle típico: dice «se añaden tests de integración», y no los hay; los tests son unitarios con mocks. Quien abre el PR firma la descripción, así que la corrige antes de publicarla.

### 3. La revisión con el asistente

Se le pide una revisión con el `AGENTS.md` como lista de comprobación. Encuentra cosas útiles: un `DELETE` del script de escenario que convendría envolver en la transacción y un mensaje de error en inglés. También propone renombrar variables por gusto. La persona que revisa decide cuáles de esos comentarios publica, y responde los que no comparte.

### 4. MCP y agentes especializados

**MCP** (Model Context Protocol) es la forma estándar de dar al asistente herramientas externas. Para Telón tendrían sentido, por ejemplo:
- el servidor MCP de GitHub, para leer issues y PR sin copiarlos;
- un servidor MCP de PostgreSQL **de solo lectura** contra la base de datos de desarrollo, para que el agente consulte `tickets` en lugar de suponer su esquema.

Cada servidor MCP es código que se ejecuta con tus permisos. Un MCP con escritura sobre la base de datos de producción está fuera de lugar en el día a día de este equipo.

Los **agentes especializados** (subagentes de Claude Code, modos personalizados de Cursor o agentes de Copilot) son el mismo asistente con instrucciones y herramientas acotadas: un «revisor» que solo lee y comenta, o un «escritor de tests» que solo toca `test/`. Acotar lo que puede hacer cada uno es la forma práctica de darles autonomía.

### 5. Cómo medir

Las líneas generadas por el asistente no miden nada útil. En este equipo se miden dos cosas:
- tiempo desde que llega la petición (DEV-412) hasta que el PR se fusiona;
- número de idas y vueltas en la revisión.

El objetivo es que bajen sin que suban los fallos en producción.

## Qué queda visto

El asistente redacta y revisa, pero la persona firma la descripción y decide qué comentarios publica. Las reglas, los prompts y la CI son del repositorio, y lo de cada uno se queda en su máquina. En [01 — Pull request revisado](01-lab-pull-request-revisado.md) llevas la devolución a `main`. Se puede hacer sin haber seguido esta demostración.
