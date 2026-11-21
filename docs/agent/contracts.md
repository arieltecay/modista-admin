# Contratos

- Consume `GET /api/admin/acquisition/{overview,channels,funnel,quality,live,journeys,journeys/:visitId}` (solo admin). Los tipos del contrato están en `src/pages/acquisition/services/types.ts` y se mantienen a mano: si la API cambia, actualizar ahí y en `testing/fixtures.ts`.
- Modo `acquisition_cohort`: las tasas visita→lead/compra existen; en `event_period` llegan `null` y el panel muestra "No aplica". `totalSiteVisits` y `measurementCoverage` son `null` hasta conectar una fuente independiente: el panel nunca llama "tráfico total" a las visitas con consentimiento.
- Instrucciones del bot: campos `instagramAutoReply`, `instagramKeywords` (frases) e `instagramEnrollmentLookup`. Sin frase activa Instagram no responde; el tipo vive en `src/pages/bot-message/types/index.ts` y se mantiene a mano con la API.
- `GET|PUT /api/chat/enrollment-config`: `{ whatsappLookupEnabled, templates, defaults }`. Las reglas de `fields.ts` (solo `{curso}`, líneas por estado con `{curso}`, máx. 500) duplican las de la API: si cambian allí, actualizar ahí. Evidencia: `src/services/bot-enrollment/`.
- El PUT envía solo los textos que difieren de `defaults` (recortados): lo omitido vuelve al original del servidor, así "Restaurar" no fija textos viejos. Evidencia: `customizedTemplates` en `fields.ts`.
