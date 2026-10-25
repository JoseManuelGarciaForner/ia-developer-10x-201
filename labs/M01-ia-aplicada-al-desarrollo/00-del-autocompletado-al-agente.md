# Del autocompletado al agente

[← Página anterior](README.md) · [Siguiente página →](01-lab-entorno-y-primer-chat.md)

Telón es una plataforma que nadie del equipo ha escrito: tienda, backoffice, API, pasarela, colas y correo. La misma pregunta sobre ella («¿cómo se calcula la comisión de una entrada?») se le hace a tres formas de asistente. Cada una ve una parte distinta del proyecto y se equivoca a su manera.

## Punto de partida

- Repositorio del curso abierto en el Dev Container, en la carpeta `telon/`.
- Estado: `make init-m01` (Telón tal como lo hereda el equipo, sin ficheros de contexto para la IA).
- Fichero de referencia: `services/api/src/orders/pricing.ts`.

## Recorrido

> [!NOTE]
> Las respuestas exactas cambian con el modelo y la versión del asistente. Lo que se repite es el tipo de error de cada forma.

### 1. Autocompletado: ve la línea

En `services/api/src/orders/pricing.ts`, dentro de `calcOrderAmounts`, se escribe un comentario nuevo justo encima del cálculo de la comisión:

```ts
// comisión mínima por entrada:
```

El autocompletado propone en gris algo como `if (c < 30) c = 30;`. Es plausible, compila y no viene de ninguna parte: Telón no tiene comisión mínima. Esa regla existe en otro sistema (el motor de tarifas de liquidaciones, que aparece en el M06), y el autocompletado no lo ha leído. Ha completado lo más probable con lo que tenía alrededor del cursor.

### 2. Chat: ve lo que se le pega

En un chat sin ficheros adjuntos se pregunta:

```text
En Telón, ¿cómo se calcula la comisión de plataforma de una entrada?
```

La respuesta es segura y genérica: «un porcentaje configurable sobre el total del pedido, redondeado al final». Suena bien y es falsa en dos puntos. En el código, la comisión es por entrada (`commission_bps` sobre el precio) y se redondea por entrada. El chat no ha abierto `pricing.ts`: ha contestado con lo que suele hacer un sistema de entradas.

La misma pregunta con el fichero citado (`@pricing.ts` en Cursor o Copilot; en Claude Code, el agente lo lee solo) ya devuelve la regla correcta y cita la línea del `Math.round`.

### 3. Agente: lee, ejecuta y cambia

En modo agente, la pregunta se convierte en tarea:

```text
Explícame cómo se calcula la comisión de una entrada en Telón y compruébalo con un test.
```

El agente busca `commission` en el repositorio, abre `pricing.ts` y `test/pricing.test.ts` y ejecuta `npm test -w @telon/api`. Responde con la regla, la ubicación y la salida del test. También propone añadir un test nuevo y, si se le deja, toca dos ficheros más de los necesarios. Ve mucho más, pero hay que acotarle qué puede cambiar.

## Qué queda visto

| Forma | Qué ve | Error típico en Telón |
|-------|--------|------------------------|
| Autocompletado | El fichero y el cursor | Inventa una comisión mínima que aquí no existe |
| Chat | Lo que se le pega o cita | Describe la comisión «del total» sin haber leído el código |
| Agente | Repositorio, terminal y ficheros | Acierta, pero cambia más de lo pedido si no se acota |

En los tres casos, la respuesta se acepta cuando se ha comprobado en el código o con un test. En [01 — Entorno y primer chat](01-lab-entorno-y-primer-chat.md) se pone en marcha Telón y el asistente en tu puesto. Se puede hacer sin haber seguido esta demostración.
