/**
 * SPEC_VERSION 2.0 — ESPEJO de docs/rich-text-spec.md
 * Este archivo existe idéntico en modista-app y modista-admin.
 * Cualquier cambio exige sincronizar ambas copias (diff vacío = sincronizado).
 */

export const SPEC_VERSION = '2.0';

// ---------------------------------------------------------------------------
// Clases (LITERALES: el scanner de Tailwind 4 las detecta en este archivo)
// ---------------------------------------------------------------------------

export const STRONG_CLASSES = 'font-bold text-foreground';
export const EM_CLASSES = 'italic text-foreground/90';

export const LINK_CLASSES =
  'text-pink-600 hover:text-pink-700 underline font-medium decoration-pink-300 transition-colors';

export const BUTTON_BASE_CLASSES =
  'inline-block max-w-full whitespace-normal break-words px-5 sm:px-6 py-2 rounded-full transition-all duration-200 my-2 font-semibold shadow-md hover:scale-105 active:scale-95 no-underline decoration-transparent text-center text-sm sm:text-base';

export type ButtonVariant = 'btn' | 'btn-primary' | 'btn-gold' | 'btn-outline' | 'wa';

/**
 * Orden sensible: 'btn' es prefijo de las demás variantes.
 * El parser evalúa prefijos largos primero.
 */
export const BUTTON_VARIANT_CLASSES: Record<ButtonVariant, string> = {
  'btn-primary': 'bg-atelier-primary text-white hover:bg-atelier-primary-dark',
  'btn-gold': 'bg-atelier-gold text-white hover:brightness-95',
  'btn-outline':
    'bg-transparent text-atelier-primary border-2 border-atelier-primary hover:bg-atelier-primary hover:text-white shadow-none',
  wa: 'bg-[#25D366] text-white hover:bg-[#1EBE5B]',
  btn: 'bg-pink-500 text-white hover:bg-pink-600',
};

export const BUTTON_VARIANT_PREFIXES: readonly ButtonVariant[] = [
  'btn-primary',
  'btn-gold',
  'btn-outline',
  'wa',
  'btn',
];

export const IMAGE_WRAPPER_CLASSES = 'my-6 flex flex-col items-center group';
export const IMAGE_LINK_CLASSES =
  'relative overflow-hidden rounded-xl border-2 border-pink-100 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-pink-200 cursor-zoom-in';
export const IMAGE_CLASSES =
  'max-w-[220px] h-auto transition-transform duration-500 group-hover:scale-110';
export const IMAGE_CAPTION_CLASSES =
  'text-[10px] text-gray-400 mt-2 italic font-medium uppercase tracking-widest text-center';

export const H2_CLASSES =
  'font-atelier-serif text-xl sm:text-2xl font-semibold text-atelier-ink mt-6 mb-2';
export const H3_CLASSES =
  'font-atelier-serif text-lg sm:text-xl font-semibold text-atelier-primary mt-5 mb-2';

export const MARK_CLASSES = 'bg-atelier-gold/25 text-atelier-ink px-1 rounded';

export const HR_CLASSES = 'my-6 border-0 border-t-2 border-dashed border-atelier-sage/40';

export const BLOCKQUOTE_CLASSES =
  'border-l-4 border-atelier-primary/40 pl-4 py-1 my-4 italic text-atelier-muted-text';

export const ALIGN_CLASSES = {
  center: 'text-center',
  right: 'text-right',
} as const;

export type RichAlign = keyof typeof ALIGN_CLASSES;

// Paleta cerrada de marca (docs/rich-text-spec.md §4). Valor desconocido → texto plano.
export const RICH_COLOR_CLASSES = {
  pop: 'text-atelier-pop',
  primary: 'text-atelier-primary',
  gold: 'text-atelier-gold',
  ink: 'text-atelier-ink',
  sage: 'text-atelier-sage',
  pink: 'text-pink-600',
} as const;

export type RichColor = keyof typeof RICH_COLOR_CLASSES;

export const RICH_FONT_CLASSES = {
  serif: 'font-atelier-serif',
  sans: 'font-atelier-sans',
} as const;

export type RichFont = keyof typeof RICH_FONT_CLASSES;

// ---------------------------------------------------------------------------
// Guía de formato: la consume el admin renderizando cada `code` con el parser
// real, de modo que el ejemplo siempre refleja el render verdadero.
// ---------------------------------------------------------------------------

export interface GuideEntry {
  label: string;
  code: string;
}

export const GUIDE_ENTRIES: GuideEntry[] = [
  { label: 'Título', code: '# Título grande' },
  { label: 'Subtítulo', code: '## Subtítulo de sección' },
  { label: 'Negrita', code: '**texto destacado**' },
  { label: 'Cursiva', code: '_texto sutil_' },
  { label: 'Resaltado', code: '==muy importante==' },
  { label: 'Color', code: '[color:pop]texto coral[/color]' },
  { label: 'Fuente elegante', code: '[font:serif]Texto con serifa[/font]' },
  { label: 'Centrado', code: '[center]Texto centrado[/center]' },
  { label: 'A la derecha', code: '[right]Texto a la derecha[/right]' },
  { label: 'Cita', code: '[quote]Palabras que inspiran[/quote]' },
  { label: 'Separador', code: '---' },
  { label: 'Lista', code: '* Primer punto\n* Segundo punto' },
  { label: 'Enlace', code: '[click acá](https://modista-app.com)' },
  { label: 'Botón', code: '[btn:Inscribirme](https://modista-app.com)' },
  { label: 'Botón verde', code: '[btn-primary:Comprar](https://modista-app.com)' },
  { label: 'Botón dorado', code: '[btn-gold:Oferta](https://modista-app.com)' },
  { label: 'Botón borde', code: '[btn-outline:Ver más](https://modista-app.com)' },
  { label: 'Botón WhatsApp', code: '[wa:Consultar](https://wa.me/5491100000000)' },
  { label: 'Imagen', code: '[img:Ejemplo del trabajo](https://placehold.co/600x400/png)' },
];
