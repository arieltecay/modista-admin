export interface ToolbarAction {
  id: string;
  label: string;
  title: string;
  before: string;
  after: string;
  placeholder: string;
  group: 'inline' | 'block' | 'color' | 'font' | 'cta';
  /** Inserta salto de línea previo si el cursor no está al inicio de una línea. */
  lineStart?: boolean;
  /** Clase del chip de color (acciones de grupo 'color'). */
  swatchClass?: string;
  labelClassName?: string;
}

export interface InsertResult {
  value: string;
  selectionStart: number;
  selectionEnd: number;
}

/**
 * Inserta una acción respetando la selección del textarea:
 * con selección la envuelve (wrap), sin selección inserta el placeholder.
 */
export const insertSyntax = (
  textarea: HTMLTextAreaElement,
  action: ToolbarAction,
): InsertResult => {
  const { selectionStart, selectionEnd, value } = textarea;
  const selected = value.slice(selectionStart, selectionEnd);
  const inner = selected || action.placeholder;

  const needsBreak =
    action.lineStart === true && selectionStart > 0 && value[selectionStart - 1] !== '\n';
  const before = (needsBreak ? '\n' : '') + action.before;

  return {
    value: value.slice(0, selectionStart) + before + inner + action.after + value.slice(selectionEnd),
    selectionStart: selectionStart + before.length,
    selectionEnd: selectionStart + before.length + inner.length,
  };
};

export const TOOLBAR_ACTIONS: ToolbarAction[] = [
  // -- Formato inline
  { id: 'bold', label: 'B', title: 'Negrita', before: '**', after: '**', placeholder: 'texto en negrita', group: 'inline' },
  { id: 'italic', label: 'I', title: 'Cursiva', before: '_', after: '_', placeholder: 'texto en cursiva', group: 'inline', labelClassName: 'italic' },
  { id: 'highlight', label: 'Ab', title: 'Resaltado', before: '==', after: '==', placeholder: 'texto resaltado', group: 'inline', labelClassName: 'bg-amber-100 rounded px-0.5' },
  // -- Estructura
  { id: 'h2', label: 'H2', title: 'Título', before: '# ', after: '', placeholder: 'Título de sección', group: 'block', lineStart: true },
  { id: 'h3', label: 'H3', title: 'Subtítulo', before: '## ', after: '', placeholder: 'Subtítulo', group: 'block', lineStart: true },
  { id: 'center', label: '↔', title: 'Centrar', before: '[center]', after: '[/center]', placeholder: 'texto centrado', group: 'block' },
  { id: 'right', label: '⇥', title: 'Alinear a la derecha', before: '[right]', after: '[/right]', placeholder: 'texto a la derecha', group: 'block' },
  { id: 'quote', label: '❝', title: 'Cita', before: '[quote]', after: '[/quote]', placeholder: 'cita', group: 'block' },
  { id: 'hr', label: '―', title: 'Separador', before: '---', after: '', placeholder: '', group: 'block', lineStart: true },
  { id: 'list', label: '• Lista', title: 'Lista de viñetas', before: '* ', after: '', placeholder: 'ítem', group: 'block', lineStart: true },
  // -- Colores (paleta cerrada de marca — SPEC §4)
  { id: 'color-pop', label: '', title: 'Color coral (acentos/ofertas)', before: '[color:pop]', after: '[/color]', placeholder: 'texto coral', group: 'color', swatchClass: 'bg-atelier-pop' },
  { id: 'color-primary', label: '', title: 'Color verde (marca)', before: '[color:primary]', after: '[/color]', placeholder: 'texto verde', group: 'color', swatchClass: 'bg-atelier-primary' },
  { id: 'color-gold', label: '', title: 'Color dorado (premium)', before: '[color:gold]', after: '[/color]', placeholder: 'texto dorado', group: 'color', swatchClass: 'bg-atelier-gold' },
  { id: 'color-ink', label: '', title: 'Color tinta (énfasis neutro)', before: '[color:ink]', after: '[/color]', placeholder: 'texto tinta', group: 'color', swatchClass: 'bg-atelier-ink' },
  { id: 'color-sage', label: '', title: 'Color sage (suave)', before: '[color:sage]', after: '[/color]', placeholder: 'texto suave', group: 'color', swatchClass: 'bg-atelier-sage' },
  { id: 'color-pink', label: '', title: 'Color pink (legado)', before: '[color:pink]', after: '[/color]', placeholder: 'texto pink', group: 'color', swatchClass: 'bg-pink-600' },
  // -- Fuentes
  { id: 'font-serif', label: 'Aa', title: 'Fuente elegante (serif)', before: '[font:serif]', after: '[/font]', placeholder: 'texto con serifa', group: 'font', labelClassName: 'font-atelier-serif' },
  { id: 'font-sans', label: 'Aa', title: 'Fuente cuerpo (sans)', before: '[font:sans]', after: '[/font]', placeholder: 'texto sin serifa', group: 'font' },
  // -- Llamadas a la acción
  { id: 'link', label: '🔗 Enlace', title: 'Enlace', before: '[', after: '](https://tu-enlace.com)', placeholder: 'texto del enlace', group: 'cta' },
  { id: 'btn', label: 'Botón', title: 'Botón pink (clásico)', before: '[btn:', after: '](https://tu-enlace.com)', placeholder: 'Inscribirme', group: 'cta', labelClassName: 'text-pink-600' },
  { id: 'btn-primary', label: 'Botón verde', title: 'Botón verde marca', before: '[btn-primary:', after: '](https://tu-enlace.com)', placeholder: 'Comprar', group: 'cta', labelClassName: 'text-atelier-primary' },
  { id: 'btn-gold', label: 'Botón dorado', title: 'Botón dorado (ofertas)', before: '[btn-gold:', after: '](https://tu-enlace.com)', placeholder: 'Ver oferta', group: 'cta', labelClassName: 'text-atelier-gold' },
  { id: 'btn-outline', label: 'Botón borde', title: 'Botón secundario', before: '[btn-outline:', after: '](https://tu-enlace.com)', placeholder: 'Ver más', group: 'cta' },
  { id: 'wa', label: '💬 WhatsApp', title: 'Botón de WhatsApp', before: '[wa:', after: '](https://wa.me/tu-numero)', placeholder: 'Consultar', group: 'cta' },
  { id: 'img', label: '🖼 Imagen', title: 'Imagen con miniatura', before: '[img:', after: '](https://url-de-la-imagen)', placeholder: 'Descripción', group: 'cta' },
];
