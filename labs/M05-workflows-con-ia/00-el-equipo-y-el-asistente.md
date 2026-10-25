# El equipo y el asistente

[← Página anterior](README.md) · [Siguiente página →](01-lab-pull-request-revisado.md)

Hasta aquí, el asistente ha trabajado para una sola persona. En un equipo, el trabajo llega a `main` por un camino compartido: rama, pull request, revisión y CI. Esta demostración recorre ese camino con la devolución de entradas del proyecto Telón y muestra dos cosas en cada parada. El asistente puede acelerar casi todos los pasos, pero hay decisiones que no puede tomar él: qué se publica, qué se fusiona y qué se comparte. Esas decisiones son de las personas y del repositorio.

## Punto de partida

- El proyecto Telón en el estado `make init-m05`: devolución, tests, README, OpenAPI y `AGENTS.md`, todo en el fork y todavía sin pull request.
- Repositorio del curso en GitHub (fork del alumno).
- Asistente en modo agente.

## Recorrido

### 1. Qué es del equipo y qué es de cada uno

En `telon/` hay ficheros que comparte todo el equipo y cosas que solo existen en el puesto de cada uno:

| En el repositorio (entra por PR) | En tu máquina (no se sube) |
|----------------------------------|----------------------------|
| `AGENTS.md`, `CLAUDE.md`, `.cursor/rules/`, `.github/copilot-instructions.md` | Historial de chats y «memorias» del asistente |
| Prompts reutilizables (`.github/prompts/`, `.cursor/commands/`, `.claude/commands/`) | Preferencias personales del editor y del asistente |
| Dev Container, `Makefile`, scripts | `.env`, tokens, la API key de tu cuenta del asistente |
| Workflow de CI | Cachés e índices del asistente |

Cuando el asistente descubre algo que vale para todos, no se deja en el chat. Por ejemplo: «la pasarela olvida los cargos si no se hace `db:reset` con ella arrancada». Se propone como cambio a `AGENTS.md` y entra por pull request, igual que el código.

Lo que está solo en un chat lo aprovecha una persona una vez. Lo que está en el repositorio lo aplican todos los asistentes del equipo a partir del siguiente `git pull`.

### 2. La descripción del pull request: la escribe el asistente, la firma una persona

Con la rama de la devolución lista, se pide:

```text
Escribe la descripción del PR a partir de git diff main...HEAD: qué cambia, por qué, cómo
probarlo (comandos exactos) y riesgos. Nada que no esté en el diff.
```

El resumen acierta en lo importante: migraciones 002 y 003, `refunds/`, `sendOnce`, `RefundRequest`, OpenAPI. Pero dice «se añaden tests de integración», y no los hay: los tests son unitarios con mocks. Quien abre el PR lo corrige antes de publicarlo.

El asistente ahorra el trabajo de redactar, pero la descripción va firmada por quien abre el PR: si dice algo falso, el error es suyo, no del asistente.

### 3. La revisión: el asistente propone y quien revisa decide

Se pide una revisión con `AGENTS.md` como lista de comprobación. Salen comentarios útiles, como un `DELETE` del script de escenario que convendría meter en una transacción o un mensaje de error en inglés. También salen otros de puro gusto, como renombrar variables. La persona que revisa elige qué comentarios publica y contesta los que no comparte.

Una revisión asistida encuentra más cosas en menos tiempo, pero también genera ruido. El criterio para filtrarlo sigue siendo de quien revisa.

### 4. Más herramientas, con permisos acotados

**MCP** (Model Context Protocol) es la forma estándar de conectar el asistente a herramientas externas. En este proyecto tendrían sentido, por ejemplo:

- el servidor MCP de GitHub, para leer issues y PR sin copiarlos al chat;
- un servidor MCP de PostgreSQL **de solo lectura** contra la base de datos de desarrollo, para que el agente consulte la tabla `tickets` en lugar de suponer su esquema.

Cada servidor MCP es código que se ejecuta con tus permisos. Un MCP con escritura sobre la base de datos de producción no tiene sitio en el día a día del equipo.

Los **agentes especializados** (subagentes de Claude Code, modos personalizados de Cursor o agentes de Copilot) son el mismo asistente con instrucciones y herramientas limitadas. Un «revisor» solo lee y comenta; un «escritor de tests» solo toca `test/`.

Cuanto más puede hacer el asistente por su cuenta, más importa limitar qué puede hacer. Con los permisos acotados se le puede dar autonomía sin perder el control.

### 5. Qué medir para saber si funciona

Las líneas que genera el asistente no dicen nada útil. En este equipo se miden dos cosas:

- el tiempo desde que llega la petición (DEV-412) hasta que se fusiona el PR;
- el número de idas y vueltas en la revisión.

El objetivo es que bajen las dos sin que suban los fallos en producción. Así se mide el trabajo que llega a `main`, no cuánto escribe el asistente.

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
