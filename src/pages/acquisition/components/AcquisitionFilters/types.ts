export interface FiltersView {
  from: string;
  to: string;
  timezone: string;
  reportingMode: 'acquisition_cohort' | 'event_period';
  outcomeWindowDays: 7 | 30;
  perspective: 'visit_touch' | 'first_touch' | 'last_non_direct';
  channel?: string;
  campaign?: string;
  landing?: string;
  device?: 'mobile' | 'desktop' | 'tablet' | 'unknown';
}

export type FiltersPatchView = { [Key in keyof FiltersView]?: FiltersView[Key] | undefined };

export interface AcquisitionFiltersProps {
  filters: FiltersView;
  onChange: (patch: FiltersPatchView) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export interface TextFilterProps {
  id: string;
  label: string;
  className: string;
  controlClassName: string;
  onApply: (value: string | undefined) => void;
  value?: string;
}
