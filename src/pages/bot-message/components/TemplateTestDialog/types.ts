export interface TemplateTestDialogProps {
  /** Template to test; null keeps the dialog closed. */
  templateName: string | null;
  sending: boolean;
  onSend: (phone: string) => void;
  onClose: () => void;
}
