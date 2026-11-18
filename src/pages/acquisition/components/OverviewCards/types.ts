export interface OutcomesView {
  leads: number;
  purchases: number;
  partialPayments: number;
  revenue: number;
}

export interface OverviewView {
  visits: number;
  visitors: number;
  attributableVisits: number;
  leads: number;
  purchases: number;
  partialPayments: number;
  revenue: number;
  leadRate: number | null;
  purchaseRate: number | null;
  unlinked: OutcomesView | null;
}

export interface CoverageView {
  attributionCoverage: number | null;
  measurementCoverage: number | null;
}

export interface OverviewCardsProps {
  overview: OverviewView;
  coverage: CoverageView;
  reportingMode: 'acquisition_cohort' | 'event_period';
  outcomeWindowDays: number | null;
  outcomesComplete: boolean | null;
}
