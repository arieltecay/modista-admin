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
  /** Missing on rules saved before the option existed: read as 'gemini'. */
  instagramResponseMode?: 'gemini' | 'fixed';
  instagramFixedResponse?: string;
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
  instagramResponseMode: 'gemini' | 'fixed';
  /** Kept while the rule is in Gemini mode, so switching back does not lose it. */
  instagramFixedResponse: string;
}

/** Campos de un mensaje de conversación que cambian cómo se muestra. Sin `kind` es un mensaje directo. */
export interface ConversationEventInfo {
  direction: 'inbound' | 'outbound';
  kind?: 'comment' | 'private_reply';
  status?: string;
}
