import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createLandingPage, getLandingPageById, updateLandingPage } from '@/services/landing';
import { getCoursesAdmin } from '@/services/courses/coursesService';
import toast from 'react-hot-toast';
import type { Course, LandingPage } from '@/services/types';
import { DevicePhoneMobileIcon, ComputerDesktopIcon, ArrowLeftIcon, ShieldCheckIcon, LockClosedIcon, CreditCardIcon } from '@heroicons/react/24/outline';

const LandingFormPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile');

  const [formData, setFormData] = useState<any>({
    title: '',
    slug: '',
    courseId: '',
    status: 'active',
    customTitle: '',
    customDescription: '',
    buttonText: 'INSCRIBIRME Y PAGAR',
    videoUrl: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const coursesRes = await getCoursesAdmin(1, 100);
        setCourses(coursesRes.data);

        if (isEdit && id) {
          const landingRes = await getLandingPageById(id);
          setFormData(landingRes.data);
        }
      } catch (err) {
        toast.error('Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => {
      const newData = { ...prev, [name]: value };
      
      // Auto-generar slug desde el título si no estamos editando
      if (name === 'title' && !isEdit) {
        newData.slug = value
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '') // Eliminar caracteres especiales
          .replace(/[\s_-]+/g, '-') // Reemplazar espacios y guiones bajos por guiones
          .replace(/^-+|-+$/g, ''); // Eliminar guiones al inicio y al final
      }
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit && id) {
        await updateLandingPage(id, formData);
        toast.success('Landing actualizada');
      } else {
        await createLandingPage(formData);
        toast.success('Landing creada exitosamente');
      }
      navigate('/admin/landings');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const selectedCourse = courses.find(c => (c.uuid || c._id || c.id) === formData.courseId);

  if (loading) return <div className="p-20 text-center font-bold text-gray-400 uppercase tracking-widest">Cargando editor...</div>;

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar Editor */}
      <div className="w-1/3 h-full border-r border-gray-100 overflow-y-auto p-8 bg-gray-50/50">
        <button onClick={() => navigate('/admin/landings')} className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 mb-6 transition-all font-bold text-xs uppercase tracking-widest">
          <ArrowLeftIcon className="w-4 h-4" />
          Volver al listado
        </button>
        
        <h2 className="text-2xl font-black text-gray-900 mb-8 uppercase tracking-tight">
          {isEdit ? 'Editar Campaña' : 'Nueva Campaña'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
             <h3 className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-4">Configuración Base</h3>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nombre de Campaña (Interno)</label>
              <input name="title" value={formData.title} onChange={handleChange} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" required placeholder="Ej: Meta Ads Abrigos Invierno" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Slug URL (/lp/...) </label>
              <input name="slug" value={formData.slug} onChange={handleChange} className="w-full px-4 py-2 border rounded-xl font-mono text-indigo-600 focus:ring-2 focus:ring-indigo-500 outline-none" required placeholder="ej-abrigos-invierno" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Curso a Vender</label>
              <select name="courseId" value={formData.courseId} onChange={handleChange} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" required>
                <option value="">Selecciona un curso</option>
                {courses.map(c => <option key={c.uuid || c._id || c.id} value={c.uuid || c._id || c.id}>{c.title}</option>)}
              </select>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <h3 className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-4">Personalización Visual</h3>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Título de la Landing</label>
              <input name="customTitle" value={formData.customTitle} onChange={handleChange} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder={selectedCourse?.title || "Título del Curso"} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Descripción Enganche</label>
              <textarea name="customDescription" value={formData.customDescription} onChange={handleChange} rows={3} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder={selectedCourse?.shortDescription || "Descripción del curso..."} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Texto del Botón CTA</label>
              <input name="buttonText" value={formData.buttonText} onChange={handleChange} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="INSCRIBIRME Y PAGAR" />
            </div>
          </div>

          <button type="submit" disabled={saving} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-xl shadow-lg transition-all uppercase tracking-widest disabled:opacity-50">
            {saving ? 'GUARDANDO...' : isEdit ? 'ACTUALIZAR CAMPAÑA' : 'CREAR CAMPAÑA'}
          </button>
        </form>
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 h-full bg-gray-200 flex flex-col">
        <div className="bg-white p-4 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <span className="ml-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Vista Previa en Tiempo Real</span>
          </div>
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button onClick={() => setPreviewDevice('mobile')} className={`p-2 rounded-lg transition-all ${previewDevice === 'mobile' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400'}`}>
              <DevicePhoneMobileIcon className="w-5 h-5" />
            </button>
            <button onClick={() => setPreviewDevice('desktop')} className={`p-2 rounded-lg transition-all ${previewDevice === 'desktop' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400'}`}>
              <ComputerDesktopIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto flex justify-center items-start p-10">
          <div 
            className={`bg-white shadow-2xl transition-all duration-500 overflow-y-auto ${
              previewDevice === 'mobile' ? 'w-[375px] h-[667px] rounded-[40px] border-[8px] border-gray-900' : 'w-full max-w-5xl h-full rounded-xl'
            }`}
          >
            {/* Landing Content Preview */}
            <div className="p-8 min-h-full flex flex-col items-center">
              <div className="text-center mb-10 w-full">
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4 tracking-tight leading-tight uppercase">
                  {formData.customTitle || selectedCourse?.title || 'TÍTULO DE TU CURSO'}
                </h1>
                <p className="text-sm text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  {formData.customDescription || selectedCourse?.shortDescription || 'Aquí aparecerá la descripción que enganche a tu cliente.'}
                </p>
              </div>

              {/* Fake Form */}
              <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-xl border border-gray-100 space-y-4">
                <div className="space-y-3">
                  <div className="h-10 bg-gray-50 border border-gray-100 rounded-lg" />
                  <div className="h-10 bg-gray-50 border border-gray-100 rounded-lg" />
                  <div className="h-10 bg-gray-50 border border-gray-100 rounded-lg" />
                </div>
                <div className="w-full bg-indigo-600 py-4 rounded-xl text-center text-white font-black text-sm uppercase tracking-widest shadow-lg">
                  {formData.buttonText || 'INSCRIBIRME Y PAGAR'}
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-50 space-y-3">
                   <div className="flex items-center gap-2 opacity-60">
                     <ShieldCheckIcon className="w-4 h-4 text-green-500" />
                     <span className="text-[10px] font-bold text-gray-400 uppercase">Seguridad Certificada</span>
                   </div>
                   <div className="flex items-center gap-2 opacity-60">
                     <LockClosedIcon className="w-4 h-4 text-blue-500" />
                     <span className="text-[10px] font-bold text-gray-400 uppercase">Privacidad de Datos</span>
                   </div>
                   <div className="flex items-center gap-2 opacity-60">
                     <CreditCardIcon className="w-4 h-4 text-orange-500" />
                     <span className="text-[10px] font-bold text-gray-400 uppercase">Garantía Mercado Pago</span>
                   </div>
                </div>
              </div>

              <div className="mt-12 text-[10px] text-gray-300 font-bold uppercase tracking-widest">
                &copy; {new Date().getFullYear()} Modista App
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingFormPage;
