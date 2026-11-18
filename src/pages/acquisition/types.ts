export type ReportingMode = 'acquisition_cohort' | 'event_period';
export type Perspective = 'visit_touch' | 'first_touch' | 'last_non_direct';
export type Device = 'mobile' | 'desktop' | 'tablet' | 'unknown';

/** Everything the panel filters by; it lives in the URL so a view can be shared. */
export interface AcquisitionFilters {
  from: string;
  to: string;
  timezone: string;
  reportingMode: ReportingMode;
  outcomeWindowDays: 7 | 30;
  perspective: Perspective;
  channel?: string;
  campaign?: string;
  landing?: string;
  device?: Device;
}

export type FiltersPatch = { [Key in keyof AcquisitionFilters]?: AcquisitionFilters[Key] | undefined };
