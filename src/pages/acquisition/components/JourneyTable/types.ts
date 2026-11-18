export interface JourneyView {
  visitId: string;
  startedAt: string;
  lastActivityAt: string;
  channelGroup: string;
  device: string;
  maxStep: string;
  hasLead: boolean;
  hasPurchase: boolean;
  revenue: number;
  truncated: boolean;
  landingSlug?: string;
}

export interface PaginationView {
  page: number;
  totalPages: number;
  total: number;
}

export interface JourneyTableProps {
  journeys: JourneyView[];
  pagination: PaginationView;
  timezone: string;
  onSelect: (visitId: string) => void;
  onPageChange: (page: number) => void;
}
