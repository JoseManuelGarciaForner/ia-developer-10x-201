# M05 — IA en workflows de desarrollo modernos

[← Página anterior](../M04-documentacion-y-automatizacion/02-lab-script-y-snippets.md) · [Siguiente página →](00-el-equipo-y-el-asistente.md)

Si cada desarrollador tiene sus propias instrucciones en su chat, el equipo no comparte nada. En Telón las reglas viven en el repositorio, entran por pull request y las aplica cualquiera que abra el proyecto, con el asistente que use. La devolución llega a `main` revisada y con un workflow que la valida.

## Qué aprenderás

- Integrar el asistente en el IDE y en el flujo del equipo: reglas versionadas frente a configuración personal.
- Trabajar en colaboración: pull request, resumen y revisión asistidos.
- Usar la IA de forma responsable: datos sensibles, modo privacidad y licencias.
- Validar resultados con seguridad: secretos, dependencias inventadas y permisos del agente.
- Conocer MCP y los agentes especializados, y dónde encajan.
- Medir la productividad del equipo sin confundirla con líneas generadas.

## Teoría

| Va al repositorio | Se queda en tu máquina |
|-------------------|------------------------|
| Reglas del proyecto y `AGENTS.md` | Conversaciones y memoria del chat |
| Prompts reutilizables | Preferencias personales |
| Dev Container y scripts | `.env`, tokens y credenciales |
| Workflow de CI | Cachés e índices |

Ciclo de conocimiento: lo que el asistente descubre y tú validas se convierte en regla, la regla entra por PR, se revisa y pasa a ser contexto de todos.

No se pega en un prompt: la API key del proveedor de email de un promotor, otras credenciales, datos de compradores reales ni código que el contrato no deja salir. Las dependencias que proponga el asistente se comprueban en el registro antes de instalarlas.

## Qué dejas hecho

1. **Pull request de la devolución** con el resumen revisado y un comentario de revisión respondido.
2. **Workflow de lint y tests** en verde.
3. **Lista de comprobación de seguridad** aplicada al PR: secretos, dependencias y permisos.

## Páginas

<!-- gen:paginas -->
| # | Página | Qué hay |
|---|--------|---------|
| 00 | [El equipo y el asistente](00-el-equipo-y-el-asistente.md) | Demostración: qué va al repositorio, resumen y revisión del PR, MCP, agentes especializados y cómo medir |
| 01 | [Laboratorio: pull request revisado](01-lab-pull-request-revisado.md) | La devolución en un PR de tu fork, con descripción comprobada y una revisión respondida |
| 02 | [Laboratorio: workflow y seguridad](02-lab-workflow-y-seguridad.md) | CI en verde (y en el sitio correcto), la API key que se escapaba y los permisos del agente |

→ Empieza por **[00 — El equipo y el asistente](00-el-equipo-y-el-asistente.md)**.
<!-- /gen:paginas -->
