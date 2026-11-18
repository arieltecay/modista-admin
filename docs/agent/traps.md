# Traps

- `npm run lint` ahora corre (antes fallaba por falta de `eslint.config.js`). Las reglas heredadas (`no-unused-vars`, `no-useless-escape`, `no-empty`) están como `warn` por deuda previa (147 avisos); el código nuevo debe quedar en 0. Evidencia: `eslint.config.js`.
- Los tests corren con Vitest + jsdom (`npm test`); el setup está en `src/test/setup.ts`. `vite.config.ts` importa `defineConfig` de `vitest/config`.
