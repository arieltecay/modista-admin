# Revisión: red de seguridad de Mensajes (PR 1)

Rama `test/bot-message-safety-net` sobre `origin/main` (fb55144). Sin cambios de producción.

## Ronda 1: agentes 01–05

| # | Hallazgo | Severidad | Agentes | Estado |
|---|---|---|---|---|
| 1 | El API falso respondía `{}` a cualquier ruta: una llamada nueva no fallaba | ALTO | 01, 02, 04 | Corregido: 404 + `api.unexpected`, query string incluido, `afterEach` exige vacío. Mutación `/chat?limit=20` detectada. |
| 2 | Rutas HTTP de la mayoría de las acciones sin fijar | MEDIO | 01 | Corregido: 16 tests de contrato en `src/services/*.test.ts`. |
| 3 | El guard dejaba pasar cualquier puerto local; `reuseExistingServer` podía usar el API real | MEDIO | 02, 03 | Corregido: solo el origen del dev server; `reuseExistingServer: false`; `context.route`; WebSocket cerrado; service workers bloqueados. |
| 4 | Aserción de borrado atada al tag `div` | MEDIO | 01, 05 | Corregido: cuenta de ocurrencias. |
| 5 | Payload de edición con `objectContaining` | MEDIO | 01 | Corregido: payload exacto. |
| 6 | Polling fuera de la bandeja y al desmontar sin fijar | MEDIO | 01 | Corregido: 2 tests. |
| 7 | Efectos colaterales (recarga de lista, toasts, cierre de modal, deselección al filtrar) | MEDIO | 01 | Corregido. |
| 8 | Sin aserción "no muestra entregado/leído" | MEDIO | 01 | Corregido. |
| 9 | Doble envío, borrador en blanco, borrador sin recortar | MEDIO | 02 | Corregido: 3 tests. |
| 10 | Ids largos (truncado) sin cubrir | MEDIO | 02 | Corregido. |
| 11 | Carreras al cambiar de chat; chat sin `_id` | MEDIO/BAJO | 02 | Documentado: 3 `it.todo` + traps. Se corrige en PR 2. |
| 12 | Fixtures duplicados unit/e2e | MEDIO | 05 | Corregido: `src/test/fixtures/botMessage.ts`. |
| 13 | e2e fuera de typecheck | MEDIO | 04, 05 | Corregido: `tsconfig.e2e.json` corre primero en `npm run typecheck`. |
| 14 | Ramas de error sin cubrir (plantillas, conversación, instrucciones) | BAJO | 01 | Corregido. |
| 15 | Selectores frágiles (`.group`, posición, `md:hidden`) y `getByTitle` | MEDIO/BAJO | 05 | `getByRole` donde hay nombre; el resto marcado `TEMP` y listado en la guía. |
| 16 | Script aceptaba opciones de git como base; no listaba archivos nuevos | BAJO | 02, 03 | Corregido y verificado (`--output=...` → exit 2). |
| 17 | Evidencia de traps sobre `status` no verificable | BAJO | 04 | Corregido: cita modelo y webhook del API. |
| 18 | Dos copias de `.ai-review` | BAJO | 04 | Documentado en README: esta es la canónica. |
| 19 | Subagentes "solo lectura" con Bash | BAJO | 03 | Documentado. Restringir permisos queda a decisión del usuario. |
| 20 | Constante importada desde `playwright.config.ts` | BAJO | 04 | Corregido: `e2e/support/origins.ts`. |

Hallazgos nuevos al corregir: el panel carga Google Fonts y una imagen de GitHub (abortados en e2e, anotados para PR 2).

Precisiones tras el gate final: en #3 el WebSocket se cierra a nivel de página (HTTP sí a nivel de contexto); en #11 hay 3 `it.todo` de carreras y 8 en total (5 página, 2 entrenamiento, 1 plantillas).

## Ronda 2: agente 06 (gate final)

Decisión: **APROBAR CON PENDIENTES**. Pendientes resueltos:

| Hallazgo | Severidad | Estado |
|---|---|---|
| `POST /faq` ("Entrenar Mila") sin contrato HTTP | MEDIO | Corregido: `src/services/faq/faqService.test.ts` (17 de contrato). |
| "Nunca entregado/leído" no cubría salientes ni nombre accesible | MEDIO | Corregido: fixtures salientes `delivered`/`read`; aserción por texto, title y label. |
| Spec de capturas no exigía API limpio | BAJO | Corregido. |
| Doble envío sin prueba de mutación | no verificado | Verificado: sin `disabled` el test falla. |

## Discrepancias aceptadas

- CHANGELOG sin ticket: el repo no usa tickets en ninguna entrada.
- `npm run typecheck` falla por 52 errores previos en `src`; ninguno nuevo.
- `markAllAsRead` con `modifiedCount: 0` dice "Todos los mensajes…": fijado como está, a decidir en PR 2.
