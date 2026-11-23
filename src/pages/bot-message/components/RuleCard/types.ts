/** What the card needs from a bot instruction, in business terms. */
export interface RuleCardData {
  id: string;
  title: string;
  content: string;
  order: number;
  isActive: boolean;
  instagramDirect: boolean;
  instagramComments: boolean;
  enrollmentLookup: boolean;
  keywords: string[];
  /** On Instagram: 'fixed' sends `fixedResponse` word for word; 'gemini' lets Mila write from `content`. */
  replyMode: 'gemini' | 'fixed';
  fixedResponse: string;
  whatsappFixedReplyEnabled: boolean;
  whatsappKeywords: string[];
  whatsappFixedResponse: string;
}

export interface RuleCardProps {
  rule: RuleCardData;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}
