// Fictional data for the Messages section, shared by the unit tests and e2e/.
// No real phone numbers, Instagram ids or customer text. Shapes match the API (see docs/agent/contracts.md).

export const WHATSAPP_ID = '5491100000001';
export const INSTAGRAM_ID = 'ig_test_000001';
/** Real Instagram ids are longer than 15 characters: the list shows them shortened. */
export const LONG_INSTAGRAM_ID = '17800000000000001';

export const whatsappChat = {
  _id: { platform: 'whatsapp', platform_id: WHATSAPP_ID },
  lastMessage: 'Hola, quiero info del curso',
  lastTimestamp: '2026-11-22T12:00:00.000Z',
  unreadCount: 2,
};

export const instagramChat = {
  _id: { platform: 'instagram', platform_id: INSTAGRAM_ID },
  lastMessage: 'precio?',
  lastTimestamp: '2026-11-22T11:00:00.000Z',
  unreadCount: 0,
};

export const chats = [whatsappChat, instagramChat];

export const messages = [
  { _id: 'm1', direction: 'inbound', body: 'Hola, quiero info del curso', timestamp: '2026-11-22T12:00:00.000Z', status: 'delivered' },
  { _id: 'm2', direction: 'inbound', kind: 'comment', body: 'precio?', timestamp: '2026-11-22T12:01:00.000Z', status: 'delivered' },
  { _id: 'm3', direction: 'outbound', kind: 'private_reply', body: 'Te escribimos por privado', timestamp: '2026-11-22T12:02:00.000Z', status: 'failed' },
  // The API may store these statuses, but they are not reliable: the UI must never show them.
  { _id: 'm4', direction: 'outbound', body: 'Gracias por escribir', timestamp: '2026-11-22T12:03:00.000Z', status: 'delivered' },
  { _id: 'm5', direction: 'outbound', body: 'Cualquier duda avisanos', timestamp: '2026-11-22T12:04:00.000Z', status: 'read' },
];

export const instruction = {
  _id: 'i1',
  title: 'Curso camisa',
  content: 'El curso comienza el 23 de noviembre.',
  order: 1,
  isActive: true,
  instagramAutoReply: true,
  instagramKeywords: ['camisa'],
  instagramEnrollmentLookup: false,
  instagramCommentReply: false,
};

export const template = (name: string, status: string) => ({
  id: name,
  name,
  status,
  category: 'UTILITY',
  language: 'es_AR',
  components: [{ type: 'BODY', text: `Texto de ${name}` }],
});

export const templates = [template('aviso_aprobado', 'APPROVED'), template('aviso_pendiente', 'PENDING'), template('aviso_rechazado', 'REJECTED')];

export const enrollmentTemplates = {
  header: 'Encontré estas inscripciones:',
  paid: '• {curso}: figura como pagada.',
  partial: '• {curso}: registra un pago parcial.',
  pending: '• {curso}: tiene el pago pendiente de confirmación.',
  review: '• {curso}: tiene un estado pendiente de revisión.',
  footer: '',
  notFound: 'No encontré una inscripción con esos datos.',
  askContact: 'Indicame el email y el celular.',
  rateLimited: 'Hiciste varias consultas seguidas.',
};

export const enrollmentConfig = { whatsappLookupEnabled: false, templates: enrollmentTemplates, defaults: enrollmentTemplates };
