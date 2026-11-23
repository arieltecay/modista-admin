import { asId, asText, isRecord } from './guards';

/** A WhatsApp template as the screen uses it. Meta returns one row per language, so `id` is the key, not `name`. */
export interface TemplateRow {
  id: string;
  name: string;
  category: string;
  language: string;
  status: string;
  body: string;
}

const bodyOf = (components: unknown) =>
  asText((Array.isArray(components) ? components : []).filter(isRecord).find(c => c.type === 'BODY')?.text);

export const toTemplates = (data: unknown): TemplateRow[] =>
  Array.isArray(data)
    ? data.filter(isRecord).flatMap((tpl, index) => {
        const name = asText(tpl.name);
        if (!name) return [];
        return [{
          id: asId(tpl.id) ?? `${name}-${asText(tpl.language) || index}`,
          name,
          category: asText(tpl.category),
          language: asText(tpl.language),
          status: asText(tpl.status),
          body: bodyOf(tpl.components),
        }];
      })
    : [];

/** Sample variables for the payment confirmation template; other templates are sent without parameters. */
export const testComponentsFor = (name: string) =>
  name === 'confirmacion_pago_utilidad'
    ? [{
        type: 'body',
        parameters: [
          { type: 'text', parameter_name: 'nombre_alumno', text: 'Alumno de Prueba' },
          { type: 'text', parameter_name: 'nombre_curso', text: 'Curso de Prueba' },
          { type: 'text', parameter_name: 'cvu', text: '0000003100069944243193' },
          { type: 'text', parameter_name: 'alias', text: 'mica.menta' },
        ],
      }]
    : [];

/** WhatsApp test numbers: country code + number, digits only. Spaces, dashes and "+" are dropped. */
export const toTestPhone = (value: string) => {
  const digits = value.replace(/[\s\-+()]/g, '');
  return /^\d{10,15}$/.test(digits) ? digits : null;
};
