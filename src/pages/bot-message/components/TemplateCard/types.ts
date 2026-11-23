export interface TemplateCardData {
  /** Meta id: the same name exists once per language. */
  id: string;
  name: string;
  category: string;
  language: string;
  /** Meta status as sent by the API: APPROVED, PENDING, REJECTED or another value. */
  status: string;
  body: string;
}

export interface TemplateCardProps {
  template: TemplateCardData;
  onSendTest: (id: string) => void;
  onDelete: (name: string) => void;
}
