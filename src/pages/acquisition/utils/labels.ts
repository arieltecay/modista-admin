export const labelOf = (labels: Record<string, string>, key: string): string => labels[key] ?? key;

export const CHANNEL_LABELS: Record<string, string> = {
  meta_paid: 'Meta Ads',
  instagram_organic: 'Instagram orgánico',
  facebook_organic: 'Facebook orgánico',
  google_paid: 'Google Ads',
  google_organic: 'Google orgánico',
  whatsapp: 'WhatsApp',
  email: 'Email',
  referral: 'Referido',
  direct: 'Directo',
  other_paid: 'Otro pago',
  other_social: 'Otra red social',
  other_search: 'Otro buscador',
  unknown: 'Sin clasificar',
};

export const STEP_LABELS: Record<string, string> = {
  page_view: 'Vio una página',
  course_detail_view: 'Vio el curso',
  pricing_visible: 'Vio el precio',
  cta_click: 'Tocó el botón de inscripción',
  form_view: 'Vio el formulario',
  form_start: 'Empezó el formulario',
  form_submit: 'Envió el formulario',
  scroll_50: 'Bajó la mitad de la página',
  scroll_90: 'Llegó al final de la página',
  lead: 'Lead registrado',
  initiate_checkout: 'Inició el pago',
  redirect_to_payment: 'Fue a Mercado Pago',
  purchase: 'Compró',
};

export const FUNNEL_LABELS: Record<string, string> = { ...STEP_LABELS, visit: 'Visitas', lead: 'Dejó sus datos (lead)' };

export const journeyStepLabel = (step: string): string => (step === 'visit' ? 'Solo la visita' : labelOf(STEP_LABELS, step));

export const DEVICE_LABELS: Record<string, string> = { mobile: 'Celular', desktop: 'Computadora', tablet: 'Tablet', unknown: 'Sin dato' };

export const SEVERITY_LABELS: Record<string, string> = { info: 'Informativa', warning: 'Advertencia', critical: 'Crítica' };

export const PAYMENT_STATUS_LABELS: Record<string, string> = { paid: 'Pagada', partial: 'Pago parcial', pending: 'Pendiente' };

export const EVENT_SOURCE_LABELS: Record<string, string> = { browser: 'navegador', server: 'servidor', backfill: 'histórico' };

export const RULE_TITLES: Record<string, string> = {
  UNKNOWN_CHANNEL_RATE_HIGH: 'Muchas visitas sin clasificar',
  UTM_SOURCE_WITHOUT_MEDIUM: 'Enlaces con origen pero sin medio',
  PAID_MEDIUM_WITHOUT_CAMPAIGN: 'Anuncios pagos sin campaña',
  SOCIAL_SOURCE_CLASSIFIED_AS_PAID_WITHOUT_EVIDENCE: 'Visitas marcadas como pagas sin evidencia',
  ORPHAN_EVENT: 'Eventos sin visita',
  EVENT_TIME_IN_FUTURE: 'Eventos con hora adelantada',
  PURCHASE_WITHOUT_PAYMENT: 'Compras sin dinero cobrado',
  PAYMENT_WITHOUT_PURCHASE_SIGNAL: 'Pagos sin señal de compra',
  INSCRIPTION_WITHOUT_VISIT: 'Inscripciones sin visita vinculada',
  CAPI_PENDING_TOO_LONG: 'Eventos de Meta sin resolver hace mucho',
  CAPI_EXHAUSTED: 'Eventos de Meta que no llegaron',
  TRACKING_STALE: 'El seguimiento no recibe datos',
};
