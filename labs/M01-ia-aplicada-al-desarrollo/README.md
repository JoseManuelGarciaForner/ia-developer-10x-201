# M01 — Introducción a la IA aplicada al desarrollo

[← Página anterior](../../README.md) · [Siguiente página →](00-del-autocompletado-al-agente.md)

Antes de pedirle nada al asistente sobre Telón hay que saber qué tipo de herramienta tienes delante. Un autocompletado ve la línea, un chat ve lo que le pegas y un agente lee ficheros y ejecuta comandos. Cada uno se equivoca a su manera.

## Qué aprenderás

- Distinguir autocompletado, chat y agente, y qué contexto usa cada uno.
- Reconocer los casos de uso en los que la IA ahorra tiempo en una plataforma heredada y en los que no.
- Identificar riesgos concretos: respuesta plausible pero falsa, dependencia inventada, dato sensible en el prompt.
- Leer una plataforma que no conoces con ayuda del asistente y comprobar lo que te cuenta.

## Teoría

| Herramienta | Qué ve | Dónde falla |
|-------------|--------|-------------|
| Autocompletado | El fichero abierto y lo que rodea al cursor | Completa con lo más probable, no con la regla de negocio |
| Chat | Lo que citas o pegas, y el historial | Responde con seguridad sobre código que no ha leído |
| Agente | El repositorio, la terminal y los ficheros que modifica | Hace cambios amplios: hay que acotar y revisar |

En Telón, la petición «que el comprador pueda devolver entradas» parece sencilla. El asistente no sabe que un pedido pagado no se modifica, que los gastos de gestión no se reembolsan, que la comisión se redondea por entrada ni que el QR devuelto tiene que dejar de abrir la puerta. Eso es contexto, y si no está escrito, el asistente se lo inventa.

Buenas prácticas de adopción desde el primer día:

- Una persona firma cada diff. El asistente no es el autor.
- Lo que el asistente afirma sobre el código se comprueba en el código.
- Nada de credenciales, datos de clientes ni código que no puede salir de la empresa en el prompt.

## Qué dejas hecho

1. **El entorno en marcha.** Tu fork abierto en local o en Codespaces, el Dev Container arrancado, tests en verde, la landing de la Sala Faro en el navegador y el asistente respondiendo dentro del proyecto.
2. **Un mapa de la plataforma** hecho con el asistente: apps, servicios y colas, y el recorrido de un pedido desde el selector de butacas hasta el correo con el QR en Mailpit, con cada afirmación comprobada en el código.
3. **La lista de lo que le falta saber** al asistente para hacer la devolución. Es la entrada del M02.

## Páginas

| # | Página | Qué hay |
|---|--------|---------|
| 00 | [Del autocompletado al agente](00-del-autocompletado-al-agente.md) | Demostración: la misma pregunta sobre Telón a las tres formas de asistente |
| 01 | [Laboratorio: entorno y primer chat](01-lab-entorno-y-primer-chat.md) | Fork, Dev Container (local o Codespaces), una compra con su correo y la primera respuesta comprobada |
| 02 | [Laboratorio: leer la petición](02-lab-leer-la-peticion.md) | El recorrido de un pedido, los supuestos del asistente y lo que le falta saber |

→ Empieza por **[00 — Del autocompletado al agente](00-del-autocompletado-al-agente.md)**.
