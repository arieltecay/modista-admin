/** Same limits as the API: Instagram rejects texts over 1000 bytes; emojis take up to 4 bytes each. */
export const FIXED_REPLY_MAX_CHARS = 900;
const FIXED_REPLY_MAX_BYTES = 1000;

/** Counts Unicode code points like the API does (a simple emoji is 1; one with skin tone or a family is more). */
export const fixedReplyLength = (text: string) => [...text.trim()].length;

export const fixedReplyIssue = (text: string): 'empty' | 'tooLong' | undefined => {
  const trimmed = text.trim();
  if (!trimmed) return 'empty';
  if (fixedReplyLength(trimmed) > FIXED_REPLY_MAX_CHARS || new TextEncoder().encode(trimmed).length > FIXED_REPLY_MAX_BYTES) return 'tooLong';
  return undefined;
};
