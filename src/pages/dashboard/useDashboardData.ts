import { useCallback, useEffect, useRef, useState } from 'react';
import { getTrafficData } from '../../services/analytics/analyticsService';
import { getDashboardData } from '../../services/dashboard/dashboardService';
import type {
  CoursePerformance,
  DashboardData,
  FunnelStats,
  GeneralStats,
  TrafficData,
  WhatsAppStats,
} from './types';

export const useDashboardData = (startDate: string, endDate: string): DashboardData => {
  const [stats, setStats] = useState<GeneralStats | null>(null);
  const [performance, setPerformance] = useState<CoursePerformance[]>([]);
  const [whatsAppStats, setWhatsAppStats] = useState<WhatsAppStats | null>(null);
  const [traffic, setTraffic] = useState<TrafficData | null>(null);
  const [funnelStats, setFunnelStats] = useState<FunnelStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasLoadError, setHasLoadError] = useState(false);
  const requestId = useRef(0);

  const fetchData = useCallback(async (showRefreshState = false) => {
    const currentRequestId = requestId.current + 1;
    requestId.current = currentRequestId;

    if (showRefreshState) setIsRefreshing(true);
    else setIsLoading(true);

    setHasLoadError(false);
    const params = {
      startDate,
      // The funnel endpoint treats endDate as an instant; include the full selected day.
      endDate: `${endDate}T23:59:59.999Z`,
    };

    const [statsResult, performanceResult, whatsAppResult, trafficResult, funnelResult] =
      await Promise.allSettled([
        getDashboardData<GeneralStats>('/dashboard/stats', params),
        getDashboardData<CoursePerformance[]>('/dashboard/performance', params),
        getDashboardData<WhatsAppStats>('/dashboard/meta-whatsapp', params),
        getTrafficData(params),
        getDashboardData<FunnelStats>('/funnel/stats', params),
      ]);

    if (currentRequestId !== requestId.current) return;

    setStats(statsResult.status === 'fulfilled' ? statsResult.value : null);
    setPerformance(performanceResult.status === 'fulfilled' ? performanceResult.value : []);
    setWhatsAppStats(whatsAppResult.status === 'fulfilled' ? whatsAppResult.value : null);
    setTraffic(trafficResult.status === 'fulfilled' ? trafficResult.value : null);
    setFunnelStats(funnelResult.status === 'fulfilled' ? funnelResult.value : null);
    setHasLoadError(
      [statsResult, performanceResult, whatsAppResult, trafficResult, funnelResult]
        .some((result) => result.status === 'rejected')
    );
    setIsLoading(false);
    setIsRefreshing(false);
  }, [startDate, endDate]);

  useEffect(() => {
    void fetchData();
    return () => {
      requestId.current += 1;
    };
  }, [fetchData]);

  const refresh = useCallback(() => {
    void fetchData(true);
  }, [fetchData]);

  return {
    stats,
    performance,
    whatsAppStats,
    traffic,
    funnelStats,
    isLoading,
    isRefreshing,
    hasLoadError,
    refresh,
  };
};
