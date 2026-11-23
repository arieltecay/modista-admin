# Arquitectura

- `src/pages/acquisition/`: tablero "Adquisición y conversión" (`/admin/acquisition`, carga diferida). `AcquisitionPage` orquesta; `components/<Nombre>/{index.tsx,types.ts}` son presentacionales y reciben datos por props con tipos propios; `hooks/` (`useReport`, `useAcquisitionReports`, `useLiveAcquisition`), `services/` (cliente HTTP + tipos del contrato) y `utils/` (filtros ↔ URL, formato, etiquetas, ayuda de métricas).
- Los filtros viven en la query string (`utils/filters.ts`): una vista se comparte copiando la URL; lo inválido cae al valor por defecto.
- `src/pages/bot-message/`: `InstructionModal` define canal Instagram, frases y consulta de inscripciones; `InstructionCard` muestra la regla.
- `tabs/EnrollmentTab` + `components/EnrollmentSettings/` (en `src/pages/bot-message/`): pestaña "Inscripciones"; el formulario es presentacional con tipos propios y las reglas de validación viven en `fields.ts`.
- Pruebas: Vitest + RTL junto al código (`*.test.tsx`, servicios simulados); Playwright en `e2e/` (escritorio y móvil) contra el API falso de `e2e/support/mockApi.ts`, que corta toda salida a internet. Capturas: `SCREENSHOTS=<carpeta> npm run test:e2e -- screenshots` → `docs/screens/<carpeta>/`.
- Revisión multiagente: `.ai-review/` (roles + protocolo) y `.claude/agents/ai-review-*` (subagentes de solo lectura). Ver `.ai-review/README.md`.
- `src/pages/invoices/`: "Facturas" (`/admin/invoices`). `InvoicesListPage` orquesta filtros, paginación y acciones; `useInvoices` carga; `components/InvoicesTable` y `InvoiceStatusBadge` son presentacionales con tipos propios. "Ver / Imprimir" abre la página pública de `modista-app`; el admin no dibuja la factura.
