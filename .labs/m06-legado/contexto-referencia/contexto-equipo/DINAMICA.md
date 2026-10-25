# Dinámica del equipo con asistentes

## Qué va al repositorio y qué no

| Al repositorio (se revisa) | En tu máquina |
|----------------------------|---------------|
| `AGENTS.md` de cada repo y este repo | Chats, memorias del asistente |
| `CLAUDE.md` y otros punteros a `AGENTS.md` | Preferencias personales |
| Prompts reutilizables del equipo | `.env`, credenciales, URLs de producción |

## Cómo entra un cambio de contexto

1. Lo que descubres con el asistente y **has comprobado** en el código se propone como cambio en el `AGENTS.md` que toque.
2. Va en su propio commit (`contexto: …`), en una rama si cambia una regla.
3. Lo revisa otra persona: ¿se puede comprobar cada línea?
4. Si contradice otro `AGENTS.md`, se arregla en el mismo cambio.

## Handoff

Al dejar una tarea a medias, el handoff va en la descripción de la rama o del PR, no en el chat:
qué está hecho, qué falta, qué has comprobado y cómo, y qué no está claro.

## Contexto por rama

El `AGENTS.md` de una rama describe esa rama. Si una rama cambia un contrato (un estado nuevo, una columna), cambia también el contexto en la misma rama. Al fusionar, los conflictos en `AGENTS.md` se resuelven como los de código: leyendo las dos versiones.
