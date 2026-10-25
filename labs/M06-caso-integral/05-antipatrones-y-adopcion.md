# Antipatrones y adopción

[← Página anterior](04-lab-dev2-sin-memoria.md)

A lo largo del curso, la devolución de entradas del proyecto Telón ha pasado por todas las fases: petición, código, tests, documentación, pull request, CI y, al final, los repositorios heredados que nadie había contextualizado. Esta página recoge lo que salió mal cada vez que se usó el asistente sin criterio, y cómo llevarlo a tu equipo sin empezar por lo más difícil.

## Lo que salió mal en el proyecto Telón

| Antipatrón | Dónde pasó en el curso | Alternativa |
|------------|------------------------|-------------|
| Aceptar en bloque | El primer plan de DEV-412 modificaba el pedido pagado y devolvía los gastos (M02) | Plan primero, entregas pequeñas, cada diff revisado |
| Creerse el README | Puerto 8080, `npm run seed`, «usa la comisión del proyecto Telón», `/api/v0/widget` (M01, M04, M06) | Cada afirmación se comprueba ejecutando o en el código |
| Tests que copian el código | La comisión revertida «en verde» con un céntimo de más (M03) | Valores esperados calculados desde la regla |
| El arreglo más pequeño | Ampliar una columna para que dejaran de llegar tres correos (M03) | Arreglar la familia de fallos (idempotencia) |
| Contexto en el chat | Lo que descubrió `dev1` no llegaba a `dev2` hasta que se versionó (M06) | `AGENTS.md` por repo y uno común, por pull request |
| Un contexto gigante | — | Uno por repo, corto y comprobado, y otro con los contratos |
| Agente sin límites | Un workflow en una carpeta que GitHub no lee; un agente con `git push` libre (M05) | Comandos permitidos y prohibidos; revisar dónde deja cada fichero |
| Secretos al alcance | La API key de SendGrid del Teatro Lumen devuelta en claro (M05) | Revisión de seguridad con lista concreta; nunca pegar claves reales |
| Medir líneas generadas | — | Medir tiempo de petición a PR fusionado e idas y vueltas en la revisión |

## Adopción progresiva

Ningún equipo pasa de cero a agentes autónomos en una semana. Un orden que funciona:

1. **Contexto antes que herramientas.** Un `AGENTS.md` corto y comprobado en el repositorio que más se toca. Sin eso, cualquier asistente adivina.
2. **El asistente como lector.** Explicar código, buscar dónde está una regla y auditar un README. Es donde menos riesgo hay, y el equipo aprende a comprobar.
3. **Tests y documentación.** Generar desde la regla, verificar ejecutando. Lo que se genera aquí protege lo que se genere después.
4. **Código en entregas revisadas.** Plan, diff acotado, comprobaciones. La CI valida; la persona firma.
5. **Agentes con permisos acotados** y prompts del equipo versionados. MCP solo de lectura al principio.
6. **Contexto entre repositorios**, cuando hay más de uno y se rompen contratos que nadie había escrito.

## Ejercicio de cierre

**Acción:** escribe, para tu equipo real (no para el proyecto Telón), tres pasos de adopción con este formato y guárdalos en `workspace/m06/dev1/contexto-equipo/ADOPCION.md`:

```markdown
### Paso 1 — [qué]
- Repositorio o equipo donde empezaría: …
- Qué fichero o práctica se crea: …
- Cómo sabremos que funciona (algo que se pueda medir o comprobar): …
- Qué no haremos todavía: …
```

**Por qué:** lo que se lleva cada uno del curso son decisiones concretas para su contexto, no la lista general de arriba.

**Resultado esperado:** tres pasos, cada uno con un criterio comprobable. Por ejemplo: «el próximo PR de ese repo lo genera un chat nuevo sin que haya que explicarle cómo se ejecutan los tests».

## Comprueba tu entendimiento

**Un antipatrón en tu propio trabajo**
Repasa tus commits del curso (`git log --oneline` en tu fork y en `workspace/m06/dev2`) y busca uno que hiciste aceptando algo del asistente sin comprobarlo.
→ Sabes señalar qué comprobación faltó y en qué paso habría ido.

→ **[Volver al inicio](../../README.md)**
