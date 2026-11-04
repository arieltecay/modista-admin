export interface FunnelStep {
  step: string;
  uniqueSessions: number;
}

export interface FunnelStats {
  funnel: FunnelStep[];
}

export interface GeneralStats {
  totalRevenue: number;
  totalInscriptions: number;
  paidInscriptions: number;
}

export interface CoursePerformance {
  _id: string;
  courseTitle: string;
  totalInscribed: number;
  paidInscribed: number;
}

export interface WhatsAppStats {
  sent: number;
  delivered: number;
  read: number;
}

export interface CampaignEntry {
  campaign: string;
  visits: number;
  leads: number;
  purchases: number;
}

export interface TrafficData {
  topCampaigns: CampaignEntry[];
}

export interface DashboardData {
  stats: GeneralStats | null;
  performance: CoursePerformance[];
  whatsAppStats: WhatsAppStats | null;
  traffic: TrafficData | null;
  funnelStats: FunnelStats | null;
  isLoading: boolean;
  isRefreshing: boolean;
  hasLoadError: boolean;
  refresh: () => void;
}
