export interface InfoTipHelp {
  formula: string;
  source: string;
  limits: string;
}

export interface InfoTipProps {
  label: string;
  help: InfoTipHelp;
}

export type TipState = 'auto' | 'open' | 'dismissed';
