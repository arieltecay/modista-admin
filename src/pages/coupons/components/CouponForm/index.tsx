import { useState } from 'react';
import FormField from '../FormField';
import { generateCode, todayLocalDay } from '../../utils/format';
import { toCreateData, validateCouponForm } from '../../utils/validation';
import type { CouponFormErrors, CouponFormValues, CouponKind } from '../../types';
import type { CouponFormProps } from './types';

const INPUT = 'w-full min-w-0 rounded-md border border-gray-300 px-3 py-2 text-sm';
const KINDS: Array<{ value: CouponKind; label: string }> = [
  { value: 'percent', label: 'Porcentaje (%)' },
  { value: 'fixed', label: 'Monto fijo ($)' },
];

export const CouponForm = ({ courses, submitting, onSubmit, onCancel, serverError }: CouponFormProps) => {
  const [values, setValues] = useState<CouponFormValues>({
    code: '', type: 'percent', value: '', courseId: '', startsAt: todayLocalDay(), endsAt: '', maxUses: '',
  });
  const [errors, setErrors] = useState<CouponFormErrors>({});

  const set = (field: keyof CouponFormValues) => (event: { target: { value: string } }) =>
    setValues((previous) => ({ ...previous, [field]: event.target.value }));

  const handleSubmit = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    const found = validateCouponForm(values, courses);
    setErrors(found);
    if (Object.keys(found).length === 0) onSubmit(toCreateData(values));
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <FormField id="coupon-code" label="Código" error={errors.code}>
        <div className="flex gap-2">
          <input id="coupon-code" value={values.code} onChange={set('code')} className={INPUT} autoComplete="off" />
          <button type="button" onClick={() => setValues((previous) => ({ ...previous, code: generateCode() }))} className="shrink-0 rounded-md border px-3 text-sm font-medium">
            Generar código
          </button>
        </div>
      </FormField>

      <fieldset className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
        <legend className="mb-1 font-medium text-gray-700">Tipo de descuento</legend>
        {KINDS.map((kind) => (
          <label key={kind.value} className="flex items-center gap-2">
            <input type="radio" name="coupon-type" value={kind.value} checked={values.type === kind.value} onChange={set('type')} />
            {kind.label}
          </label>
        ))}
      </fieldset>

      <FormField id="coupon-value" label="Valor" error={errors.value}>
        <input id="coupon-value" inputMode="numeric" value={values.value} onChange={set('value')} className={INPUT} />
      </FormField>

      <FormField id="coupon-course" label="Curso">
        <select id="coupon-course" value={values.courseId} onChange={set('courseId')} className={INPUT}>
          <option value="">Todos los cursos</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </select>
      </FormField>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField id="coupon-starts" label="Desde" error={errors.startsAt}>
          <input id="coupon-starts" type="date" value={values.startsAt} onChange={set('startsAt')} className={INPUT} />
        </FormField>
        <FormField id="coupon-ends" label="Hasta" error={errors.endsAt}>
          <input id="coupon-ends" type="date" value={values.endsAt} onChange={set('endsAt')} className={INPUT} />
        </FormField>
      </div>

      <FormField id="coupon-max" label="Máximo de usos (opcional)" error={errors.maxUses}>
        <input id="coupon-max" inputMode="numeric" value={values.maxUses} onChange={set('maxUses')} className={INPUT} />
      </FormField>

      {serverError && (
        <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {serverError}
        </p>
      )}

      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="rounded-md border px-4 py-2 text-sm font-medium">
          Cancelar
        </button>
        <button type="submit" disabled={submitting} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
          {submitting ? 'Creando…' : 'Crear cupón'}
        </button>
      </div>
    </form>
  );
};

export default CouponForm;
