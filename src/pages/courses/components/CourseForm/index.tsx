import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { courseSchema, defaultCourseValues } from '@/pages/courses/validation/courseValidation';
import CloudinaryImageUploader from '@/components/shared/CloudinaryImageUploader';
import { CourseFormProps } from './types';
import FormattingGuide from './FormattingGuide';

const CourseForm: React.FC<CourseFormProps> = ({ initialData = {}, onSubmit, isEditing = false, isSubmitting = false }) => {
  const { control, handleSubmit, formState: { errors, isValid }, watch, setValue, reset } = useForm({
    resolver: yupResolver(courseSchema),
    defaultValues: { ...defaultCourseValues, ...initialData },
    mode: 'onChange'
  });

  const isPresencial = watch('isPresencial');
  const status = watch('status');

  const handleImageSelect = (imageUrl: string, publicId: string) => {
    setValue('imageUrl', imageUrl, { shouldValidate: true });
    setValue('imagePublicId', publicId, { shouldValidate: true });
  };

  const handleFormSubmit = async (data: Record<string, any>) => {
    const formData = {
      ...data,
      price: parseFloat(data.price),
    };
    await onSubmit(formData);
    if (!isEditing) reset(defaultCourseValues);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      {/* Sección de Imagen */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-700 uppercase tracking-wider ml-1">Imagen del Curso</label>
        <Controller name="imageUrl" control={control} render={({ field }) => (
          <CloudinaryImageUploader selectedImage={field.value} onImageSelect={handleImageSelect} />
        )} />
        {errors.imageUrl && <p className="text-xs text-red-500 font-bold ml-1">{errors.imageUrl.message as string}</p>}
      </div>

      {/* Información Básica */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-2">
          <label className="text-sm font-bold text-gray-700 uppercase tracking-wider ml-1">Título del Curso</label>
          <Controller name="title" control={control} render={({ field }) => (
            <input {...field} className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 transition-all font-medium" placeholder="Ej: Fundas para máquinas" />
          )} />
          {errors.title && <p className="text-xs text-red-500 font-bold ml-1">{errors.title.message as string}</p>}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 uppercase tracking-wider ml-1">Precio</label>
          <Controller name="price" control={control} render={({ field }) => (
            <input type="number" {...field} className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-lg" placeholder="0.00" />
          )} />
          {errors.price && <p className="text-xs text-red-500 font-bold ml-1">{errors.price.message as string}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-700 uppercase tracking-wider ml-1">Categoría</label>
        <Controller name="category" control={control} render={({ field }) => (
          <input {...field} className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 transition-all font-medium" placeholder="Ej: Accesorios, Básicos, etc." />
        )} />
        {errors.category && <p className="text-xs text-red-500 font-bold ml-1">{errors.category.message as string}</p>}
      </div>

      {/* Descripciones */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-700 uppercase tracking-wider ml-1">Descripción Corta</label>
        <Controller name="shortDescription" control={control} render={({ field }) => (
          <textarea {...field} rows={2} className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 transition-all font-medium" placeholder="Resumen para la tarjeta del curso..." />
        )} />
        {errors.shortDescription && <p className="text-xs text-red-500 font-bold ml-1">{errors.shortDescription.message as string}</p>}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center mb-1">
          <label className="text-sm font-bold text-gray-700 uppercase tracking-wider ml-1">Descripción Larga (Detalles)</label>
          <FormattingGuide />
        </div>
        <Controller name="longDescription" control={control} render={({ field }) => (
          <textarea {...field} rows={6} className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 transition-all font-medium" placeholder="Explica todo lo que incluye el curso..." />
        )} />
        {errors.longDescription && <p className="text-xs text-red-500 font-bold ml-1">{errors.longDescription.message as string}</p>}
      </div>

      {/* Enlaces y Configuración Avanzada */}
      <div className="bg-white border border-gray-100 rounded-[2rem] p-6 space-y-6 shadow-sm">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">🔗</span>
          Enlaces y Configuración
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Link WhatsApp (Deeplink)</label>
            <Controller name="deeplink" control={control} render={({ field }) => (
              <input {...field} className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500" placeholder="https://wa.me/..." />
            )} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Link de Video (Presentación)</label>
            <Controller name="videoUrl" control={control} render={({ field }) => (
              <input {...field} className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500" placeholder="https://youtube.com/..." />
            )} />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 text-emerald-600">Link Acceso Curso Pago (Automático)</label>
          <Controller name="coursePaid" control={control} render={({ field }) => (
            <input {...field} className="w-full bg-emerald-50 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 font-medium" placeholder="Link que recibirá la alumna al pagar..." />
          )} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-50">
          <label className="flex items-center gap-3 cursor-pointer group">
            <Controller name="isPresencial" control={control} render={({ field }) => (
              <input 
                type="checkbox" 
                checked={field.value} 
                onChange={(e) => setValue('isPresencial', e.target.checked, { shouldDirty: true })} 
                className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
              />
            )} />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-700">{isPresencial ? 'Taller Presencial' : 'Curso On-line'}</span>
              <span className="text-[10px] text-gray-400 font-bold uppercase">{isPresencial ? 'Habilita gestión de turnos' : 'Contenido digital'}</span>
            </div>
          </label>

          <div className="flex items-center gap-3">
            <div className="flex flex-col flex-1">
              <span className="text-sm font-bold text-gray-700">Visibilidad</span>
              <span className="text-[10px] text-gray-400 font-bold uppercase">Estado actual en la web</span>
            </div>
            <Controller name="status" control={control} render={({ field }) => (
              <select 
                {...field} 
                className={`bg-gray-50 border-none rounded-xl px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-indigo-500 ${field.value === 'active' ? 'text-indigo-600' : 'text-gray-400'}`}
              >
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            )} />
          </div>
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="flex gap-4 pt-4">
        <button type="button" onClick={() => reset()} className="flex-1 px-6 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all uppercase tracking-widest text-xs border border-gray-100">Limpiar</button>
        <button 
          type="submit" 
          disabled={isSubmitting || !isValid} 
          className="flex-[2] bg-indigo-600 text-white px-6 py-4 rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95 disabled:bg-gray-300 uppercase tracking-widest text-xs"
        >
          {isSubmitting ? 'Guardando...' : (isEditing ? 'Actualizar Curso' : 'Crear Curso')}
        </button>
      </div>
    </form>
  );
};

export default CourseForm;
