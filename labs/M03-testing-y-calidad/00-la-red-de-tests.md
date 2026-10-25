# La red de tests

[← Página anterior](README.md) · [Siguiente página →](01-lab-tests-y-datos.md)

Pedirle tests al asistente es fácil y rápido, y casi siempre salen en verde. La cuestión es si esos tests protegen de algo. En el proyecto Telón, la devolución de entradas ya está implementada y tiene sus tests en verde, pero esconde un céntimo de más en la comisión. Esta demostración pide más tests de dos maneras, a partir del código y a partir de la regla de negocio, y mira cuál de las dos lo encuentra.

## Punto de partida

- El proyecto Telón en el estado `make init-m03`: devolución implementada (`services/api/src/refunds/`), `AGENTS.md` con las reglas y `npm test` en verde (26 tests).
- Asistente en modo agente, con un chat nuevo.
- El caso que se usa para comparar: Ana devuelve las butacas F-12 y F-13 del pedido `PED-2026-0107`, de 35,50 € cada una, con una comisión del 7,5 %.
- El valor correcto, calculado a mano con la regla «la comisión revertida es la suma de la de cada entrada, redondeada por entrada»: 3550 × 7,5 % = 266,25, que se redondea a 266 por butaca, **532 céntimos** en total.

> [!NOTE]
> El número exacto de tests generados cambia con el modelo. Lo que se repite es de dónde sale el valor esperado de cada test.

## Recorrido

### 1. Tests a partir del código: confirman lo que hay

El prompt:

```text
Genera tests completos para services/api/src/refunds/amounts.ts.
```

El asistente lee `calcRefundAmounts`, ve `Math.round((amount * ev.commission_bps) / 10_000)` y escribe tests que esperan justo eso. Para F-12 y F-13 (7100 céntimos en total) espera `Math.round(7100 × 0,075) = 533`. Todos salen en verde.

El valor esperado ha salido del propio código. Si el código está mal, el test está mal de la misma forma, y por eso pasa: el test comprueba que el código hace lo que hace.

### 2. Tests a partir de la regla: comprueban lo que debería hacer

El prompt cambia el origen de los valores esperados:

```text
Genera tests para la devolución a partir de las reglas de negocio de AGENTS.md, no del
código. Calcula los valores esperados a mano a partir de la regla y explícalos en un comentario.
```

Ahora el asistente parte de la regla y calcula 266 + 266 = 532. El test sale en rojo:

```text
AssertionError: expected 533 to be 532
```

La implementación calcula la comisión sobre el total de las entradas, no por entrada. Con una sola entrada los dos cálculos dan lo mismo, y por eso nadie lo vio. Con dos butacas de 35,50 € el redondeo se separa un céntimo.

### 3. Lo que ningún test unitario ve

Con los mismos 26 tests en verde hay otro fallo: el correo de confirmación de la devolución llega tres veces.

![Tres correos de la misma devolución en Mailpit](../img/M03-04-mailpit-tres-correos.png)

Ningún test unitario lo detecta, porque el fallo aparece en la combinación de notifier, base de datos y cola: el registro del envío falla después de mandar el correo y la cola reintenta. Se ve en Mailpit y se depura con la traza.

## Qué queda visto

| Tests que propone el asistente | Tests que hacen falta |
|--------------------------------|-----------------------|
| Esperan lo que devuelve el código | Esperan lo que dice la regla, calculado a mano |
| Usan una sola entrada, donde el redondeo no se nota | Usan dos entradas cuyo redondeo por entrada difiere del total |
| Comprueban que se llama a `send` | Comprueban que, si el trabajo se reintenta, el correo sale una vez |

Unos tests en verde solo dicen que el test y el código están de acuerdo. Para que encuentren fallos, el valor esperado tiene que salir de la regla de negocio, no del código que se quiere probar.

En [01 — Tests y datos](01-lab-tests-y-datos.md) generas la batería a partir de las reglas, y en [04 — El correo que llegaba tres veces](04-lab-debugging-correo-duplicado.md) depuras el correo duplicado. Los dos se pueden hacer sin haber seguido esta demostración.
