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
}

export interface RuleCardProps {
  rule: RuleCardData;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}
