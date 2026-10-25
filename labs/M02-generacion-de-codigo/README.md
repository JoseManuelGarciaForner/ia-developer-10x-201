# M02 — Asistentes de IA y generación de código

[← Página anterior](../M01-ia-aplicada-al-desarrollo/02-lab-leer-la-peticion.md) · [Siguiente página →](00-contexto-cambia-el-diff.md)

La devolución de `PED-2026-0107` sale distinta según lo que sepa el asistente. Sin contexto, borra las entradas del pedido y devuelve el total, gastos incluidos. Con las reglas del proyecto, crea un movimiento que referencia el pedido, revoca los QR, libera las butacas F-12 y F-13 y deja fuera los gastos de gestión.

## Qué aprenderás

- Escribir las reglas del proyecto para que el asistente las aplique sin repetirlas en cada chat.
- Pedir código con intención, restricciones, ejemplo y criterio de hecho.
- Generar estructuras y componentes nuevos que encajan con los existentes.
- Pedir que te explique código existente y comprobar la explicación.
- Refactorizar con el asistente sin cambiar el comportamiento.
- Revisar un diff generado antes de aceptarlo.

## Teoría

Las piezas que cambian el diff:

| Pieza | En Telón |
|-------|-----------------------|
| Intención | Devolver una o varias entradas de un pedido pagado |
| Restricción | El pedido no se modifica; los gastos de gestión no se reembolsan; hasta 48 h antes del evento |
| Ejemplo | Devolver la butaca F-13 de `PED-2026-0107` |
| Criterio de hecho | Los tests de importes pasan, el pedido sigue igual y F-13 vuelve a estar libre en el `SeatPicker` |

Dónde vive el contexto:

| Fichero | Para qué |
|---------|----------|
| `AGENTS.md` | Stack, convenciones, reglas de negocio y cómo se arranca y se prueba. Lo leen Cursor, Copilot y Claude Code |
| `.cursor/rules/`, `.github/copilot-instructions.md`, `CLAUDE.md` | Lo propio de cada herramienta, que apunta a `AGENTS.md` |
| Ficheros citados en el chat | El modelo, el componente y el test entran aunque no estén abiertos |

Al revisar un diff generado conviene mirar: imports que no existen, nombres que no siguen la convención, lógica duplicada en lugar de reutilizada y tests que cambian para pasar.

## Qué dejas hecho

1. **Reglas del proyecto** con el stack, las convenciones y las reglas de devolución. Un chat nuevo las aplica.
2. **La devolución generada con contexto**: modelo y endpoint en la API, y el componente del área del comprador con los componentes troncales. Se compara con el diff que salió sin reglas.
3. **El cálculo de importes (precio, comisión y gastos) explicado y refactorizado**, con los tests en verde antes y después.

## Páginas

| # | Página | Qué hay |
|---|--------|---------|
| 00 | [El contexto cambia el diff](00-contexto-cambia-el-diff.md) | Demostración: el mismo prompt de DEV-412 sin reglas y con reglas |
| 01 | [Laboratorio: reglas del proyecto](01-lab-reglas-del-proyecto.md) | `AGENTS.md` con el asistente, comprobado línea a línea, y un fichero por herramienta |
| 02 | [Laboratorio: generar la devolución](02-lab-generar-devolucion.md) | Plan, API, correo y componente en entregas revisadas; la devolución funcionando de punta a punta |
| 03 | [Laboratorio: explicar y refactorizar](03-lab-explicar-y-refactorizar.md) | El cálculo de importes explicado, con tests de caracterización y refactorizado sin cambiar un céntimo |

→ Empieza por **[00 — El contexto cambia el diff](00-contexto-cambia-el-diff.md)**.
