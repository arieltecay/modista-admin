import * as yup from 'yup';

export const sanitizeText = (text: string | undefined): string => {
  if (!text) return '';
  return text
    .trim()
    .replace(/[<>]/g, '');
};

export const courseSchema = yup.object({
  title: yup
    .string()
    .required('El título es obligatorio')
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(100, 'El título no puede exceder 100 caracteres')
    .transform(sanitizeText),

  shortDescription: yup
    .string()
    .required('La descripción corta es obligatoria')
    .min(10, 'La descripción corta debe tener al menos 10 caracteres')
    .max(250, 'La descripción corta no puede exceder 250 caracteres')
    .transform(sanitizeText),

  longDescription: yup
    .string()
    .required('La descripción larga es obligatoria')
    .min(50, 'La descripción larga debe tener al menos 50 caracteres')
    .transform(sanitizeText),

  imageUrl: yup
    .string()
    .url('Debe ser una URL válida')
    .required('Debe seleccionar una imagen'),

  imagePublicId: yup
    .string()
    .optional(),

  category: yup
    .string()
    .required('La categoría es obligatoria')
    .min(2, 'La categoría debe tener al menos 2 caracteres')
    .max(50, 'La categoría no puede exceder 50 caracteres')
    .transform(sanitizeText),

  price: yup
    .number()
    .required('El precio es obligatorio')
    .min(0, 'El precio no puede ser negativo')
    .max(999999, 'El precio no puede exceder $999,999')
    .typeError('El precio debe ser un número válido'),

  deeplink: yup
    .string()
    .optional()
    .url('El enlace debe ser una URL válida')
    .nullable()
    .transform((value) => value === '' ? undefined : value),

  videoUrl: yup
    .string()
    .optional()
    .url('La URL del video debe ser una URL válida')
    .nullable()
    .transform((value) => value === '' ? undefined : value),

  coursePaid: yup
    .string()
    .optional()
    .url('El link del curso pagado debe ser una URL válida')
    .nullable()
    .transform((value) => value === '' ? undefined : value),

  isPresencial: yup
    .boolean()
    .default(false),

  status: yup
    .string()
    .oneOf(['active', 'inactive'], 'Estado inválido')
    .default('active'),
});

export const defaultCourseValues = {
  title: '',
  shortDescription: '',
  longDescription: '',
  imageUrl: '',
  imagePublicId: '',
  category: '',
  price: '',
  deeplink: '',
  videoUrl: '',
  coursePaid: '',
  isPresencial: false,
  status: 'active',
};
