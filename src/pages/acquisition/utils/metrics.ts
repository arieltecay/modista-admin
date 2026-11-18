export interface MetricHelp {
  formula: string;
  source: string;
  limits: string;
}

/** What each number means, where it comes from and what it cannot tell you. */
export const METRIC_HELP: Record<string, MetricHelp> = {
  visits: {
    formula: 'Visitas con consentimiento cuyo inicio cae dentro del rango.',
    source: 'Telemetría propia del sitio (visitas registradas).',
    limits: 'Solo incluye a quienes aceptaron el seguimiento; no incluye al resto de las visitas del sitio.',
  },
  visitors: {
    formula: 'Identificadores de visitante distintos entre las visitas medibles.',
    source: 'Telemetría propia del sitio.',
    limits: 'Es una persona-navegador, no una persona: quien cambia de dispositivo o borra datos cuenta de nuevo.',
  },
  attributableVisits: {
    formula: 'Visitas medibles cuyo canal se pudo clasificar (no "sin clasificar").',
    source: 'Clasificador de canal del servidor.',
    limits: 'Directo cuenta como canal conocido: significa que no había ninguna señal de origen.',
  },
  leads: {
    formula: 'Inscripciones creadas y vinculadas a las visitas de la cohorte dentro de la ventana; en modo período, las creadas en el rango.',
    source: 'Inscripciones registradas.',
    limits: 'Una inscripción sin consentimiento no tiene recorrido: se informa aparte, no dentro de ningún canal.',
  },
  purchases: {
    formula: 'Inscripciones con pago completo cuya fecha de pago cae dentro de la ventana o del rango.',
    source: 'Pagos registrados en las inscripciones.',
    limits: 'Un pago parcial no es una compra completa y se muestra aparte.',
  },
  partialPayments: {
    formula: 'Inscripciones que cobraron algo en la ventana o el rango sin completar la compra dentro de él.',
    source: 'Pagos registrados en las inscripciones.',
    limits: 'Depende de los pagos de ese momento, no del estado actual de la inscripción.',
  },
  revenue: {
    formula: 'Suma de los importes efectivamente cobrados dentro de la ventana o del rango.',
    source: 'Pagos registrados (no el precio de lista ni los eventos de compra).',
    limits: 'Las inscripciones antiguas sin historial usan el depósito o el precio si figuran pagadas.',
  },
  leadRate: {
    formula: 'leads de la cohorte / visitas de la cohorte.',
    source: 'Visitas medibles e inscripciones vinculadas.',
    limits: 'Solo existe en modo cohorte: el modo período mezcla fechas distintas y no calcula tasas. Los resultados recientes pueden seguir creciendo.',
  },
  purchaseRate: {
    formula: 'compras de la cohorte / visitas de la cohorte.',
    source: 'Visitas medibles y pagos registrados.',
    limits: 'Solo existe en modo cohorte. Una cohorte reciente todavía puede sumar compras dentro de su ventana.',
  },
  attributionCoverage: {
    formula: 'visitas con canal conocido / visitas medibles con consentimiento.',
    source: 'Clasificador de canal del servidor.',
    limits: 'Mide cuánto del tráfico observado se puede atribuir; no dice nada de quienes no dieron consentimiento.',
  },
  measurementCoverage: {
    formula: 'visitas con consentimiento / visitas totales de una fuente independiente.',
    source: 'Requiere una fuente externa (Cloudflare o logs) que todavía no está conectada.',
    limits: 'No disponible hasta conectar una fuente independiente: sin ella no se puede saber qué parte del sitio se mide.',
  },
};
