/**
 * SPEC_VERSION 2.0 — ESPEJO de docs/rich-text-spec.md
 * Este archivo existe idéntico en modista-app y modista-admin.
 * Cualquier cambio exige sincronizar ambas copias (diff vacío = sincronizado).
 *
 * Pipeline: captura de bloques → captura de links/media → escape → formato
 * inline → saltos de línea → restauración de tokens. Cada llamada recursiva
 * devuelve HTML final, por lo que nunca quedan placeholders anidados.
 */
import {
  ALIGN_CLASSES,
  BLOCKQUOTE_CLASSES,
  BUTTON_BASE_CLASSES,
  BUTTON_VARIANT_CLASSES,
  BUTTON_VARIANT_PREFIXES,
  EM_CLASSES,
  H2_CLASSES,
  H3_CLASSES,
  HR_CLASSES,
  IMAGE_CAPTION_CLASSES,
  IMAGE_CLASSES,
  IMAGE_LINK_CLASSES,
  IMAGE_WRAPPER_CLASSES,
  LINK_CLASSES,
  MARK_CLASSES,
  RICH_COLOR_CLASSES,
  RICH_FONT_CLASSES,
  STRONG_CLASSES,
} from './syntax-spec';
import type { ButtonVariant, RichAlign, RichColor, RichFont } from './syntax-spec';

interface CapturedToken {
  id: string;
  content: string;
}

// -- Escape -----------------------------------------------------------------

// Texto general (equivalente al escape v1: solo &, <, >).
const escapeText = (raw: string): string =>
  raw.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Texto que termina dentro de etiquetas/atributos generados por el parser.
