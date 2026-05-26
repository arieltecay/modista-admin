import { apiClient } from '../config/apiClient';

export interface CampaignEntry {
  campaign: string;
  visits: number;
  leads: number;
}

export interface DailyBreakdown {
  date: string;
  organic: number;
  paid: number;
  direct: number;
}

export interface TrafficData {
  totalSessions: number;
  paid: number;
  organic: number;
  direct: number;
  socialOrganic: number;
  referral: number;
  email: number;
  topCampaigns: CampaignEntry[];
  dailyBreakdown: DailyBreakdown[];
  lastUpdated: string;
}

export const getTrafficData = (params: {
  startDate: string;
  endDate: string;
}): Promise<TrafficData> => apiClient.get('/analytics/traffic', { params });
