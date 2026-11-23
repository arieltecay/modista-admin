import { FaGraduationCap, FaTrash } from 'react-icons/fa';
import type { MessageBubbleProps } from './types';

const actionClass = 'flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500';

/** One message. Actions stay visible (not hover-only) so they work by touch and keyboard. */
export const MessageBubble = ({ id, body, time, inbound, kindLabel, failed, onDelete, onSaveAsFaq }: MessageBubbleProps) => (
  <li className={`flex ${inbound ? 'justify-start' : 'justify-end'}`}>
    <div className="max-w-[85%] space-y-1 sm:max-w-[75%]">
      <div
        className={`whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2.5 text-sm shadow-sm ${
          inbound ? 'rounded-tl-sm border border-slate-200 bg-white text-slate-800' : 'rounded-tr-sm bg-indigo-600 text-white'
        } ${failed ? 'ring-2 ring-red-400' : ''}`}
      >
        {kindLabel && (
          <p className={`mb-1 text-[11px] font-bold uppercase tracking-wide ${failed ? 'text-red-200' : inbound ? 'text-pink-600' : 'text-pink-100'}`}>{kindLabel}</p>
        )}
        {body}
      </div>
      <div className={`flex flex-wrap items-center gap-1 px-1 ${inbound ? '' : 'justify-end'}`}>
        <span className="text-xs text-slate-400">{time}</span>
        {onSaveAsFaq && (
          <button type="button" onClick={() => onSaveAsFaq(body)} className={`${actionClass} text-indigo-600 hover:bg-indigo-50`}>
            <FaGraduationCap aria-hidden="true" /> Guardar como FAQ
          </button>
        )}
        <button type="button" onClick={() => onDelete(id)} className={`${actionClass} text-slate-500 hover:bg-red-50 hover:text-red-600`}>
          <FaTrash aria-hidden="true" /> Borrar mensaje
        </button>
      </div>
    </div>
  </li>
);
