# Contratos

- Consume `GET /api/admin/acquisition/{overview,channels,funnel,quality,live,journeys,journeys/:visitId}` (solo admin). Los tipos del contrato están en `src/pages/acquisition/services/types.ts` y se mantienen a mano: si la API cambia, actualizar ahí y en `testing/fixtures.ts`.
- Modo `acquisition_cohort`: las tasas visita→lead/compra existen; en `event_period` llegan `null` y el panel muestra "No aplica". `totalSiteVisits` y `measurementCoverage` son `null` hasta conectar una fuente independiente: el panel nunca llama "tráfico total" a las visitas con consentimiento.
