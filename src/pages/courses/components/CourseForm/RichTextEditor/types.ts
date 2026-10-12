import type { MutableRefObject } from 'react';

export interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  /** Ref imperativa del textarea para insertar sintaxis en el cursor. */
  textareaRef: MutableRefObject<HTMLTextAreaElement | null>;
  /** Ref de react-hook-form (Controller): se compone con textareaRef. */
  registerRef: (instance: HTMLTextAreaElement | null) => void;
}
