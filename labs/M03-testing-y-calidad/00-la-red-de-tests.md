# La red de tests

[← Página anterior](README.md) · [Siguiente página →](01-lab-tests-y-datos.md)

La devolución de entradas ya está en Telón, generada con contexto y con sus tests en verde. Esta demostración pide al asistente más tests de dos formas: a partir del código y a partir de la regla. Las dos baterías pasan por sitios distintos, y solo una encuentra el fallo.

## Punto de partida

- Telón en el estado `make init-m03`: devolución implementada (`services/api/src/refunds/`), `AGENTS.md` con las reglas y `npm test` en verde (26 tests).
- Asistente en modo agente, chat nuevo.

## Recorrido

> [!NOTE]
> El número exacto de tests generados cambia con el modelo. Lo que se repite es de dónde salen los valores esperados.

### 1. Tests a partir del código

El prompt:

```text
Genera tests completos para services/api/src/refunds/amounts.ts.
```

El asistente lee `calcRefundAmounts`, ve `Math.round((amount * ev.commission_bps) / 10_000)` y escribe tests que esperan exactamente eso: para F-12 y F-13 (7100 céntimos), una comisión revertida de `Math.round(7100 × 0,075) = 533`. Todos en verde. La batería copia el código: si el código está mal, el test está mal igual.

### 2. Tests a partir de la regla

El prompt cambia una frase:

```text
Genera tests para la devolución a partir de las reglas de negocio de AGENTS.md, no del
código. Calcula los valores esperados a mano a partir de la regla y explícalos en un comentario.
```

Ahora el asistente parte de «la comisión de una devolución es la suma de las de sus entradas, redondeadas por entrada»: 3550 × 7,5 % = 266,25 → 266 por butaca, 532 por las dos. El test sale en rojo:

```text
AssertionError: expected 533 to be 532
```

La implementación generada en el M02 calcula sobre el total. Con una sola entrada da lo mismo, por eso nadie lo vio.

### 3. Lo que no se ve en verde

Los 26 tests siguen en verde con otro fallo dentro: el correo de confirmación de la devolución llega tres veces. Ningún test unitario lo detecta porque ocurre entre el notifier, la base de datos y la cola. Se ve en Mailpit, y se depura con la traza en el lab 04.

## Qué queda visto

| Test que propone el asistente | Test que hace falta |
|-------------------------------|---------------------|
| Espera lo que devuelve el código | Espera lo que dice la regla, calculado a mano |
| Una entrada (redondeo invisible) | Dos entradas cuyo redondeo por entrada difiere del total |
| `send` se llama | Si el trabajo se reintenta, el correo sale una vez |

En [01 — Tests y datos](01-lab-tests-y-datos.md) generas la batería a partir de las reglas. Se puede hacer sin haber seguido esta demostración.
