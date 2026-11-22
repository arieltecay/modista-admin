export interface BotInstruction {
  _id: string;
  title: string;
  content: string;
  order: number;
  isActive: boolean;
  instagramAutoReply?: boolean;
  instagramKeywords?: string[];
  instagramEnrollmentLookup?: boolean;
  instagramCommentReply?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BotInstructionFormData {
  title: string;
  content: string;
  order: number;
  isActive: boolean;
  instagramAutoReply: boolean;
  instagramKeywords: string[];
  instagramEnrollmentLookup: boolean;
  instagramCommentReply: boolean;
}

/** Campos de un mensaje de conversación que cambian cómo se muestra. Sin `kind` es un mensaje directo. */
export interface ConversationEventInfo {
  direction: 'inbound' | 'outbound';
  kind?: 'comment' | 'private_reply';
  status?: string;
}
