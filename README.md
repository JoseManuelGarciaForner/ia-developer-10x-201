# Developer 10x — IA en el ciclo de desarrollo

[Siguiente página →](labs/M01-ia-aplicada-al-desarrollo/README.md)

## De qué va este curso

Tu equipo hereda **Telón**, un SaaS de venta de entradas para espectáculos que ya está en producción. Cada promotor crea su cuenta, configura sus dominios y diseña en TSX las páginas de sus eventos, con el editor de VS Code integrado en el backoffice. Para montarlas usa los componentes de la plataforma: selector de pases, selector de butacas, carrito, pago y QR. Detrás hay una API, colas, una pasarela de pago y el envío de correo por el proveedor que elija cada promotor.

Llega una petición: que los compradores puedan devolver entradas. No vas a escribir ese evolutivo a mano, ni tampoco vas a aceptar lo primero que proponga el asistente. Lo vas a llevar de la petición al pull request con la IA trabajando en cada fase. El pedido `PED-2026-0107` de la Sala Faro recorre todo el curso, así que puedes comparar lo que devuelve el asistente con y sin contexto.

El asistente no hace diez veces más por escribir más rápido. Hace más cuando le das el contexto del proyecto, le pides el cambio con un criterio de hecho y le encargas también los tests, la documentación y las tareas repetitivas. Además, revisas lo que devuelve antes de que entre.

Al terminar sabrás dar contexto al asistente y pedirle cambios que puedes verificar. También sabrás generar y refactorizar código sin romper el comportamiento, obtener tests con datos y mocks y corregir un fallo a partir de la traza, documentar y automatizar, y llevar el cambio a un pull request revisado con reglas versionadas y un workflow que lo valida.

## Temario

- **M01 — Introducción a la IA aplicada al desarrollo** — [del autocompletado al agente, y qué necesita saber el asistente de una plataforma que no conoce](labs/M01-ia-aplicada-al-desarrollo/README.md)
- **M02 — Asistentes de IA y generación de código** — [la devolución generada con contexto, de la API al componente, y el cálculo de importes refactorizado](labs/M02-generacion-de-codigo/README.md)
- **M03 — Testing y calidad asistida por IA** — [tests, datos y mocks; la comisión mal redondeada y el correo que llegaba dos veces](labs/M03-testing-y-calidad/README.md)
- **M04 — Documentación y automatización** — [el README, la API y los componentes documentados contra el código, y la tarea repetitiva convertida en script](labs/M04-documentacion-y-automatizacion/README.md)
- **M05 — IA en workflows de desarrollo modernos** — [reglas del equipo en el repositorio, pull request revisado y lo que no se pega en un prompt](labs/M05-workflows-con-ia/README.md)
- **M06 — Casos prácticos y escenarios reales** — [repos heredados sin contexto, dos desarrolladores y una forma de trabajar que no depende de la memoria de nadie](labs/M06-caso-integral/README.md)

## Antes de empezar

Trabajas en tu propio fork de este repositorio, de una de estas dos formas:

| Ruta | Qué necesitas | Asistente |
|------|---------------|-----------|
| **Local** | Git y Docker en tu equipo | Cursor, VS Code con GitHub Copilot o Claude Code |
| **GitHub Codespaces** | Solo el navegador | GitHub Copilot o Claude Code |

Las dos rutas arrancan el mismo Dev Container, con la plataforma, la base de datos, las colas y Mailpit para ver los correos.

| Requisito | Dónde |
|-----------|-------|
| Un asistente con licencia activa | Se comprueba en el M01 |
| Cuenta de GitHub | Fork, pull request y workflow |
| Experiencia básica programando y con Git | El curso no los enseña |

## Empieza aquí

→ **[M01 — Introducción a la IA aplicada al desarrollo](labs/M01-ia-aplicada-al-desarrollo/README.md)**
