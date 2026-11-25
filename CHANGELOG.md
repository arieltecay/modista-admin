# Changelog

## [Unreleased]
- Mensajes, Adquisición y Cuponera ya no se desplazan hacia los costados en celular; sus tablas se ven como tarjetas.
- Mensajes permite configurar frases y respuesta fija de WhatsApp para orientar consultas de acceso sin pasar por Mila.
- Agrega "Cuponera": crear cupones, ver el historial con su estado y las estadísticas de cada cupón (usos, descuento otorgado, ingreso neto, usos por día).
- Respuestas automáticas: una regla puede enviar en Instagram una respuesta fija, tal cual y sin Gemini, y combinarla con la consulta de inscripciones; las reglas existentes siguen con Mila redactando.
- Rediseña "Mensajes": Bandeja con búsqueda, reglas de respuesta automática explicadas por canal, plantillas y confirmaciones accesibles, usable en celular. Mismas llamadas al API.
- Mensajes: pruebas de página y en navegador (escritorio y móvil) que fijan el comportamiento actual, más revisión multiagente en `.ai-review/`.
- Agrega "Facturas": listado con filtros, ver/imprimir, reenviar el mail y reintentar las pendientes o con error.
- Entrenamiento del bot: cada bloque puede responder comentarios públicos de Instagram por mensaje privado (apagado por defecto); Conversaciones distingue comentarios y respuestas privadas.
- Nueva pestaña "Inscripciones" en Mila AI: interruptor de WhatsApp, textos editables con vista previa y restaurar originales.
- Entrenamiento del bot: cada bloque puede activarse para Instagram con frases y consulta de inscripciones.
- Agrega el tablero "Adquisición y conversión" con resumen, canales, embudo, actividad reciente, calidad de datos y recorridos.
- Repara ESLint y agrega Vitest con Testing Library para poder verificar el panel.
- El dashboard distingue pagos confirmados, campañas UTM registradas, mensajería de WhatsApp y eventos observados del sitio.
