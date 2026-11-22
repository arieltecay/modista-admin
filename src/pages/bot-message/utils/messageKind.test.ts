import { describe, expect, it } from 'vitest';
import { getMessageKindLabel } from './messageKind';

describe('getMessageKindLabel', () => {
  it('leaves direct messages unlabeled', () => {
    expect(getMessageKindLabel({ direction: 'inbound' })).toBeNull();
  });

  it('marks public comments and private replies, and flags failed private replies', () => {
    expect(getMessageKindLabel({ kind: 'comment', direction: 'inbound' })).toBe('Comentario público');
    expect(getMessageKindLabel({ kind: 'private_reply', direction: 'outbound', status: 'sent' })).toBe('Respuesta privada al comentario');
    expect(getMessageKindLabel({ kind: 'private_reply', direction: 'outbound', status: 'failed' })).toBe('Respuesta privada al comentario · no enviada');
  });
});
