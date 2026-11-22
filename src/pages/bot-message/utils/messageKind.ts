import type { ConversationEventInfo } from '../types';

const PRIVATE_REPLY_LABEL = 'Respuesta privada al comentario';

/** Etiqueta para distinguir comentarios públicos y respuestas privadas de los DMs normales (sin etiqueta). */
export const getMessageKindLabel = ({ kind, status }: ConversationEventInfo): string | null => {
  if (kind === 'comment') return 'Comentario público';
  if (kind === 'private_reply') return status === 'failed' ? `${PRIVATE_REPLY_LABEL} · no enviada` : PRIVATE_REPLY_LABEL;
  return null;
};
