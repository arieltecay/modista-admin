export type ApiParams = Record<string, string | number | undefined>;

export type ReportingMode = 'acquisition_cohort' | 'event_period';
export type Perspective = 'visit_touch' | 'first_touch' | 'last_non_direct';

export interface Outcomes {
  leads: number;
  purchases: number;
  partialPayments: number;
  revenue: number;
}

export interface Coverage {
  observedConsentedVisits: number;
  knownChannelVisits: number;
  attributionCoverage: number | null;
  totalSiteVisits: number | null;
  measurementCoverage: number | null;
}

export interface RangeInfo {
  from: string;
  to: string;
  fromUtc: string;
  toExclusiveUtc: string;
}

export interface Envelope<T> {
  generatedAt: string;
  timezone: string;
  reportingMode: ReportingMode;
  outcomeWindowDays: 7 | 30 | null;
  outcomesComplete: boolean | null;
  perspective: Perspective;
  range: RangeInfo;
  data: T;
}

export interface ReportResponse<T> extends Envelope<T> {
  coverage: Coverage;
}

export interface Rates {
  leadRate: number | null;
  purchaseRate: number | null;
  averageTicket: number | null;
}

export interface OverviewData extends Outcomes, Rates {
  visits: number;
  visitors: number;
  attributableVisits: number;
  unlinked: Outcomes | null;
}

export interface ChannelRow extends Outcomes, Rates {
  channelGroup: string;
  sourcePlatform: string;
  visits: number;
  visitors: number;
  revenueShare: number | null;
}

export interface ChannelsData {
  channels: ChannelRow[];
  totals: Outcomes & Rates & { visits: number; visitors: number };
  unlinked: Outcomes | null;
}

export interface FunnelStepRow {
  step: string;
  visits: number;
  conversionFromPrevious: number | null;
  conversionFromTop: number | null;
}

export interface FunnelData {
  steps: FunnelStepRow[];
  independentCounts: boolean;
}

export interface LiveData {
  activeVisits: number;
  eventsInWindow: number;
  activeByChannel: Array<{ channelGroup: string; count: number }>;
  eventsPerMinute: Array<{ minute: string; count: number }>;
  recentEvents: Array<{ name: string; at: string; visit: string; channelGroup: string | null; path?: string; courseId?: string }>;
}

export interface LiveResponse {
  generatedAt: string;
  windowMinutes: number;
  data: LiveData;
}

export interface JourneyRow {
  visitId: string;
  startedAt: string;
  lastActivityAt: string;
  channelGroup: string;
  sourcePlatform: string;
  device: string;
  maxStep: string;
  hasLead: boolean;
  hasPurchase: boolean;
  revenue: number;
  eventCount: number;
  truncated: boolean;
  landingSlug?: string;
}

export interface JourneysResponse {
  generatedAt: string;
  timezone: string;
  range: RangeInfo;
  pagination: { page: number; limit: number; total: number; totalPages: number };
  data: { journeys: JourneyRow[] };
}

export interface JourneyDetailResponse {
  generatedAt: string;
  data: {
    visit: {
      visitId: string;
      startedAt: string;
      lastActivityAt: string;
      entryPath: string;
      channelGroup: string;
      sourcePlatform: string;
      acquisitionType: string;
      reason: string;
      device: string;
      hasFbc: boolean;
      hasFbp: boolean;
      rawAttribution: { source?: string; medium?: string; campaign?: string };
      landingSlug?: string;
      referrerHost?: string;
    };
    events: Array<{ name: string; occurredAt: string; source: string; path?: string; courseId?: string }>;
    conversions: Array<{ inscriptionId: string; paymentStatus: string; collected: number }>;
    truncated: boolean;
  };
}

export interface QualityRule {
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

export interface QualityResponse {
  generatedAt: string;
  timezone: string;
  range: RangeInfo;
  data: {
    rules: QualityRule[];
    evaluated: string[];
    capi: { accepted: number; delivered: number; pending: number; retry: number; exhausted: number };
    identifiers: { visits: number; withFbc: number; withFbp: number; fbcCoverage: number | null; fbpCoverage: number | null };
    tracking: { lastActivityAt: string | null; stale: boolean };
  };
}
