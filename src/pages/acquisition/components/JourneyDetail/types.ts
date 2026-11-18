export interface JourneyDetailView {
  visit: {
    visitId: string;
    channelGroup: string;
    sourcePlatform: string;
    acquisitionType: string;
    device: string;
    entryPath: string;
    hasFbc: boolean;
    hasFbp: boolean;
    rawAttribution: { source?: string; medium?: string; campaign?: string };
    landingSlug?: string;
    referrerHost?: string;
  };
  events: Array<{ name: string; occurredAt: string; source: string; path?: string }>;
  conversions: Array<{ inscriptionId: string; paymentStatus: string; collected: number }>;
  truncated: boolean;
}

export interface JourneyDetailProps {
  detail: JourneyDetailView;
  timezone: string;
  onClose: () => void;
}
