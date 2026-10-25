# M04 — Documentación y automatización

[← Página anterior](../M03-testing-y-calidad/04-lab-debugging-correo-duplicado.md) · [Siguiente página →](00-documentar-lo-que-hay.md)

La documentación generada se lee bien y puede ser falsa. Si el asistente describe un endpoint que no existe o un parámetro con otro nombre, el README engaña al siguiente que llegue. Aquí se documenta la devolución y se comprueba que lo escrito coincide con el código.

## Qué aprenderás

- Generar documentación técnica a partir del código y verificarla.
- Crear el README de la plataforma, la documentación de la API (OpenAPI) del endpoint nuevo y la de un componente troncal para los promotores.
- Convertir una tarea repetitiva en un script con ayuda del asistente.
- Usar el asistente para configuración y scripting (npm scripts, Dev Container).
- Guardar ejemplos y snippets reutilizables para el equipo.

## Teoría

| Documento | Cómo se verifica |
|-----------|------------------|
| README | Cada comando del README se ejecuta tal cual en un terminal limpio |
| OpenAPI | El esquema se valida y una petición de ejemplo devuelve lo que dice |
| Componente troncal | El ejemplo de TSX de la documentación funciona pegado en el editor del backoffice |
| Comentario de función | Coincide con lo que prueban los tests |

En Telón, la tarea repetitiva es cargar datos de prueba (el tenant Sala Faro, su dominio, el evento con sus butacas y un pedido pagado) cada vez que se reinicia el entorno. El asistente escribe el script y tú decides qué valida y qué falla en voz alta.

## Qué dejas hecho

1. **README de la plataforma** actualizado con la devolución, con todos sus comandos probados.
2. **OpenAPI del endpoint de devolución**, validado con una petición real, y **la documentación de `SeatPicker`** con un ejemplo que funciona en el editor.
3. **Script de datos de prueba** y un snippet o prompt guardado para el equipo.

## Páginas

<!-- gen:paginas -->
| # | Página | Qué hay |
|---|--------|---------|
| 00 | [Documentar lo que hay](00-documentar-lo-que-hay.md) | Demostración: actualizar el README leyendo frente a actualizarlo ejecutando |
| 01 | [Laboratorio: README y OpenAPI](01-lab-readme-y-openapi.md) | Auditoría del README, reescritura y contrato de la devolución validado con linter y petición real |
| 02 | [Laboratorio: script, componente y prompts](02-lab-script-y-snippets.md) | `npm run escenario` idempotente, `SeatPicker` documentado y probado en el editor, y un prompt versionado |

→ Empieza por **[00 — Documentar lo que hay](00-documentar-lo-que-hay.md)**.
<!-- /gen:paginas -->
