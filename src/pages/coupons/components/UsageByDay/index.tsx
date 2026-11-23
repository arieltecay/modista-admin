import { formatDate } from '../../utils/format';
import type { UsageByDayProps } from './types';

/** El día viene como `YYYY-MM-DD` local: se muestra tal cual, sin pasar por zonas horarias. */
const dayLabel = (day: string): string => formatDate(`${day}T12:00:00-03:00`);

export const UsageByDay = ({ days }: UsageByDayProps) => {
  const peak = Math.max(...days.map((entry) => entry.uses), 1);
  return (
    <ul className="space-y-2">
      {days.map((entry) => (
        <li key={entry.day} data-testid="usage-day" className="flex items-center gap-3 text-sm">
          <span className="w-24 shrink-0 text-gray-600">{dayLabel(entry.day)}</span>
          <span className="h-3 flex-1 overflow-hidden rounded bg-gray-100" aria-hidden="true">
            <span className="block h-full rounded bg-indigo-500" style={{ width: `${(entry.uses / peak) * 100}%` }} />
          </span>
          <span className="w-8 text-right font-semibold text-gray-900">{entry.uses}</span>
        </li>
      ))}
    </ul>
  );
};

export default UsageByDay;
