# El legado

[← Página anterior](README.md) · [Siguiente página →](01-remotos-y-dos-desarrolladores.md)

El proyecto Telón no termina en el monorepo. Alrededor hay cuatro repositorios que escribieron otras personas, en otros años y con otras costumbres. Ninguno tiene contexto para la IA, y algunos tienen documentación que miente. Este módulo trabaja sobre ellos en equipo, con dos desarrolladores que no comparten conversación.

## Los repositorios

| Repo | Qué es | Quién lo escribió |
|------|--------|-------------------|
| `control-acceso` | El servicio que usan los lectores de QR en la puerta de la sala | Pablo, 2023–2024 |
| `liquidaciones` | El batch nocturno que calcula cuánto se paga a cada promotor | Lucía, 2022–2025 |
| `tarifas` | Las tarifas de liquidación de cada promotor, en un formato propio (`.tarifa`) | Equipo comercial |
| `widget-embebido` | El widget antiguo que algunos promotores pegan en su web | Una agencia externa |
| `contexto-equipo` | Vacío. Ahí debería estar lo que une a los demás | — |

Lo que se sabe de ellos antes de abrirlos:
- cada uno sigue sus propias convenciones (JavaScript sin tipos con callbacks, Python con nombres en español, un formato de texto propio);
- los README no siempre dicen la verdad;
- no hay tests;
- algunos dependen de otros, o del proyecto Telón, de formas que no aparecen en ningún `package.json`;
- el formato de las tarifas no lo conoce ningún modelo: no está en internet.

## La petición

> **DEV-430 — Las devoluciones fuera del monorepo**
> Desde que existe la devolución de entradas (DEV-412):
> 1. En la puerta de la Sala Faro entró alguien con una entrada devuelta.
> 2. Liquidaciones pagó a la Sala Faro las entradas devueltas como si se hubieran vendido.
>
> Que una entrada devuelta no entre, y que no se liquide.

## Cómo se trabaja

Haces de dos personas del mismo equipo:
- **`dev1`** llega primero. Explora los repositorios con el asistente, comprueba lo que le cuenta y deja el contexto escrito en cada repositorio y en `contexto-equipo`. No toca código.
- **`dev2`** llega después, con un chat nuevo y sin acceso a nada de lo que habló `dev1`. Resuelve DEV-430 usando solo lo que quedó versionado.

Cada uno tiene su clon de los repositorios, y se comunican por los remotos, como un equipo real. Cómo se montan está en [01 — Remotos y dos desarrolladores](01-remotos-y-dos-desarrolladores.md).

## Qué se pide al final

1. Contexto de cada repositorio, validado contra el código.
2. Un contexto general con los contratos entre repositorios y con el proyecto Telón.
3. Una dinámica de equipo escrita: qué va al repositorio, qué no y cómo entra un cambio de contexto.
4. DEV-430 resuelto por `dev2`, comparado con el mismo intento sin contexto.
5. Tres pasos de adopción que llevarías a tu equipo.
