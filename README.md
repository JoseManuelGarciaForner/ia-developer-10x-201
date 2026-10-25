# Developer 10x — IA en el ciclo de desarrollo

[Siguiente página →](labs/M01-ia-aplicada-al-desarrollo/00-del-autocompletado-al-agente.md)

## Objetivo general

Aprender a usar un asistente de IA (GitHub Copilot, Cursor o Claude Code) en el trabajo diario de un equipo de desarrollo **sin perder el control de lo que entra en el repositorio**.

Durante el curso llevas una funcionalidad real de principio a fin en un proyecto que no has escrito: desde que llega la petición hasta que se fusiona el pull request. En cada fase usas el asistente para lo que mejor hace (leer código, proponer cambios, escribir tests y documentación, automatizar tareas) y practicas las dos cosas que deciden si el resultado sirve: darle el contexto que necesita y comprobar lo que devuelve.

## Enfoque

### El proyecto

Tu equipo hereda el proyecto **Telón**, un SaaS de venta de entradas para espectáculos que ya está en producción:

- **Promotores** (salas, teatros) crean su cuenta, configuran sus dominios y diseñan las páginas de sus eventos en TSX, con el editor de VS Code integrado en el backoffice.
- **Compradores** eligen butaca o pase, pagan y reciben sus entradas con QR por correo.
- **Por detrás** hay una API, colas, una pasarela de pago y el envío de correo por el proveedor que elija cada promotor.

Es una plataforma completa que arranca en tu equipo o en el navegador con un solo comando, y que tiene lo que tiene cualquier proyecto real: reglas de negocio que no están escritas, un README que no cuadra con el código y algún fallo escondido.

### La petición

Llega una petición sencilla de enunciar: **que los compradores puedan devolver entradas**. Para hacerla hay que tocar base de datos, API, pasarela, cola de correo y tienda, y respetar reglas que el asistente no puede adivinar. Cada módulo es una fase de ese mismo trabajo:

| Módulo | Fase | Qué haces con el asistente |
|--------|------|-----------------------------|
| M01 | Entender | Recorrer la plataforma y descubrir lo que da por supuesto sin saberlo |
| M02 | Construir | Escribir las reglas del proyecto, generar la devolución y refactorizar el cálculo de importes |
| M03 | Probar | Tests desde las reglas de negocio, mocks y dos fallos que los tests en verde no veían |
| M04 | Documentar | README, API y componentes comprobados contra el código, y un script para los datos de prueba |
| M05 | Entregar | Pull request revisado, CI en GitHub Actions y una revisión de seguridad |
| M06 | Escalar al equipo | Repositorios heredados sin contexto y dos desarrolladores que no comparten conversación |

### La idea de fondo

Un desarrollador «10x» con IA no es el que genera más código, sino el que obtiene cambios correctos a la primera y los comprueba rápido. En cada lab se practican tres hábitos:

1. **Dar contexto**: las reglas del proyecto viven en el repositorio (`AGENTS.md`), no en el prompt de cada uno.
2. **Pedir cambios comprobables**: con un criterio de hecho, un ejemplo y los tests que lo demuestran.
3. **Revisar antes de aceptar**: cada diff se lee y se verifica ejecutándolo.

El mismo pedido de ejemplo, `PED-2026-0107` de la Sala Faro, aparece en todo el curso, así que puedes comparar lo que devuelve el asistente con contexto y sin él.

## Dirigido a

Desarrolladores que mantienen y hacen evolucionar un producto y quieren incorporar un asistente de IA a su trabajo diario, de forma que el equipo pueda confiar en lo que se genera. No es un curso de programación ni de una herramienta concreta: lo aprendido vale para cualquier asistente con modo agente.

## Conocimientos previos

- Programar con soltura básica y manejar Git (ramas, commits, pull requests). El curso no los enseña.
- Haber usado alguna vez un asistente de IA, aunque sea solo el chat.
- No hace falta conocer el stack del proyecto (TypeScript, React, colas): se lee con el asistente durante el curso.
- No hace falta instalar nada si usas GitHub Codespaces: basta el navegador y una cuenta de GitHub.

## Objetivos específicos

Al terminar el curso sabrás:

- Distinguir autocompletado, chat y agente, y detectar lo que el asistente supone sobre un código que no conoce.
- Escribir el contexto de un proyecto para que cualquier asistente lo aplique, y generar con él una funcionalidad completa, de la API al componente.
- Refactorizar código heredado sin cambiar su comportamiento, con tests de caracterización como red.
- Obtener tests, datos de prueba y mocks a partir de las reglas de negocio, y encontrar la causa de un fallo a partir de su traza.
- Documentar un proyecto contra el código real y convertir una tarea repetitiva en un script.
- Llevar un cambio a un pull request revisado, validado por CI y sin exponer datos sensibles.
- Dejar contexto en repositorios heredados para que otra persona trabaje sobre ellos sin depender de tu conversación.

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
