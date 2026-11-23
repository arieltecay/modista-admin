# Revisión: respuestas fijas en Instagram (api #12 + admin #9)

Agentes: 01 pruebas, 02 adversarial, 03 seguridad (solo lectura, sobre `git diff origin/main` de ambos repos), tras el ajuste "fija + consulta de inscripciones en la misma regla".

| Hallazgo | Agentes | Estado |
|---|---|---|
| MEDIO: la respuesta privada a comentarios recortaba con `.slice(0, 900)` (UTF-16) y partía emojis de un texto fijo válido | 01, 02, 03 | Corregido: el fijo sale entero; lo generado se recorta por code points. Tests con emojis en el borde. |
| MEDIO: un número sin email ("cuesta 150.000 - 200.000") se tomaba como dato de contacto y tapaba el texto fijo | 02 | Corregido: hace falta un email en el mensaje o en los recientes. Tests en servicio y flujo. |
| MEDIO/BAJO: tras una pregunta de inscripción, la misma persona sigue recibiendo el pedido de datos 10 min | 01, 02 | Aceptado y fijado con test; documentado en `api/docs/agent/traps.md`. |
| BAJO: aserción débil del pedido de datos | 01 | Corregido (`askContact` exacto). |
| BAJO: desempate por `_id` sin test | 01 | Test agregado (ids insertados al revés). |
| BAJO: `PUT` lee y escribe en dos pasos | 02 | Aceptado: una fija sin texto se ignora en ejecución; documentado. |
| Seguridad (rutas admin, Zod, NoSQL, XSS, logs, datos de inscripción, prompt de Gemini) | 03 | Sin hallazgos. |

## Segunda ronda: checklist del usuario

- Hueco encontrado al contrastar: sin respuesta fija, Gemini recibía todas las reglas coincidentes, también las fijas (p. ej. una fija sin texto). Corregido con `geminiRulesOf` en DM y comentarios; sin reglas de Gemini no hay respuesta ni se gasta el tope de comentarios.
- Tests de punta a punta por cada caso del checklist: pregunta común → fijo; inscripción identificada → estado; sin datos → pide datos (un solo mensaje); no encontrada → `notFound`; varias reglas → una respuesta y prioridad; regla vieja → Gemini; comentario con datos de inscripción → una respuesta privada fija, sin datos. En todos se verifica si se llamó a Gemini.

Preexistente, fuera de alcance: si falla guardar el mensaje después de enviarlo, el reintento de Meta puede duplicar la respuesta; al desmarcar "responder en Instagram" la consulta de inscripciones queda guardada oculta.

No verificado: Meta real, Gemini real, admin contra la API real.
