import { FaInfoCircle } from 'react-icons/fa';
import type { HowItWorksProps } from './types';

/** Short explanation of when Mila answers on each channel. */
export const HowItWorks = ({ items }: HowItWorksProps) => (
  <div className="flex gap-3 rounded-2xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-900">
    <FaInfoCircle aria-hidden="true" className="mt-0.5 shrink-0" />
    <ul className="space-y-1">
      {items.map(item => (
        <li key={item.channel}>
          <strong>{item.channel}</strong> {item.text}
        </li>
      ))}
    </ul>
  </div>
);
