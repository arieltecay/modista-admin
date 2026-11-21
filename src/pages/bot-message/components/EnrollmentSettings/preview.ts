import { COURSE_PLACEHOLDER } from './fields';
import type { TemplateValues } from './types';

const SAMPLE_COURSE = 'Curso de camisas';

/** Misma regla que el servidor: encabezado, una línea por estado, cierre; las partes vacías se omiten. */
export const buildPreview = (templates: TemplateValues): string =>
  [
    templates.header,
    ...(['paid', 'partial', 'pending', 'review'] as const).map(key => templates[key].split(COURSE_PLACEHOLDER).join(SAMPLE_COURSE)),
    templates.footer,
  ]
    .filter(part => part.trim())
    .join('\n');
