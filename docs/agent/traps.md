# Traps

- `npm run lint` ahora corre (antes fallaba por falta de `eslint.config.js`). Las reglas heredadas (`no-unused-vars`, `no-useless-escape`, `no-empty`) están como `warn` por deuda previa (147 avisos); el código nuevo debe quedar en 0. Evidencia: `eslint.config.js`.
- Los tests corren con Vitest + jsdom (`npm test`); el setup está en `src/test/setup.ts`. `vite.config.ts` importa `defineConfig` de `vitest/config`.
- Rangos y zona horaria: el panel manda días locales (`from`/`to`) y la zona; el servidor los convierte a `[from, to)` UTC. No armar límites UTC en el cliente. Evidencia: `src/pages/acquisition/utils/filters.ts`.
- Cada reporte carga y falla por separado (`useReport`): error ≠ vacío ≠ cargando ≠ datos viejos. Un refresh fallido conserva los datos marcados como obsoletos; nuevos filtros los descartan. Las respuestas de pedidos reemplazados se ignoran.
- El polling de "Actividad reciente" (15 s) se pausa con la pestaña oculta y refresca al volver. Evidencia: `src/pages/acquisition/hooks/useLiveAcquisition.ts`.
- Campaña, fuente y medio vienen de la URL del visitante: renderizarlos siempre como texto, nunca como HTML. Los IDs de visita se muestran abreviados (8 caracteres) y el `visitorId` nunca llega al panel.
- El API responde 400 si el rango supera 92 días o el año sale de 1900–2100, o si `channel` no es un canal real: `parseFilters`/`applyPatch` ya lo impiden (los selectores de fecha acotan el otro extremo). Evidencia: `src/pages/acquisition/utils/filters.ts`.
- `useReport(load, key, enabled, scope)`: un `scope` nuevo (filtros) descarta los datos; una `key` nueva dentro del mismo scope (otra página, otra ventana en vivo) los conserva mientras carga, para no perder foco ni scroll. Reintentar sin datos es una carga completa, no una tarjeta en blanco.
- Los estados "vacío" tienen en cuenta las conversiones sin recorrido enlazable: sin canales pero con `unlinked` se muestra la tabla. El refresco periódico de "Actividad reciente" no cuenta como refresco del usuario.
- Un comentario aparece en el chat de quien comenta, pero el admin no puede responderle manualmente hasta que escriba un DM (el comentario no abre la ventana de mensajería). Evidencia: `api/docs/agent/traps.md`.