const escapeAttribute = (raw: string): string =>
  escapeText(raw).replace(/"/g, '&quot;').replace(/'/g, '&#39;');

// -- Seguridad de URLs -------------------------------------------------------

const ALLOWED_PROTOCOL_PATTERN = /^(https?:\/\/|mailto:|tel:)[^\s"'<>]+$/i;

/** Whitelist de protocolos. URL inválida → null (el match queda como texto plano). */
const sanitizeUrl = (rawUrl: string): string | null => {
  const url = rawUrl.trim();
  return ALLOWED_PROTOCOL_PATTERN.test(url) ? url : null;
};

// -- Tokens ------------------------------------------------------------------

// Placeholder alfanumérico puro: no colisiona con los motores de negrita/cursiva.
const pushToken = (tokens: CapturedToken[], content: string): string => {
  const id = `MODISTATOKEN${tokens.length}X`;
  tokens.push({ id, content });
  return id;
};

const restoreTokens = (text: string, tokens: CapturedToken[]): string => {
  let restored = text;
  tokens.forEach((token) => {
    restored = restored.split(token.id).join(token.content);
  });
  return restored;
};

// -- Builders de media y enlaces --------------------------------------------

const buildLink = (rawLabel: string, rawUrl: string): string | null => {
  const url = sanitizeUrl(rawUrl);
  if (!url) return null;
  return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="${LINK_CLASSES}">${escapeText(rawLabel)}</a>`;
};

const buildButton = (variant: ButtonVariant, rawLabel: string, rawUrl: string): string | null => {
  const url = sanitizeUrl(rawUrl);
  if (!url) return null;
  const label = escapeAttribute(rawLabel);
  const text = variant === 'wa' ? `💬 ${label}` : label;
  return `<a href="${url}" target="_blank" rel="noopener noreferrer" data-cta="${variant}" data-cta-label="${label}" class="${BUTTON_BASE_CLASSES} ${BUTTON_VARIANT_CLASSES[variant]}">${text}</a>`;
};

const buildImage = (rawAlt: string, rawUrl: string): string | null => {
  const url = sanitizeUrl(rawUrl);
  if (!url) return null;
  const alt = escapeAttribute(rawAlt);
  return `<div class="${IMAGE_WRAPPER_CLASSES}"><a href="${url}" target="_blank" rel="noopener noreferrer" class="${IMAGE_LINK_CLASSES}"><img src="${url}" alt="${alt}" loading="lazy" class="${IMAGE_CLASSES}" /></a><p class="${IMAGE_CAPTION_CLASSES}">${alt}</p></div>`;
};

// Orden: 'btn' es prefijo de las demás variantes, por eso BUTTON_VARIANT_PREFIXES
// ya viene ordenado de prefijo más largo a más corto.
const buildMediaOrLink = (rawLabel: string, rawUrl: string): string | null => {
  const label = rawLabel.trim();
  if (label.startsWith('img:')) {
    return buildImage(label.replace(/^img:/, '').trim(), rawUrl);
  }
  const variant = BUTTON_VARIANT_PREFIXES.find((prefix) => label.startsWith(`${prefix}:`));
  if (variant) {
    return buildButton(variant, label.replace(`${variant}:`, '').trim(), rawUrl);
  }
  return buildLink(label, rawUrl);
};

// -- Fase 1: captura ---------------------------------------------------------

// Bloques contenedores: su interior se procesa recursivamente con el pipeline
// completo, de modo que el token guarda HTML final (sin placeholders anidados).
const captureBlocks = (text: string, tokens: CapturedToken[]): string => {
  let processed = text;

  processed = processed.replace(
    /\[(center|right)\]([\s\S]*?)\[\/\1\]/g,
    (_match, align: string, inner: string) =>
      pushToken(
        tokens,
        `<div class="${ALIGN_CLASSES[align as RichAlign]}">${formatTextToHtml(inner)}</div>`,
      ),
  );

  processed = processed.replace(
    /\[color:(\w+)\]([\s\S]*?)\[\/color\]/g,
    (match, color: string, inner: string) => {
      const colorClass = RICH_COLOR_CLASSES[color as RichColor];
      if (!colorClass) return match;
      return pushToken(tokens, `<span class="${colorClass}">${formatTextToHtml(inner)}</span>`);
    },
  );

  processed = processed.replace(
    /\[font:(\w+)\]([\s\S]*?)\[\/font\]/g,
    (match, font: string, inner: string) => {
      const fontClass = RICH_FONT_CLASSES[font as RichFont];
      if (!fontClass) return match;
      return pushToken(tokens, `<span class="${fontClass}">${formatTextToHtml(inner)}</span>`);
    },
  );

  processed = processed.replace(/\[quote\]([\s\S]*?)\[\/quote\]/g, (_match, inner: string) =>
    pushToken(tokens, `<blockquote class="${BLOCKQUOTE_CLASSES}">${formatTextToHtml(inner)}</blockquote>`),
  );

  return processed;
};

const captureLinksAndMedia = (text: string, tokens: CapturedToken[]): string =>
  text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, label: string, url: string) => {
    const html = buildMediaOrLink(label.trim(), url.trim());
    return html === null ? match : pushToken(tokens, html);
  });

// -- Fase 3: formato inline (texto ya escapado) ------------------------------

const applyInlineFormatting = (text: string): string => {
  let processed = text;
  processed = processed.replace(/^## (.+)$/gm, `<h3 class="${H3_CLASSES}">$1</h3>`);
  processed = processed.replace(/^# (.+)$/gm, `<h2 class="${H2_CLASSES}">$1</h2>`);
  processed = processed.replace(/^---$/gm, `<hr class="${HR_CLASSES}">`);
  processed = processed.replace(/==([^=]+)==/g, `<mark class="${MARK_CLASSES}">$1</mark>`);
  processed = processed.replace(/\*\*([^*]+)\*\*/g, `<strong class="${STRONG_CLASSES}">$1</strong>`);
  processed = processed.replace(/_([^_]+)_/g, `<em class="${EM_CLASSES}">$1</em>`);
  processed = processed.replace(/^(\s*)\*\s+/gm, '$1• ');
  processed = processed.replace(/^(\s*)-\s+/gm, '$1• ');
  processed = processed.replace(/^(\s*)(\d+)\.\s+/gm, '$1$2. ');
  return processed;
};

const applyLineBreaks = (text: string): string => text.replace(/\n/g, '<br>');

// -- API pública -------------------------------------------------------------

/**
 * Formatea texto plano para mostrarlo como HTML enriquecido de forma segura.
 * Sintaxis inválida degrada a texto plano literal: el render nunca rompe.
 */
export const formatTextToHtml = (text: string): string => {
  if (!text) return '';

  const tokens: CapturedToken[] = [];
  let processed = captureBlocks(text, tokens);
  processed = captureLinksAndMedia(processed, tokens);
  processed = escapeText(processed);
  processed = applyInlineFormatting(processed);
  processed = applyLineBreaks(processed);
  return restoreTokens(processed, tokens);
};
