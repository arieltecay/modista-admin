import type { CouponFormErrors, CouponFormValues, CourseOption, CreateCouponPayload } from '../types';
import { formatMoney, toEndOfDayIso, toStartOfDayIso } from './format';

const CODE_PATTERN = /^[A-Z0-9_-]{3,32}$/;
const MAX_PERCENT = 99;
const MAX_USES = 10000;

const isWholeNumber = (text: string): boolean => /^\d+$/.test(text.trim()) && Number(text) >= 1;

const valueError = ({ type, value, courseId }: CouponFormValues, courses: CourseOption[]): string | undefined => {
  if (!isWholeNumber(value)) return 'Ingresá un número entero mayor a 0';
  const amount = Number(value);
  if (type === 'percent') return amount > MAX_PERCENT ? `El porcentaje máximo es ${MAX_PERCENT}` : undefined;
  const price = courses.find((course) => course.id === courseId)?.price;
  return price !== undefined && amount >= price ? `El descuento debe ser menor al precio del curso (${formatMoney(price)})` : undefined;
};

/** Same rules as the API, so the admin sees the problem before sending; the server stays the authority. */
export const validateCouponForm = (values: CouponFormValues, courses: CourseOption[]): CouponFormErrors => {
  const errors: CouponFormErrors = {};

  if (!CODE_PATTERN.test(values.code.trim().toUpperCase())) {
    errors.code = 'Usá 3 a 32 letras, números, guion o guion bajo, sin espacios';
  }
  const value = valueError(values, courses);
  if (value) errors.value = value;
  if (!values.startsAt) errors.startsAt = 'Elegí la fecha de inicio';
  if (!values.endsAt) errors.endsAt = 'Elegí la fecha de fin';
  else if (values.startsAt && values.endsAt < values.startsAt) errors.endsAt = 'La fecha de fin no puede ser anterior a la de inicio';
  if (values.maxUses.trim() !== '' && !isWholeNumber(values.maxUses)) errors.maxUses = 'Ingresá un entero mayor a 0 o dejalo vacío';
  else if (Number(values.maxUses) > MAX_USES) errors.maxUses = 'El máximo de usos es 10.000';

  return errors;
};

/** Body for the API from values that already passed `validateCouponForm`. */
export const toCreateData = (values: CouponFormValues): CreateCouponPayload => ({
  code: values.code.trim().toUpperCase(),
  type: values.type,
  value: Number(values.value),
  startsAt: toStartOfDayIso(values.startsAt),
  endsAt: toEndOfDayIso(values.endsAt),
  courseId: values.courseId || null,
  maxUses: values.maxUses.trim() === '' ? null : Number(values.maxUses),
});
