export type TemplateKey = 'header' | 'paid' | 'partial' | 'pending' | 'review' | 'footer' | 'notFound' | 'askContact' | 'rateLimited';

export type TemplateValues = Record<TemplateKey, string>;

export interface EnrollmentSettingsValue {
  whatsappLookupEnabled: boolean;
  templates: TemplateValues;
}

export interface EnrollmentSettingsProps {
  /** Lo guardado actualmente en el servidor. */
  value: EnrollmentSettingsValue;
  /** Textos originales, para restaurar. */
  defaults: TemplateValues;
  saving: boolean;
  /** Solo se envían los textos que difieren de los originales. */
  onSave: (value: { whatsappLookupEnabled: boolean; templates: Partial<TemplateValues> }) => void;
}

export interface TemplateFieldDefinition {
  key: TemplateKey;
  label: string;
  help: string;
  /** Debe contener {curso}. */
  needsCourse?: boolean;
  /** Puede quedar vacío (se omite del mensaje). */
  optional?: boolean;
}
