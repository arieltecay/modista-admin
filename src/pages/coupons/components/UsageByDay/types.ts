export interface UsageByDayProps {
  /** Usos pagos por día local `YYYY-MM-DD`, de menor a mayor. */
  days: Array<{ day: string; uses: number }>;
}
