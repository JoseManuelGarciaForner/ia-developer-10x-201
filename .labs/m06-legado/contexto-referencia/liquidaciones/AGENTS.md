# liquidaciones — contexto para agentes

Batch nocturno que calcula cuánto se paga a cada promotor por las ventas de un día. Python 3 sin dependencias, sin tests.
Antes de cambiar nada, lee también `../contexto-equipo/AGENTS.md` (contratos con Telón y con `tarifas`).

## Ejecutar

```bash
./exportar.sh 2026-10-02           # necesita psql y TELON_DB; deja datos/<día>/pedidos.csv y entradas.csv
python3 liquidar.py 2026-10-02     # lee datos/<día>/ y ../tarifas/; escribe salida/<día>.csv
```

`datos/2026-10-02/` trae un día de ejemplo para probar sin base de datos.

## Cómo funciona (comprobado; el README no es fiable)

- **No usa la comisión que guarda Telón.** La recalcula con la tarifa de cada promotor, leída de `../tarifas/promotores/*.tarifa` (ruta relativa: `tarifas` tiene que estar clonado al lado).
- `exportar.sh` lee directamente `orders`, `tickets` y `seats` de Telón. Exporta las entradas de pedidos pagados **sin mirar el estado de la entrada**.
- A pagar = ventas − comisión, por promotor.
- `round()` de Python redondea al par (`round(266.5) == 266`); Telón usa `Math.round` (267). Pueden diferir en un céntimo.
- El parser de tarifas (`leer_tarifa`) entiende `COMISION`, `ZONA`, `MINIMO` e `INVITACIONES`. **Ignora en silencio** cualquier otra instrucción, incluida `DESDE`.

## Convenciones del repo

- Nombres en español, funciones sueltas, `csv.DictReader`. Importes en céntimos (enteros) salvo al imprimir.

## No hacer

- No cambiar el formato de `salida/<día>.csv`: lo importa contabilidad.
- No editar las tarifas desde aquí: son del equipo comercial (repo `tarifas`).
