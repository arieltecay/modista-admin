import React, { useState, useEffect } from 'react';
import { testimonialService, Testimonial } from '../../services/testimonialService';
import { getCourses } from '../../services/courses/coursesService';
import type { Course } from '../../services/courses/types';
import CloudinaryImageUploader from '../../components/shared/CloudinaryImageUploader';
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  XMarkIcon,
  ChatBubbleBottomCenterTextIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface TestimonialFormData {
  name: string;
  description: string;
  role: string;
  avatarUrl: string;
  courseId: string;
  order: number;
  isActive: boolean;
}

const EMPTY_FORM: TestimonialFormData = {
  name: '',
  description: '',
  role: '',
  avatarUrl: '',
  courseId: '',
  order: 0,
  isActive: true
};

/**
 * Gestión de Testimonios.
 * Los testimonios alimentan la Home y las Landing Pages (/lp/:slug):
 * - courseId: si se asocia a un curso, aparece solo en la landing de ese curso.
 * - Si queda vacío, es genérico y aparece en todas.
 * - order: ordena la aparición (0 primero).
 */
const TestimonialsPage: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [formData, setFormData] = useState<TestimonialFormData>(EMPTY_FORM);

  useEffect(() => {
    fetchTestimonials();
    fetchCourses();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const data = await testimonialService.getAll();
      setTestimonials(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Error al cargar los testimonios');
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const data = await getCourses();
      setCourses(Array.isArray(data) ? data : []);
    } catch {
      // No bloqueante: el select de curso puede quedar vacío
      setCourses([]);
    }
  };

  const getCourseTitle = (courseId?: string): string | null => {
    if (!courseId) return null;
    const course = courses.find((c) => c.id === courseId || c.uuid === courseId);
    return course?.title || courseId;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTestimonial) {
        await testimonialService.update(editingTestimonial._id, formData);
        toast.success('Testimonio actualizado');
      } else {
        await testimonialService.create(formData);
        toast.success('Testimonio creado');
      }
      setIsModalOpen(false);
      setEditingTestimonial(null);
      setFormData(EMPTY_FORM);
      fetchTestimonials();
    } catch (error) {
      toast.error('Error al guardar');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este testimonio?')) return;
    try {
      await testimonialService.delete(id);
      toast.success('Testimonio eliminado');
      fetchTestimonials();
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      name: testimonial.name,
      description: testimonial.description,
      role: testimonial.role || '',
      avatarUrl: testimonial.avatarUrl || '',
      courseId: testimonial.courseId || '',
      order: testimonial.order ?? 0,
      isActive: testimonial.isActive
    });
    setIsModalOpen(true);
  };

  const toggleStatus = async (testimonial: Testimonial) => {
    try {
      await testimonialService.update(testimonial._id, { isActive: !testimonial.isActive });
      toast.success(`Testimonio ${testimonial.isActive ? 'desactivado' : 'activado'}`);
      fetchTestimonials();
    } catch (error) {
      toast.error('Error al cambiar el estado');
    }
  };

  const openNewModal = () => {
    setEditingTestimonial(null);
    setFormData(EMPTY_FORM);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <ChatBubbleBottomCenterTextIcon className="w-8 h-8 text-indigo-600" />
            Gestión de Testimonios
          </h1>
          <p className="text-gray-600">
            Administra los comentarios de tus alumnas. Se muestran en la Home y en las Landing Pages
            (los asociados a un curso aparecen solo en la landing de ese curso).
          </p>
        </div>
        <button
          onClick={openNewModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Nuevo Testimonio
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orden</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alumna</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Curso</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {testimonials?.map((t) => (
                <tr key={t._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                    {t.order ?? 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      {t.avatarUrl ? (
                        <img
                          src={t.avatarUrl}
                          alt={t.name}
                          className="w-10 h-10 rounded-full object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                          {t.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-gray-900">{t.name}</div>
                        {t.role && <div className="text-sm text-gray-500">{t.role}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getCourseTitle(t.courseId) ? (
                      <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs font-medium">
                        {getCourseTitle(t.courseId)}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Genérico (todas las landings)</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600 line-clamp-2 max-w-md">{t.description}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleStatus(t)}
                      className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                        t.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {t.isActive ? <EyeIcon className="w-3 h-3" /> : <EyeSlashIcon className="w-3 h-3" />}
                      {t.isActive ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(t)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      <PencilSquareIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(t._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {testimonials.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No hay testimonios registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-black bg-opacity-30 transition-opacity" onClick={() => setIsModalOpen(false)}></div>

            <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full p-6 overflow-hidden max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingTestimonial ? 'Editar Testimonio' : 'Nuevo Testimonio'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Nombre del alumno/a"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rol / Ciudad (Opcional)</label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Ej: Alumna del curso de Moldería"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Foto (recomendado — aumenta la confianza)</label>
                  <CloudinaryImageUploader
                    selectedImage={formData.avatarUrl}
                    onImageSelect={(imageUrl) => setFormData({ ...formData, avatarUrl: imageUrl })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Testimonio</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Escribe aquí el comentario..."
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Curso asociado</label>
                  <select
                    value={formData.courseId}
                    onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  >
                    <option value="">— Genérico (aparece en todas las landings) —</option>
                    {courses.map((c) => (
                      <option key={c.id || c.uuid} value={c.id || c.uuid}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-400 mt-1">
                    Si elegís un curso, este testimonio aparece en la landing de ese curso.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Orden de aparición</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                    className="w-28 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">0 aparece primero. Útil para destacar el mejor testimonio.</p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="isActive" className="text-sm text-gray-700 font-medium">Testimonio activo</label>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                  >
                    {editingTestimonial ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestimonialsPage;
