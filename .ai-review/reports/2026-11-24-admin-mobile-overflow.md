# Scroll lateral en celular (PR #12)

Revisión: 01 a 06, más una revisión previa independiente. Sin hallazgos críticos ni altos.

- **Corregido:** reapertura de la ayuda por foco y primer toque tapado; X del modal fuera de pantalla y sin nombre; títulos y errores de cupón sin espacios; ayuda fuera de su tarjeta o sobre su botón; roles de tablas; el API falso aceptaba parámetros nuevos.
- **Tests (01):** huecos de roles, etiquetas, orden, escritorio, tablet e InfoTip cerrados y comprobados con mutaciones.
- **Aceptado (bajo):** en celular el panel de ayuda puede tapar otro botón y pedir un toque extra; el API falso no valida valores de parámetros; `grid-cols-1` (TrainingTab) y `break-words` (RuleCard) son protecciones redundantes.
- **No verificado:** Safari/iOS, lector de pantalla real, `npm audit`.
