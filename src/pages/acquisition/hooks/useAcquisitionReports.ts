import { getChannels, getFunnel, getJourney, getJourneys, getOverview, getQuality } from '../services';
import type { AcquisitionFilters } from '../types';
import { toApiParams, toJourneyParams, toRangeParams } from '../utils/filters';
import { useReport } from './useReport';

export const JOURNEYS_PER_PAGE = 20;

/** The four reports that follow the filters. Each loads and fails on its own. */
export const useAcquisitionReports = (filters: AcquisitionFilters) => {
  const params = toApiParams(filters);
  const range = toRangeParams(filters);
  const key = JSON.stringify(params);

  return {
    overview: useReport((signal) => getOverview(params, signal), `overview-${key}`),
    channels: useReport((signal) => getChannels(params, signal), `channels-${key}`),
    funnel: useReport((signal) => getFunnel(params, signal), `funnel-${key}`),
    quality: useReport((signal) => getQuality(range, signal), `quality-${JSON.stringify(range)}`),
  };
};

export const useJourneyList = (filters: AcquisitionFilters, page: number) => {
  const params = toJourneyParams(filters, page, JOURNEYS_PER_PAGE);
  // Turning the page keeps the table (and the pagination buttons) while the next page loads; new filters reset it.
  const scope = `journeys-${JSON.stringify(toJourneyParams(filters, 0, JOURNEYS_PER_PAGE))}`;
  return useReport((signal) => getJourneys(params, signal), `journeys-${JSON.stringify(params)}`, true, scope);
};

export const useJourneyDetail = (visitId: string | null) =>
  useReport((signal) => getJourney(visitId ?? '', signal), `journey-${visitId}`, visitId !== null);
