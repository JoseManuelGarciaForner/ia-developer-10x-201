# Del autocompletado al agente

[← Página anterior](README.md) · [Siguiente página →](01-lab-entorno-y-primer-chat.md)

Autocompletado, chat y agente parecen la misma IA con distinta interfaz, pero no lo son: cada uno trabaja con una parte diferente del proyecto, y eso decide cuándo acierta y cómo se equivoca. Para verlo, en el proyecto Telón se hace la misma pregunta a las tres formas de asistente: **¿cómo se calcula la comisión de una entrada?** Como la respuesta correcta está en el código, se puede comparar cada respuesta con ella.

## Punto de partida

- Repositorio del curso abierto en el Dev Container, en la carpeta `telon/`.
- Estado: `make init-m01`, el proyecto tal como lo hereda el equipo, sin ficheros de contexto para la IA.
- Fichero de referencia: `services/api/src/orders/pricing.ts`.
- La respuesta correcta, sacada del código: la comisión se calcula **por entrada**, como un porcentaje del precio de esa entrada (`commission_bps`, 7,5 % en la Sala Faro), y se **redondea por entrada**. No hay comisión mínima.

> [!NOTE]
> Las respuestas exactas cambian con el modelo y la versión del asistente. Lo que se repite es el tipo de error de cada forma, porque depende de lo que cada una tiene delante.

## Recorrido

### 1. El autocompletado solo ve lo que rodea al cursor

En `pricing.ts`, dentro de `calcOrderAmounts`, se escribe un comentario encima del cálculo de la comisión:

```ts
// comisión mínima por entrada:
```

El autocompletado propone en gris `if (c < 30) c = 30;`. Compila y parece razonable, pero el proyecto no tiene comisión mínima. Esa regla existe en otro sistema, el motor de tarifas de liquidaciones (aparece en el M06), que el autocompletado no ha leído.

El autocompletado no busca la respuesta: continúa el texto con lo más probable a partir de las líneas cercanas. Si el comentario sugiere una regla, la inventa.

### 2. El chat solo ve lo que se le da

En un chat sin ficheros adjuntos se pregunta:

```text
En el proyecto, ¿cómo se calcula la comisión de plataforma de una entrada?
```

La respuesta suena segura: «un porcentaje configurable sobre el total del pedido, redondeado al final». Falla en los dos puntos importantes, porque el código la calcula por entrada y redondea por entrada. El chat no ha abierto `pricing.ts`: ha descrito cómo suele funcionar una tienda de entradas.

La misma pregunta citando el fichero (`@pricing.ts` en Cursor o Copilot) da la regla correcta y señala la línea del `Math.round`. Con el código delante, el chat sí acierta.

### 3. El agente lee el repositorio, ejecuta y cambia

En modo agente, la pregunta se convierte en una tarea:

```text
Explícame cómo se calcula la comisión de una entrada en el proyecto y compruébalo con un test.
```

El agente busca `commission` en el repositorio, abre `pricing.ts` y `test/pricing.test.ts` y ejecuta `npm test -w @telon/api`. Responde con la regla correcta, dónde está y la salida del test que lo confirma. Pero también propone un test nuevo y, si se le deja, toca dos ficheros más de los necesarios.

El agente acierta porque busca la respuesta en lugar de suponerla. El riesgo cambia de sitio: ya no inventa, pero puede hacer más de lo que se le ha pedido.

## Qué queda visto

| Forma | Qué tiene delante | Cómo se equivoca en el proyecto |
|-------|-------------------|---------------------------------|
| Autocompletado | El fichero y el cursor | Inventa una comisión mínima que no existe |
| Chat | Lo que se le pega o se le cita | Describe una comisión «sobre el total» sin haber leído el código |
| Agente | El repositorio, la terminal y los ficheros | Acierta, pero cambia más de lo pedido si no se le pone límite |

La calidad de la respuesta depende de lo que el asistente tiene delante. Lo que no ve, lo rellena con lo más habitual. Por eso, en todo el curso, una respuesta se acepta cuando se ha comprobado en el código o con un test.

En [01 — Entorno y primer chat](01-lab-entorno-y-primer-chat.md) arrancas el proyecto y el asistente en tu puesto, y haces tu primera pregunta comprobada. Se puede hacer sin haber seguido esta demostración.
