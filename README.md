# Developer 10x — IA en el ciclo de desarrollo

[Siguiente página →](labs/M01-ia-aplicada-al-desarrollo/00-del-autocompletado-al-agente.md)

## Objetivo general

Al finalizar el curso, el alumno lleva un evolutivo de la petición al pull request con un asistente de IA en cada fase: le da el contexto del proyecto, le pide cambios verificables y revisa lo que devuelve antes de que entre.

## Enfoque

Tu equipo hereda el proyecto **Telón**, un SaaS de venta de entradas para espectáculos que ya está en producción. Cada promotor crea su cuenta, configura sus dominios y diseña en TSX las páginas de sus eventos, con el editor de VS Code integrado en el backoffice. Para montarlas usa los componentes de la plataforma: selector de pases, selector de butacas, carrito, pago y QR. Detrás hay una API, colas, una pasarela de pago y el envío de correo por el proveedor que elija cada promotor.

Llega una petición: que los compradores puedan devolver entradas. No vas a escribir ese evolutivo a mano, ni tampoco vas a aceptar lo primero que proponga el asistente. Cada módulo es una fase del mismo trabajo: entender la plataforma, generar y refactorizar, probar y depurar, documentar y automatizar, y llevarlo a un pull request revisado. El pedido `PED-2026-0107` de la Sala Faro recorre todo el curso, así que puedes comparar lo que devuelve el asistente con y sin contexto. El curso se cierra con repositorios heredados sin contexto y dos desarrolladores que tienen que trabajar sin depender de la memoria de nadie.

El asistente no hace diez veces más por escribir más rápido. Hace más cuando le das el contexto del proyecto, le pides el cambio con un criterio de hecho y le encargas también los tests, la documentación y las tareas repetitivas. Además, revisas lo que devuelve antes de que entre.

## Dirigido a

Desarrolladores que mantienen y evolucionan producto y quieren usar un asistente de IA en su trabajo diario sin perder el control de lo que entra en el repositorio. No es un curso de programación ni de una herramienta concreta.

## Conocimientos previos

- Se da por sabido programar con soltura básica y trabajar con Git (ramas, commits, pull requests). El curso no los enseña.
- Basta con haber usado alguna vez un asistente de IA, aunque sea solo el chat.
- El stack del proyecto (TypeScript, React, colas) se lee con el asistente durante el curso; no hace falta conocerlo.
- No hace falta instalar nada si usas GitHub Codespaces: basta el navegador y una cuenta de GitHub.

## Objetivos específicos

- Situar autocompletado, chat y agente, y detectar lo que el asistente da por supuesto sobre una plataforma que no conoce.
- Generar con contexto la devolución, de la API al componente, y refactorizar el cálculo de importes sin cambiar el comportamiento.
- Obtener tests, datos y mocks desde las reglas de negocio, y corregir un fallo a partir de la traza.
- Documentar el README, la API y los componentes contra el código, y convertir una tarea repetitiva en un script.
- Llevar el cambio a un pull request revisado, con reglas versionadas, un workflow que lo valida y sin filtrar datos sensibles.
- Contextualizar repositorios heredados para que otro desarrollador haga un cambio solo con lo que queda en el repositorio.

## Temario

<!-- gen:temario -->
- **[M01 — Introducción a la IA aplicada al desarrollo](labs/M01-ia-aplicada-al-desarrollo/README.md)**
  - [Evolución de los asistentes de IA para desarrollo](labs/M01-ia-aplicada-al-desarrollo/00-del-autocompletado-al-agente.md)
  - [IA generativa aplicada a la ingeniería de software](labs/M01-ia-aplicada-al-desarrollo/00-del-autocompletado-al-agente.md)
  - [Casos de uso en el desarrollo moderno](labs/M01-ia-aplicada-al-desarrollo/02-lab-leer-la-peticion.md)
  - [Productividad asistida por IA](labs/M01-ia-aplicada-al-desarrollo/01-lab-entorno-y-primer-chat.md)
  - [Riesgos y limitaciones](labs/M01-ia-aplicada-al-desarrollo/02-lab-leer-la-peticion.md)
  - [Buenas prácticas de adopción](labs/M01-ia-aplicada-al-desarrollo/02-lab-leer-la-peticion.md)
