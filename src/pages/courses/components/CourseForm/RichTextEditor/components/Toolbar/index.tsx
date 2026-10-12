import { TOOLBAR_ACTIONS } from '../../editor-utils';
import type { ToolbarActionGroup, ToolbarProps } from './types';

const GROUP_ORDER: ToolbarActionGroup[] = ['inline', 'block', 'color', 'font', 'cta'];

const Toolbar = ({ onAction }: ToolbarProps) => (
  <div className="flex flex-wrap items-center gap-1 rounded-xl border border-gray-100 bg-gray-50 p-1.5">
    {GROUP_ORDER.map((group, groupIndex) => (
      <div
        key={group}
        className={`flex items-center gap-1${groupIndex > 0 ? ' ml-0.5 border-l border-gray-200 pl-1.5' : ''}`}
      >
        {TOOLBAR_ACTIONS.filter((action) => action.group === group).map((action) => (
          <button
            key={action.id}
            type="button"
            title={action.title}
            onClick={() => onAction(action)}
            className="flex h-7 min-w-7 items-center justify-center rounded-lg px-1.5 text-xs font-bold text-gray-600 transition-all hover:bg-white hover:text-indigo-600 hover:shadow-sm active:scale-95"
          >
            {action.swatchClass ? (
              <span className={`block h-3.5 w-3.5 rounded-full ${action.swatchClass}`} />
            ) : (
              <span className={action.labelClassName}>{action.label}</span>
            )}
          </button>
        ))}
      </div>
    ))}
  </div>
);

export default Toolbar;
