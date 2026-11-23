import type { FormFieldProps } from './types';

export const FormField = ({ id, label, children, error }: FormFieldProps) => (
  <div className="flex flex-col gap-1">
    <label htmlFor={id} className="text-sm font-medium text-gray-700">
      {label}
    </label>
    {children}
    {error && (
      <p role="alert" className="text-xs text-red-600">
        {error}
      </p>
    )}
  </div>
);

export default FormField;
