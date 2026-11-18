import { apiClient } from '../../../services/config/apiClient';
import type {
  ApiParams,
  ChannelsData,
  FunnelData,
  Envelope,
  JourneyDetailResponse,
  JourneysResponse,
  LiveResponse,
  OverviewData,
  QualityResponse,
  ReportResponse,
} from './types';

const BASE = '/admin/acquisition';

const withoutEmpty = (params: ApiParams): Record<string, string | number> =>
  Object.fromEntries(Object.entries(params).filter((entry): entry is [string, string | number] => entry[1] !== undefined && entry[1] !== ''));

// The response interceptor unwraps `response.data`; AxiosInstance's static type does not reflect that.
const get = <T,>(path: string, params: ApiParams, signal?: AbortSignal): Promise<T> =>
  apiClient.get(`${BASE}/${path}`, { params: withoutEmpty(params), signal }) as unknown as Promise<T>;

export const getOverview = (params: ApiParams, signal?: AbortSignal) => get<ReportResponse<OverviewData>>('overview', params, signal);
export const getChannels = (params: ApiParams, signal?: AbortSignal) => get<ReportResponse<ChannelsData>>('channels', params, signal);
export const getFunnel = (params: ApiParams, signal?: AbortSignal) => get<Envelope<FunnelData>>('funnel', params, signal);
export const getQuality = (params: ApiParams, signal?: AbortSignal) => get<QualityResponse>('quality', params, signal);
export const getJourneys = (params: ApiParams, signal?: AbortSignal) => get<JourneysResponse>('journeys', params, signal);
export const getLive = (params: { windowMinutes: number }, signal?: AbortSignal) => get<LiveResponse>('live', params, signal);

export const getJourney = (visitId: string, signal?: AbortSignal) =>
  get<JourneyDetailResponse>(`journeys/${encodeURIComponent(visitId)}`, {}, signal);
