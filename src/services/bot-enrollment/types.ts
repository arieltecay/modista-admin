export interface EnrollmentTemplatesPayload {
  header: string;
  paid: string;
  partial: string;
  pending: string;
  review: string;
  footer: string;
  notFound: string;
  askContact: string;
  rateLimited: string;
}

export interface EnrollmentConfigPayload {
  whatsappLookupEnabled: boolean;
  /** Solo los textos personalizados; los omitidos vuelven al original. */
  templates: Partial<EnrollmentTemplatesPayload>;
}

export interface EnrollmentConfigResponse {
  whatsappLookupEnabled: boolean;
  templates: EnrollmentTemplatesPayload;
  /** Textos originales, para restaurar. */
  defaults: EnrollmentTemplatesPayload;
}
