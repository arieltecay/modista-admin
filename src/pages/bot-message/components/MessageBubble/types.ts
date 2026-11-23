export interface MessageBubbleProps {
  id: string;
  body: string;
  time: string;
  inbound: boolean;
  /** "Comentario público", "Respuesta privada…" or nothing for a direct message. */
  kindLabel: string | null;
  failed: boolean;
  onDelete: (id: string) => void;
  /** Only inbound messages can become an FAQ. */
  onSaveAsFaq?: (body: string) => void;
}
