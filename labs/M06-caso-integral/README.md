# M06 — Casos prácticos y escenarios reales

[← Página anterior](../M05-workflows-con-ia/02-lab-workflow-y-seguridad.md) · [Siguiente página →](00-el-legado.md)

Hasta aquí has trabajado sobre un proyecto ordenado. El código que vas a encontrar en un equipo real no lo está. El proyecto Telón tiene también su parte heredada: la app de control de acceso en puerta, el batch que liquida a los promotores, el motor de tarifas y el widget antiguo para webs de terceros. Los escribieron equipos distintos, con convenciones que no cuadran, README que no coinciden con el código, sin tests, con dependencias que no se ven (el batch lee la base de datos de la plataforma directamente) y un lenguaje de tarifas propio que ningún modelo conoce. Ninguno tiene contexto para la IA.

Haces de dos desarrolladores del mismo equipo, `dev1` y `dev2`, con dos clones en carpetas distintas. `dev1` explora el legado con la IA, valida lo que le cuenta y deja el contexto en los repositorios. `dev2` abre un chat nuevo, sin nada de lo que habló `dev1`, y hace que una devolución llegue a las liquidaciones y al control de acceso usando solo lo que quedó versionado.

## Qué aprenderás

- Aplicar la IA a un proyecto real que no conoces: descubrimiento, validación y contexto.
- Escribir el contexto de cada repositorio y el que los une: contratos, dependencias y handoff.
- Montar una dinámica de equipo: qué se versiona, qué se queda en local y cómo entra un cambio de contexto.
- Comprobar que el conocimiento está en el repositorio y no en la conversación de una persona.
- Plantear una adopción progresiva y reconocer los antipatrones.

## Cómo funcionan los remotos

Cada repositorio heredado tiene un remoto, que hace de servidor del equipo. `dev1` y `dev2` son dos clones de ese remoto: uno sube cambios y el otro los recibe.

| Modo | Dónde están los remotos | Qué necesitas |
|------|-------------------------|---------------|
| `local` (por defecto) | Repos bare en `workspace/m06/remotes/`, en tu disco | Nada más |
| `github` | Repos en tu cuenta de GitHub | `gh auth login` y configurar `.env` |

El modo se elige en el `.env` de tu fork (copia de `.env.example`). `make init-m06` crea los remotos y los dos clones y devuelve todo al punto de partida. `make up-m06` muestra el estado de cada clon. `make contexto-m06` sube el contexto de referencia como `dev1`, para hacer el lab de `dev2` sin los anteriores. [Remotos y dos desarrolladores](01-remotos-y-dos-desarrolladores.md) lo explica paso a paso.

## Teoría

| Antipatrón | Qué pasa | Alternativa |
|------------|----------|-------------|
| Aceptar en bloque | Entra código que nadie ha leído | Diff pequeño y revisado |
| Creerse el README | La IA repite lo que el documento dice, no lo que el código hace | Cada afirmación se comprueba en el código |
| Contexto en el chat | Se pierde al cerrar la sesión y no llega al compañero | Contexto versionado, entra por PR |
| Un contexto gigante | El asistente se pierde y gasta ventana | Contexto por repo y uno general con los contratos |
| Agente sin límites | Cambios en ficheros que no tocaban | Acotar ficheros y comandos |
| Medir líneas generadas | Más código, no más valor | Medir tiempo de petición a PR |

## Qué dejas hecho

1. **Contexto de cada repositorio heredado**, validado contra el código, y un contexto general con contratos y dependencias.
2. **La dinámica del equipo escrita**: qué va al repositorio, qué se queda en local y cómo se revisa un cambio de contexto.
3. **El cambio de `dev2`** hecho solo con el contexto versionado, comparado con el mismo cambio sin contexto.
4. **Tres pasos de adopción** que llevarías a tu equipo.

## Páginas

<!-- gen:paginas -->
| # | Página | Qué hay |
|---|--------|---------|
| 00 | [El legado](00-el-legado.md) | Enunciado: los cuatro repositorios heredados, qué se sabe de ellos y DEV-430 |
| 01 | [Remotos y dos desarrolladores](01-remotos-y-dos-desarrolladores.md) | Metodología: remotos locales o en GitHub, `dev1`/`dev2`, `.env`, `init` y `up` |
| 02 | [Laboratorio: explorar y contextualizar](02-lab-explorar-y-contextualizar.md) | `dev1` descubre con el asistente, lo comprueba ejecutando y deja un `AGENTS.md` por repo |
| 03 | [Laboratorio: macrocontexto y dinámica](03-lab-macrocontexto-y-dinamica.md) | Contratos entre repos y con el proyecto Telón, la dinámica del equipo y un conflicto de contexto al fusionar |
| 04 | [Laboratorio: dev2, sin memoria](04-lab-dev2-sin-memoria.md) | DEV-430 sin contexto y con contexto, comprobado en la puerta y en la liquidación |
| 05 | [Antipatrones y adopción](05-antipatrones-y-adopcion.md) | Lo que salió mal en el curso y tres pasos de adopción para tu equipo |

→ Empieza por **[00 — El legado](00-el-legado.md)**.
<!-- /gen:paginas -->
