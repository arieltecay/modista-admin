import { apiClient } from '../config/apiClient';

type DashboardEndpoint =
  | '/dashboard/stats'
  | '/dashboard/performance'
  | '/dashboard/meta-whatsapp'
  | '/funnel/stats';

interface DashboardDateRange {
  startDate: string;
  endDate: string;
}

// The response interceptor unwraps response.data; AxiosInstance's static type does not reflect that.
export const getDashboardData = <T,>(
  endpoint: DashboardEndpoint,
  params: DashboardDateRange
): Promise<T> => apiClient.get<T>(endpoint, { params }) as unknown as Promise<T>;
