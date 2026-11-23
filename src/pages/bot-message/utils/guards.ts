/** Guards for API responses: the section renders what is well-formed and drops the rest. */
export const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

export const asText = (value: unknown) => (typeof value === 'string' ? value : '');

/** Ids may come as numbers from an aggregate; anything else is not an id. */
export const asId = (value: unknown) =>
  typeof value === 'string' && value ? value : typeof value === 'number' && Number.isFinite(value) ? String(value) : null;
