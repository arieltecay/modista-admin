import { formatInteger, formatMinute } from '../../utils/format';
import { CHANNEL_LABELS, STEP_LABELS, labelOf } from '../../utils/labels';
import type { LiveActivityProps } from './types';

const WINDOWS = [5, 15, 30, 60];

export const LiveActivity = ({ data, windowMinutes, timezone, onWindowChange }: LiveActivityProps) => {
  const peak = Math.max(1, ...data.eventsPerMinute.map((entry) => entry.count));
  const isIdle = data.activeVisits === 0 && data.eventsInWindow === 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <dl className="flex gap-6">
          <div>
            <dt className="text-xs font-medium text-slate-500">Visitas activas</dt>
            <dd className="text-2xl font-bold text-slate-900">{formatInteger(data.activeVisits)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500">Eventos en la ventana</dt>
            <dd className="text-2xl font-bold text-slate-900">{formatInteger(data.eventsInWindow)}</dd>
          </div>
        </dl>
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
          Ventana
          <select
            value={windowMinutes}
            onChange={(event) => onWindowChange(Number(event.target.value))}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-800"
          >
            {WINDOWS.map((minutes) => <option key={minutes} value={minutes}>{minutes} min</option>)}
          </select>
        </label>
      </div>

      {isIdle ? (
        <p className="text-sm text-slate-500">Sin actividad en esta ventana.</p>
      ) : (
        <>
          <div className="flex h-20 items-end gap-0.5" aria-label="Eventos por minuto">
            {data.eventsPerMinute.map((entry) => (
              <div
                key={entry.minute}
                role="img"
                aria-label={`Eventos a las ${formatMinute(entry.minute, timezone)}: ${entry.count}`}
                className="flex-1 rounded-t bg-indigo-400"
                style={{ height: `${Math.max(2, Math.round((entry.count / peak) * 100))}%` }}
              />
            ))}
          </div>
          {data.activeByChannel.length > 0 && (
            <ul className="flex flex-wrap gap-2 text-xs">
              {data.activeByChannel.map((entry) => (
                <li key={entry.channelGroup} className="rounded-full bg-slate-100 px-3 py-1">
                  <span>{labelOf(CHANNEL_LABELS, entry.channelGroup)}</span> <strong>{entry.count}</strong>
                </li>
              ))}
            </ul>
          )}
          <ul className="divide-y divide-slate-100 text-sm">
            {data.recentEvents.map((event, index) => (
              <li key={`${event.at}-${event.visit}-${event.name}-${index}`} className="flex flex-wrap items-baseline justify-between gap-2 py-1.5">
                <span className="font-medium text-slate-800">{labelOf(STEP_LABELS, event.name)}</span>
                <span className="min-w-0 break-words text-xs text-slate-500">
                  {formatMinute(event.at, timezone)} · {event.visit}
                  {event.channelGroup ? ` · ${labelOf(CHANNEL_LABELS, event.channelGroup)}` : ''}
                  {event.path ? ` · ${event.path}` : ''}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};
