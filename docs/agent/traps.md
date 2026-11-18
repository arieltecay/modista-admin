# Traps

- `npm run lint` ahora corre (antes fallaba por falta de `eslint.config.js`). Las reglas heredadas (`no-unused-vars`, `no-useless-escape`, `no-empty`) están como `warn` por deuda previa (147 avisos); el código nuevo debe quedar en 0. Evidencia: `eslint.config.js`.
- Los tests corren con Vitest + jsdom (`npm test`); el setup está en `src/test/setup.ts`. `vite.config.ts` importa `defineConfig` de `vitest/config`.
- Rangos y zona horaria: el panel manda días locales (`from`/`to`) y la zona; el servidor los convierte a `[from, to)` UTC. No armar límites UTC en el cliente. Evidencia: `src/pages/acquisition/utils/filters.ts`.
- Cada reporte carga y falla por separado (`useReport`): error ≠ vacío ≠ cargando ≠ datos viejos. Un refresh fallido conserva los datos marcados como obsoletos; nuevos filtros los descartan. Las respuestas de pedidos reemplazados se ignoran.
- El polling de "Actividad reciente" (15 s) se pausa con la pestaña oculta y refresca al volver. Evidencia: `src/pages/acquisition/hooks/useLiveAcquisition.ts`.
- Campaña, fuente y medio vienen de la URL del visitante: renderizarlos siempre como texto, nunca como HTML. Los IDs de visita se muestran abreviados (8 caracteres) y el `visitorId` nunca llega al panel.
