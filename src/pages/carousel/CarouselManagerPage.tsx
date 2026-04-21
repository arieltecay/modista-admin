import React, { useState, useEffect, Fragment } from 'react';
import { carouselService } from '@/services/carouselService';
import { CarouselSlide, CarouselSlideFormData } from './types';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PlusIcon, PencilIcon, TrashIcon, Bars3Icon, EyeIcon, EyeSlashIcon, XMarkIcon, CalendarIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import CloudinaryImageUploader from '@/components/shared/CloudinaryImageUploader';
import { getCourses } from '@/services/courses/coursesService';
import { Switch } from '@headlessui/react';

const slideSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio'),
  subtitle: z.string().optional(),
  imageUrl: z.string().url('URL de imagen no válida'),
  imagePublicId: z.string().min(1, 'La imagen es obligatoria'),
  link: z.string().min(1, 'El enlace es obligatorio'),
  buttonText: z.string().min(1, 'El texto del botón es obligatorio'),
  isActive: z.boolean().default(true),
  publishAt: z.string().optional().nullable(),
  expireAt: z.string().optional().nullable(),
});

type SlideFormValues = z.infer<typeof slideSchema>;

const SortableSlide = ({ slide, onEdit, onDelete }: { slide: CarouselSlide; onEdit: (s: CarouselSlide) => void; onDelete: (id: string) => void; }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: slide._id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : 'auto', opacity: isDragging ? 0.5 : 1 };
  
  return (
    <div ref={setNodeRef} style={style} className="bg-white border border-gray-200 rounded-2xl p-4 mb-3 flex items-center gap-4 group hover:shadow-md transition-shadow">
      <div {...attributes} {...listeners} className="cursor-grab p-2 text-gray-400 hover:text-indigo-600 transition-colors">
        <Bars3Icon className="w-6 h-6" />
      </div>
      <div className="w-24 h-16 rounded-xl bg-gray-100 overflow-hidden border border-gray-100 flex-shrink-0">
        <img src={slide.imageUrl} className="w-full h-full object-cover" alt={slide.title} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-gray-900 truncate">{slide.title}</h3>
          {!slide.isActive && <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold uppercase">Inactivo</span>}
        </div>
        <p className="text-xs text-gray-500 truncate">{slide.link}</p>
      </div>
      <div className="flex gap-2">
        <button onClick={() => onEdit(slide)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors">
          <PencilIcon className="w-5 h-5" />
        </button>
        <button onClick={() => onDelete(slide._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors">
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export const CarouselManagerPage = () => {
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<CarouselSlide | null>(null);
  const [courses, setCourses] = useState<any[]>([]);

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  
  const { register, handleSubmit, setValue, watch, reset, control, formState: { errors, isSubmitting } } = useForm<SlideFormValues>({ 
    resolver: zodResolver(slideSchema),
    defaultValues: { 
      buttonText: 'Ver más', 
      isActive: true,
      title: '',
      subtitle: '',
      imageUrl: '',
      imagePublicId: '',
      link: ''
    } 
  });

  const watchImageUrl = watch('imageUrl');

  useEffect(() => { 
    loadSlides(); 
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const data = await getCourses();
      setCourses(data);
    } catch (e) {}
  };

  const loadSlides = async () => {
    try { 
      setLoading(true); 
      const data = await carouselService.getAllSlides(); 
      setSlides(data.sort((a, b) => a.order - b.order)); 
    } catch (e) {
      toast.error('Error al cargar slides');
    } finally { 
      setLoading(false); 
    }
  };

  const openModal = (slide: CarouselSlide | null = null) => {
    if (slide) {
      setEditingSlide(slide);
      reset({
        title: slide.title,
        subtitle: slide.subtitle || '',
        imageUrl: slide.imageUrl,
        imagePublicId: slide.imagePublicId,
        link: slide.link,
        buttonText: slide.buttonText,
        isActive: slide.isActive,
        publishAt: slide.publishAt ? new Date(slide.publishAt).toISOString().split('T')[0] : '',
        expireAt: slide.expireAt ? new Date(slide.expireAt).toISOString().split('T')[0] : '',
      });
    } else {
      setEditingSlide(null);
      reset({ 
        buttonText: 'Ver más', 
        isActive: true,
        title: '',
        subtitle: '',
        imageUrl: '',
        imagePublicId: '',
        link: ''
      });
    }
    setIsModalOpen(true);
  };

  const onSubmit = async (data: SlideFormValues) => {
    try {
      const payload = {
        ...data,
        publishAt: data.publishAt || undefined,
        expireAt: data.expireAt || undefined,
      };

      if (editingSlide) {
        await carouselService.updateSlide(editingSlide._id, payload as any);
        toast.success('Slide actualizado exitosamente');
      } else {
        await carouselService.createSlide(payload as any);
        toast.success('Slide creado exitosamente');
      }
      setIsModalOpen(false);
      loadSlides();
    } catch (e: any) { 
      toast.error(e.message || 'Error al guardar el slide'); 
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este slide?')) { 
      try { 
        await carouselService.deleteSlide(id); 
        setSlides(prev => prev.filter(s => s._id !== id));
        toast.success('Slide eliminado');
      } catch (e) {
        toast.error('Error al eliminar');
      } 
    }
  };

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = slides.findIndex(s => s._id === active.id);
      const newIndex = slides.findIndex(s => s._id === over.id);
      const newArray = arrayMove(slides, oldIndex, newIndex);
      setSlides(newArray);
      
      try {
        await carouselService.reorderSlides(newArray.map((s, i) => ({ slideId: s._id, order: i })));
        toast.success('Orden actualizado');
      } catch (e) {
        toast.error('Error al guardar el nuevo orden');
        loadSlides();
      }
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Gestión de Carrusel</h1>
          <p className="text-gray-500">Ordena y administra las imágenes de la página principal.</p>
        </div>
        <button 
          onClick={() => openModal()} 
          className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Nuevo Slide
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="bg-gray-50/50 p-4 rounded-[2rem] border border-gray-100">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={slides.map(s => s._id)} strategy={verticalListSortingStrategy}>
              <AnimatePresence>
                {slides.map(s => (
                  <motion.div key={s._id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
                    <SortableSlide slide={s} onEdit={openModal} onDelete={handleDelete} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </SortableContext>
          </DndContext>
          {slides.length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
              <p className="text-gray-400 font-medium">No hay slides configurados.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal de Formulario */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden relative flex flex-col">
              <header className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                <h2 className="text-xl font-bold text-gray-900">{editingSlide ? 'Editar Slide' : 'Nuevo Slide'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><XMarkIcon className="w-6 h-6 text-gray-400" /></button>
              </header>

              <form onSubmit={handleSubmit(onSubmit)} className="p-8 overflow-y-auto custom-scrollbar space-y-8">
                {/* Imagen */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 uppercase tracking-wider ml-1">Imagen del Slide</label>
                  <CloudinaryImageUploader 
                    selectedImage={watchImageUrl} 
                    onImageSelect={(url, pid) => { 
                      setValue('imageUrl', url, { shouldValidate: true }); 
                      setValue('imagePublicId', pid, { shouldValidate: true }); 
                    }} 
                  />
                  {errors.imagePublicId && <p className="text-xs text-red-500 font-bold ml-1">{errors.imagePublicId.message}</p>}
                </div>

                {/* Textos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wider ml-1">Título Principal</label>
                    <input {...register('title')} className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 transition-all font-medium" placeholder="Ej: Curso de Costura Básica" />
                    {errors.title && <p className="text-xs text-red-500 font-bold ml-1">{errors.title.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wider ml-1">Subtítulo (Opcional)</label>
                    <input {...register('subtitle')} className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 transition-all font-medium" placeholder="Ej: Aprende desde cero" />
                  </div>
                </div>

                {/* Enlace y Botón */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wider ml-1">Enlace (URL o Ruta)</label>
                    <div className="relative">
                      <input {...register('link')} className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 transition-all font-medium" placeholder="Ej: /cursos/id" />
                      <select 
                        onChange={(e) => setValue('link', e.target.value)}
                        className="absolute right-2 top-1.5 bottom-1.5 bg-white border border-gray-200 rounded-xl text-[10px] font-bold px-2 uppercase cursor-pointer outline-none hover:bg-gray-50"
                      >
                        <option value="">Accesos Rápidos</option>
                        <option value="/">Inicio</option>
                        <option value="/cursos">Todos los Cursos</option>
                        <optgroup label="Cursos Específicos">
                          {courses.map(c => <option key={c.id || c._id} value={`/cursos/${c.id || c._id}`}>{c.title}</option>)}
                        </optgroup>
                      </select>
                    </div>
                    {errors.link && <p className="text-xs text-red-500 font-bold ml-1">{errors.link.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wider ml-1">Texto del Botón</label>
                    <input {...register('buttonText')} className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 transition-all font-medium" placeholder="Ej: Ver más" />
                    {errors.buttonText && <p className="text-xs text-red-500 font-bold ml-1">{errors.buttonText.message}</p>}
                  </div>
                </div>

                {/* Fechas y Estado */}
                <div className="bg-indigo-50/50 p-6 rounded-[2rem] border border-indigo-100/50 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-indigo-900">Estado del Slide</h4>
                      <p className="text-xs text-indigo-600/70 font-medium">Define si el slide es visible para los usuarios.</p>
                    </div>
                    <Controller
                      name="isActive"
                      control={control}
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          onChange={field.onChange}
                          className={`${field.value ? 'bg-indigo-600' : 'bg-gray-300'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
                        >
                          <span className={`${field.value ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                        </Switch>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-indigo-100/50">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-indigo-900 uppercase tracking-widest flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" /> Publicar desde
                      </label>
                      <input type="date" {...register('publishAt')} className="w-full bg-white border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 font-medium text-indigo-900 shadow-sm" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-indigo-900 uppercase tracking-widest flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" /> Expirar en
                      </label>
                      <input type="date" {...register('expireAt')} className="w-full bg-white border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 font-medium text-indigo-900 shadow-sm" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4 sticky bottom-0 bg-white">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all uppercase tracking-widest text-xs">Cancelar</button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="flex-[2] bg-indigo-600 text-white px-6 py-4 rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95 disabled:bg-gray-300 uppercase tracking-widest text-xs"
                  >
                    {isSubmitting ? 'Guardando...' : (editingSlide ? 'Actualizar Slide' : 'Crear Slide')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CarouselManagerPage;
