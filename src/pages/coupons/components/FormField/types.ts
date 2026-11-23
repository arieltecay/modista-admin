import type { ReactNode } from 'react';

export interface FormFieldProps {
  /** Id of the control inside, so the label points at it. */
  id: string;
  label: string;
  children: ReactNode;
  error?: string;
}
