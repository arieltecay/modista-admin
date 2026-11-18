export interface FunnelStepView {
  step: string;
  visits: number;
  conversionFromPrevious: number | null;
  conversionFromTop: number | null;
}

export interface FunnelViewProps {
  steps: FunnelStepView[];
  independentCounts: boolean;
}
