# tarifas — contexto para agentes

Tarifas de liquidación de cada promotor, en un formato de texto propio (`.tarifa`). Las mantiene el equipo comercial.
No hay código aquí: el único consumidor es `liquidaciones/liquidar.py` (función `leer_tarifa`).

## Gramática real (GRAMATICA.md está incompleta)

Una instrucción por línea; `#` es comentario; porcentajes con coma decimal (`7,5%`).

| Instrucción | Significado | ¿La aplica liquidar.py? |
|-------------|-------------|-------------------------|
| `PROMOTOR <id>` | A qué promotor de Telón aplica (`TN-FARO`). El fichero se elige por esta línea, no por el nombre | Sí |
| `COMISION <n>% POR ENTRADA` | Comisión general sobre el precio de cada entrada | Sí |
| `ZONA <zona> COMISION <n>%` | Comisión para una zona de butacas (`platea`, `anfiteatro`) | Sí |
| `MINIMO <euros> POR ENTRADA` | Comisión mínima por entrada | Sí (desde 2025-01) |
| `INVITACIONES SIN COMISION` | Entradas de precio 0 sin comisión | Sí |
| `DESDE <fecha> <instrucción>` | La instrucción aplica a partir de esa fecha | **No: se ignora** |

Sin `PROMOTOR` que coincida, se usa `promotores/_defecto.tarifa`.

## Consecuencia conocida

`sala-faro.tarifa` dice `DESDE 2025-01-01 ZONA anfiteatro COMISION 6%`, pero liquidaciones sigue aplicando el 5 % al anfiteatro. Está pendiente de decidir con comercial si se implementa `DESDE` o se reescribe la tarifa.

## No hacer

- No cambiar una tarifa sin el visto bueno de comercial: cambia lo que se paga a un promotor.
