export interface Kpi {
  label: string;
  value: string;
}

export interface CouponKpisProps {
  /** Accessible name of the group of figures. */
  title: string;
  items: Kpi[];
}
