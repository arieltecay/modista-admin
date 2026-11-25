import { useId } from 'react';
import type { ReactNode } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { MAX_RANGE_DAYS, shiftDays } from '../../utils/filters';
import { CHANNEL_LABELS, DEVICE_LABELS } from '../../utils/labels';
import { TextFilter } from './TextFilter';
import type { AcquisitionFiltersProps, FiltersPatchView, FiltersView } from './types';

const TIMEZONES = ['America/Argentina/Tucuman', 'America/Argentina/Buenos_Aires', 'UTC'];
const MODES = [['acquisition_cohort', 'Cohorte de adquisición'], ['event_period', 'Eventos del período']] as const;
const PERSPECTIVES = [['visit_touch', 'Origen de la propia visita'], ['first_touch', 'Primer origen conocido'], ['last_non_direct', 'Último origen no directo']] as const;
const FIELD = 'flex min-w-0 flex-col gap-1 text-xs font-medium text-slate-500';
const CONTROL = 'w-full min-w-0 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-800 focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-400';

export const AcquisitionFilters = ({ filters, onChange, onRefresh, isRefreshing }: AcquisitionFiltersProps) => {
  const id = useId();
  const field = (name: string, label: string, control: ReactNode) => (
    <div className={FIELD} key={name}>
      <label htmlFor={`${id}-${name}`}>{label}</label>
      {control}
    </div>
  );
  const select = (name: string, label: string, value: string, options: ReadonlyArray<readonly [string, string]>, change: (value: string) => FiltersPatchView, disabled = false) =>
    field(name, label, (
      <select id={`${id}-${name}`} className={CONTROL} value={value} disabled={disabled} onChange={(event) => onChange(change(event.target.value))}>
        {options.map(([optionValue, optionLabel]) => <option key={optionValue} value={optionValue}>{optionLabel}</option>)}
      </select>
    ));
  const date = (name: 'from' | 'to', label: string) =>
    field(name, label, (
      <input
        id={`${id}-${name}`}
        type="date"
        className={CONTROL}
        value={filters[name]}
        // The API answers 400 beyond the maximum range, so the pickers stop short of it.
        min={name === 'from' ? shiftDays(filters.to, -(MAX_RANGE_DAYS - 1)) : filters.from}
        max={name === 'from' ? filters.to : shiftDays(filters.from, MAX_RANGE_DAYS - 1)}
        onChange={(event) => event.target.value && onChange({ [name]: event.target.value })}
      />
    ));
  const text = (name: 'campaign' | 'landing', label: string) => (
    <TextFilter
      key={name}
      id={`${id}-${name}`}
      label={label}
      value={filters[name]}
      className={FIELD}
      controlClassName={CONTROL}
      onApply={(value) => onChange({ [name]: value })}
    />
  );

  const channels = [['', 'Todos'], ...Object.entries(CHANNEL_LABELS)] as Array<readonly [string, string]>;
  const devices = [['', 'Todos'], ...Object.entries(DEVICE_LABELS)] as Array<readonly [string, string]>;
  const timezones = (TIMEZONES.includes(filters.timezone) ? TIMEZONES : [filters.timezone, ...TIMEZONES]).map((zone) => [zone, zone] as const);

  return (
    <form className="grid grid-cols-2 gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-3 lg:grid-cols-5" onSubmit={(event) => event.preventDefault()}>
      {date('from', 'Desde')}
      {date('to', 'Hasta')}
      {select('timezone', 'Zona horaria', filters.timezone, timezones, (value) => ({ timezone: value }))}
      {select('mode', 'Modo de reporte', filters.reportingMode, MODES, (value) => ({ reportingMode: value as FiltersView['reportingMode'] }))}
      {select('window', 'Ventana de resultados', String(filters.outcomeWindowDays), [['7', '7 días'], ['30', '30 días']], (value) => ({ outcomeWindowDays: value === '7' ? 7 : 30 }), filters.reportingMode === 'event_period')}
      {select('perspective', 'Perspectiva de atribución', filters.perspective, PERSPECTIVES, (value) => ({ perspective: value as FiltersView['perspective'] }))}
      {select('channel', 'Canal', filters.channel ?? '', channels, (value) => ({ channel: value || undefined }))}
      {text('campaign', 'Campaña')}
      {text('landing', 'Landing')}
      {select('device', 'Dispositivo', filters.device ?? '', devices, (value) => ({ device: (value || undefined) as FiltersView['device'] }))}
      <div className="flex items-end">
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          aria-label="Actualizar"
          className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-wait disabled:opacity-50"
        >
          <ArrowPathIcon aria-hidden="true" className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>
    </form>
  );
};
