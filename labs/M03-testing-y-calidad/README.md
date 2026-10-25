# M03 — Testing y calidad asistida por IA

[← Página anterior](../M02-generacion-de-codigo/03-lab-explicar-y-refactorizar.md) · [Siguiente página →](00-la-red-de-tests.md)

El asistente genera tests rápido. Muchos comprueban lo que el código ya hace, no lo que debería hacer. En Telón, la batería generada pasa en verde y no detecta que, cuando la cola reintenta el trabajo, la compradora de `PED-2026-0107` recibe dos correos de confirmación de la devolución.

## Qué aprenderás

- Generar pruebas unitarias y funcionales a partir de la regla, no del código.
- Pedir datos de prueba y mocks de la pasarela de pago y del proveedor de email.
- Automatizar comprobaciones de QA repetitivas.
- Encontrar el caso límite que la primera generación no propuso.
- Depurar con el asistente a partir de una traza y un test en rojo.
- Valorar la calidad y la mantenibilidad del código generado.

## Teoría

| Test que el asistente propone | Test que hace falta |
|-------------------------------|---------------------|
| La suma de entradas da el total | La comisión se redondea por entrada, no sobre el total |
| Crear la devolución devuelve un objeto | No se reembolsan los gastos, el pedido no cambia y el QR deja de validar |
| El correo se envía | Si el trabajo de la cola se reintenta, el correo sale una sola vez |

Para depurar con el asistente le das la traza completa, el test que falla y el fichero implicado. Le pides la causa antes que el arreglo, y el arreglo es el diff más pequeño que deja el test en verde.

## Qué dejas hecho

1. **Batería de tests de importes y de la devolución** con datos generados (butaca, pase de pie y VIP).
2. **Mocks de la pasarela y del proveedor de email** para probar la devolución sin servicios externos.
3. **El redondeo de la comisión**, que falla, y su corrección.
4. **El correo duplicado** reproducido en Mailpit, explicado y corregido desde la traza.

## Páginas

<!-- gen:paginas -->
| # | Página | Qué hay |
|---|--------|---------|
| 00 | [La red de tests](00-la-red-de-tests.md) | Demostración: tests desde el código frente a tests desde la regla |
| 01 | [Laboratorio: tests y datos](01-lab-tests-y-datos.md) | Datos del seed, tests desde `AGENTS.md` y el céntimo que no cuadra |
| 02 | [Laboratorio: mocks](02-lab-mocks.md) | Pasarela, base de datos y proveedor simulados en su frontera; el reintento de la cola en un test |
| 03 | [Laboratorio: el caso límite del redondeo](03-lab-caso-limite-redondeo.md) | Precios que lo provocan, test con tabla y arreglo en un solo sitio |
| 04 | [Laboratorio: el correo que llegaba tres veces](04-lab-debugging-correo-duplicado.md) | Traza, causa antes que arreglo, idempotencia y comprobación en Mailpit |

→ Empieza por **[00 — La red de tests](00-la-red-de-tests.md)**.
<!-- /gen:paginas -->
