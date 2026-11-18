export interface ChannelRowView {
  channelGroup: string;
  sourcePlatform: string;
  visits: number;
  leads: number;
  purchases: number;
  revenue: number;
  leadRate: number | null;
  purchaseRate: number | null;
  averageTicket: number | null;
  revenueShare: number | null;
}

export interface UnlinkedView {
  leads: number;
  purchases: number;
  revenue: number;
}

export interface ChannelTableProps {
  rows: ChannelRowView[];
  unlinked: UnlinkedView | null;
  isCohort: boolean;
}

export type SortKey = 'channelGroup' | 'sourcePlatform' | 'visits' | 'leads' | 'purchases' | 'leadRate' | 'purchaseRate' | 'revenue' | 'averageTicket' | 'revenueShare';
export type SortDirection = 'asc' | 'desc';
