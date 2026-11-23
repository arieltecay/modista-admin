export interface TemplateDraft {
  name: string;
  category: string;
  language: string;
  body: string;
}

export interface TemplateCreateDialogProps {
  isOpen: boolean;
  onSubmit: (draft: TemplateDraft) => Promise<boolean>;
  onClose: () => void;
}
