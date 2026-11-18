export interface QualityRuleView {
  code: string;
  severity: 'info' | 'warning' | 'critical';
  affected: number;
  universe: number;
  percentage: number | null;
  firstOccurrence: string | null;
  lastOccurrence: string | null;
  explanation: string;
  action: string;
}

export interface QualityPanelProps {
  rules: QualityRuleView[];
  evaluated: string[];
  capi: { accepted: number; delivered: number; pending: number; retry: number; exhausted: number };
  identifiers: { fbcCoverage: number | null; fbpCoverage: number | null };
  tracking: { lastActivityAt: string | null; stale: boolean };
  timezone: string;
}
