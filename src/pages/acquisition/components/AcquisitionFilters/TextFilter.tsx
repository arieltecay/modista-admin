import { useEffect, useRef } from 'react';
import type { TextFilterProps } from './types';

/** Applied on blur or Enter, not per keystroke; follows the URL without remounting, so focus is never lost. */
export const TextFilter = ({ id, label, value, onApply, className, controlClassName }: TextFilterProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const input = inputRef.current;
    if (input && document.activeElement !== input) input.value = value ?? '';
  }, [value]);

  return (
    <div className={className}>
      <label htmlFor={id}>{label}</label>
      <input
        ref={inputRef}
        id={id}
        type="text"
        maxLength={120}
        className={controlClassName}
        defaultValue={value ?? ''}
        onBlur={(event) => onApply(event.target.value.trim() || undefined)}
        onKeyDown={(event) => event.key === 'Enter' && onApply(event.currentTarget.value.trim() || undefined)}
      />
    </div>
  );
};
