import type { TemplateFieldDefinition, TemplateValues } from './types';

export const COURSE_PLACEHOLDER = '{curso}';
export const MAX_TEMPLATE_LENGTH = 500;

export const TEMPLATE_FIELDS: TemplateFieldDefinition[] = [
  { key: 'header', label: 'Encabezado', help: 'Va antes de la lista de cursos. Podés dejarlo vacío.', optional: true },
  { key: 'paid', label: 'Pago completo', help: 'Una línea por curso con el pago completo.', needsCourse: true },
  { key: 'partial', label: 'Pago parcial', help: 'Una línea por curso con seña o pago parcial.', needsCourse: true },
  { key: 'pending', label: 'Pago pendiente', help: 'Una línea por curso con el pago sin confirmar.', needsCourse: true },
  { key: 'review', label: 'Otro estado', help: 'Una línea por curso con cualquier otro estado.', needsCourse: true },
  { key: 'footer', label: 'Cierre', help: 'Va después de la lista. Podés dejarlo vacío.', optional: true },
  { key: 'notFound', label: 'No se encontró inscripción', help: 'Solo Instagram: los datos no coinciden con ninguna inscripción.' },
  { key: 'askContact', label: 'Pedir email y celular', help: 'Solo Instagram: cuando falta alguno de los dos datos.' },
  { key: 'rateLimited', label: 'Límite de consultas', help: 'Solo Instagram: tras 6 consultas en una hora desde la misma cuenta.' },
];

/** Devuelve el mensaje de error de un texto, o null si es válido. Mismas reglas que la API. */
export const validateTemplate = (field: TemplateFieldDefinition, value: string): string | null => {
  const text = value.trim();
  if (text.length > MAX_TEMPLATE_LENGTH) return `Máximo ${MAX_TEMPLATE_LENGTH} caracteres`;
  if (!text) return field.optional ? null : 'No puede estar vacío';
  if (/\{(?!curso\})[^}]*\}/.test(text)) return `Solo se permite ${COURSE_PLACEHOLDER}`;
  if (field.needsCourse && !text.includes(COURSE_PLACEHOLDER)) return `Debe incluir ${COURSE_PLACEHOLDER}`;
  return null;
};

/** Textos recortados que difieren de los originales; los demás siguen los valores por defecto del servidor. */
export const customizedTemplates = (templates: TemplateValues, defaults: TemplateValues): Partial<TemplateValues> =>
  Object.fromEntries(
    TEMPLATE_FIELDS.map(({ key }) => [key, templates[key].trim()] as const).filter(([key, text]) => text !== defaults[key]),
  );