- **[M02 — Asistentes de IA y generación de código](labs/M02-generacion-de-codigo/README.md)**
  - [Introducción a herramientas de asistencia al desarrollo](labs/M02-generacion-de-codigo/00-contexto-cambia-el-diff.md)
  - [Generación de código asistida](labs/M02-generacion-de-codigo/02-lab-generar-devolucion.md)
  - [Refactorización y optimización](labs/M02-generacion-de-codigo/03-lab-explicar-y-refactorizar.md)
  - [Explicación y comprensión de código](labs/M02-generacion-de-codigo/03-lab-explicar-y-refactorizar.md)
  - [Generación de estructuras y componentes](labs/M02-generacion-de-codigo/02-lab-generar-devolucion.md)
  - [Buenas prácticas de revisión](labs/M02-generacion-de-codigo/02-lab-generar-devolucion.md)
- **[M03 — Testing y calidad asistida por IA](labs/M03-testing-y-calidad/README.md)**
  - [Generación automática de pruebas](labs/M03-testing-y-calidad/01-lab-tests-y-datos.md)
  - [Validación funcional](labs/M03-testing-y-calidad/00-la-red-de-tests.md)
  - [Automatización de tareas de QA](labs/M03-testing-y-calidad/01-lab-tests-y-datos.md)
  - [Generación de mocks y datos de prueba](labs/M03-testing-y-calidad/02-lab-mocks.md)
  - [Detección de errores y debugging](labs/M03-testing-y-calidad/04-lab-debugging-correo-duplicado.md)
  - [Calidad y mantenibilidad del código](labs/M03-testing-y-calidad/03-lab-caso-limite-redondeo.md)
- **[M04 — Documentación y automatización](labs/M04-documentacion-y-automatizacion/README.md)**
  - [Generación de documentación técnica](labs/M04-documentacion-y-automatizacion/00-documentar-lo-que-hay.md)
  - [Creación de README y documentación de API](labs/M04-documentacion-y-automatizacion/01-lab-readme-y-openapi.md)
  - [Automatización de tareas repetitivas](labs/M04-documentacion-y-automatizacion/02-lab-script-y-snippets.md)
  - [Asistencia en configuración y scripting](labs/M04-documentacion-y-automatizacion/02-lab-script-y-snippets.md)
  - [Generación de ejemplos y snippets reutilizables](labs/M04-documentacion-y-automatizacion/02-lab-script-y-snippets.md)
- **[M05 — IA en workflows de desarrollo modernos](labs/M05-workflows-con-ia/README.md)**
  - [Integración de IA en IDEs](labs/M05-workflows-con-ia/00-el-equipo-y-el-asistente.md)
  - [Flujos de trabajo colaborativos](labs/M05-workflows-con-ia/01-lab-pull-request-revisado.md)
  - [Uso responsable de la IA](labs/M05-workflows-con-ia/02-lab-workflow-y-seguridad.md)
  - [Seguridad y validación de resultados](labs/M05-workflows-con-ia/02-lab-workflow-y-seguridad.md)
  - [Productividad y eficiencia en equipos técnicos](labs/M05-workflows-con-ia/00-el-equipo-y-el-asistente.md)
  - [Buenas prácticas organizativas](labs/M05-workflows-con-ia/00-el-equipo-y-el-asistente.md)
- **[M06 — Casos prácticos y escenarios reales](labs/M06-caso-integral/README.md)**
  - [Aplicación práctica de IA en proyectos de software](labs/M06-caso-integral/02-lab-explorar-y-contextualizar.md)
  - [Resolución de escenarios reales de desarrollo](labs/M06-caso-integral/04-lab-dev2-sin-memoria.md)
  - [Optimización de la productividad](labs/M06-caso-integral/03-lab-macrocontexto-y-dinamica.md)
  - [Estrategias de adopción progresiva](labs/M06-caso-integral/05-antipatrones-y-adopcion.md)
  - [Revisión de buenas prácticas y antipatrones](labs/M06-caso-integral/05-antipatrones-y-adopcion.md)
<!-- /gen:temario -->

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

<!-- gen:empieza -->
→ **[M01 — Del autocompletado al agente](labs/M01-ia-aplicada-al-desarrollo/00-del-autocompletado-al-agente.md)**
<!-- /gen:empieza -->
