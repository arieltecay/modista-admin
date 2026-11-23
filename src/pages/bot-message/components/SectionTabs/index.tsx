import type { SectionTabsProps } from './types';

/** Tabs of the Messages section. On phones they wrap in a 2×2 grid so none is off-screen. */
export const SectionTabs = <T extends string>({ tabs, active, onChange }: SectionTabsProps<T>) => (
  <div role="tablist" aria-label="Secciones de mensajes" className="grid grid-cols-2 gap-1 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm sm:flex sm:w-fit">
    {tabs.map(tab => {
      const selected = tab.id === active;
      return (
        <button
          key={tab.id}
          type="button"
          role="tab"
          id={`tab-${tab.id}`}
          aria-selected={selected}
          aria-controls={`panel-${tab.id}`}
          onClick={() => onChange(tab.id)}
          className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 sm:px-5 ${
            selected ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span aria-hidden="true">{tab.icon}</span>
          {tab.label}
        </button>
      );
    })}
  </div>
);
