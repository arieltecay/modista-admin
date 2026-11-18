# Arquitectura

- `src/pages/acquisition/`: tablero "Adquisición y conversión" (`/admin/acquisition`, carga diferida). `AcquisitionPage` orquesta; `components/<Nombre>/{index.tsx,types.ts}` son presentacionales y reciben datos por props con tipos propios; `hooks/` (`useReport`, `useAcquisitionReports`, `useLiveAcquisition`), `services/` (cliente HTTP + tipos del contrato) y `utils/` (filtros ↔ URL, formato, etiquetas, ayuda de métricas).
- Los filtros viven en la query string (`utils/filters.ts`): una vista se comparte copiando la URL; lo inválido cae al valor por defecto.
