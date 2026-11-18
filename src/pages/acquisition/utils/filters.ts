import type { AcquisitionFilters, Device, FiltersPatch, Perspective, ReportingMode } from '../types';
import { CHANNEL_LABELS } from './labels';

export const DEFAULT_TIMEZONE = 'America/Argentina/Tucuman';

/** The API answers 400 for longer ranges, so the panel never asks for them. */
export const MAX_RANGE_DAYS = 92;
const MIN_YEAR = 1900;
const MAX_YEAR = 2100;
const DAY_MS = 86_400_000;
const MAX_TEXT_LENGTH = 120;
const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MODES: readonly ReportingMode[] = ['acquisition_cohort', 'event_period'];
const PERSPECTIVES: readonly Perspective[] = ['visit_touch', 'first_touch', 'last_non_direct'];
const DEVICES: readonly Device[] = ['mobile', 'desktop', 'tablet', 'unknown'];

/** The calendar day an instant falls on in `timezone` (not the browser's, not UTC's). */
export const localDate = (date: Date, timezone: string): string =>
  new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);

export const shiftDays = (day: string, delta: number): string => {
  const [year, month, date] = day.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, date + delta)).toISOString().slice(0, 10);
};

const isRealDay = (value: string | null): value is string => {
  if (!value || !DAY_PATTERN.test(value)) return false;
  const [year, month, date] = value.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, date));
  return year >= MIN_YEAR && year <= MAX_YEAR && parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === date;
};

const isKnownTimezone = (value: string | null): value is string => {
  if (!value) return false;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: value });
    return true;
  } catch {
    return false;
  }
};

export const defaultFilters = (today: Date, timezone = DEFAULT_TIMEZONE): AcquisitionFilters => {
  const to = localDate(today, timezone);
  return { from: shiftDays(to, -29), to, timezone, reportingMode: 'acquisition_cohort', outcomeWindowDays: 30, perspective: 'visit_touch' };
};

const spanInDays = (from: string, to: string): number => (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY_MS + 1;

const oneOf = <T extends string>(allowed: readonly T[], value: string | null): T | undefined =>
  allowed.find((candidate) => candidate === value);

const text = (value: string | null): string | undefined => value?.trim().slice(0, MAX_TEXT_LENGTH) || undefined;

/** Reads the filters from the URL; anything invalid falls back to the default instead of breaking the page. */
export const parseFilters = (params: URLSearchParams, today: Date): AcquisitionFilters => {
  const timezoneParam = params.get('timezone');
  const timezone = isKnownTimezone(timezoneParam) ? timezoneParam : DEFAULT_TIMEZONE;
  const defaults = defaultFilters(today, timezone);
  const from = params.get('from');
  const to = params.get('to');
  const validRange = isRealDay(from) && isRealDay(to) && from <= to && spanInDays(from, to) <= MAX_RANGE_DAYS;

  return {
    from: validRange ? from : defaults.from,
    to: validRange ? to : defaults.to,
    timezone,
    reportingMode: oneOf(MODES, params.get('reportingMode')) ?? defaults.reportingMode,
    outcomeWindowDays: params.get('outcomeWindowDays') === '7' ? 7 : 30,
    perspective: oneOf(PERSPECTIVES, params.get('perspective')) ?? defaults.perspective,
    channel: oneOf(Object.keys(CHANNEL_LABELS), params.get('channel')),
    campaign: text(params.get('campaign')),
    landing: text(params.get('landing')),
    device: oneOf(DEVICES, params.get('device')),
  };
};

const definedEntries = (values: Record<string, string | number | undefined>): Array<[string, string | number]> =>
  Object.entries(values).filter((entry): entry is [string, string | number] => entry[1] !== undefined);

export const serializeFilters = (filters: AcquisitionFilters): URLSearchParams =>
  new URLSearchParams(definedEntries({ ...filters }).map(([key, value]) => [key, String(value)]));

export const applyPatch = (filters: AcquisitionFilters, patch: FiltersPatch): AcquisitionFilters => {
  const next = { ...filters, ...patch };
  // Moving one end past the other, or too far from it, drags the other end along instead of discarding the range.
  if (patch.from && next.from > next.to) next.to = next.from;
  if (patch.to && next.to < next.from) next.from = next.to;
  if (spanInDays(next.from, next.to) > MAX_RANGE_DAYS) {
    if (patch.from) next.to = shiftDays(next.from, MAX_RANGE_DAYS - 1);
    else next.from = shiftDays(next.to, -(MAX_RANGE_DAYS - 1));
  }
  return next;
};

const VISIT_FILTER_KEYS = ['channel', 'campaign', 'landing', 'device'] as const;

/** Query for overview, channels and funnel; the window only means something for a cohort. */
export const toApiParams = (filters: AcquisitionFilters): Record<string, string | number> =>
  Object.fromEntries(
    definedEntries({
      from: filters.from,
      to: filters.to,
      timezone: filters.timezone,
      reportingMode: filters.reportingMode,
      perspective: filters.perspective,
      outcomeWindowDays: filters.reportingMode === 'acquisition_cohort' ? filters.outcomeWindowDays : undefined,
      ...Object.fromEntries(VISIT_FILTER_KEYS.map((key) => [key, filters[key]])),
    }),
  );

export const toRangeParams = (filters: AcquisitionFilters): Record<string, string> => ({
  from: filters.from,
  to: filters.to,
  timezone: filters.timezone,
});

export const toJourneyParams = (filters: AcquisitionFilters, page: number, limit: number): Record<string, string | number> => ({
  ...toRangeParams(filters),
  ...Object.fromEntries(definedEntries(Object.fromEntries(VISIT_FILTER_KEYS.map((key) => [key, filters[key]])))),
  page,
  limit,
});
