export type ResponseMode = 'gemini' | 'fixed';

export interface ResponseModeFieldProps {
  mode: ResponseMode;
  fixedResponse: string;
  onModeChange: (mode: ResponseMode) => void;
  onFixedResponseChange: (text: string) => void;
}
