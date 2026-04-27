import React, { useState, useEffect } from 'react';
import { faqService } from '../../services/faq/faqService';
import { FAQ, FAQFormData } from './types';
import { 
  PlusIcon, 
  PencilSquareIcon, 
  TrashIcon, 
  Bars3Icon, 
  QuestionMarkCircleIcon, 
  ShoppingBagIcon, 
  EnvelopeIcon, 
  CreditCardIcon, 
  CheckCircleIcon, 
  BookOpenIcon,
  EyeIcon,
  EyeSlashIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const ICON_OPTIONS = [
  { name: 'question-mark-circle', icon: QuestionMarkCircleIcon },
  { name: 'shopping-bag', icon: ShoppingBagIcon },
  { name: 'envelope', icon: EnvelopeIcon },
  { name: 'credit-card', icon: CreditCardIcon },
  { name: 'check-circle', icon: CheckCircleIcon },
  { name: 'book-open', icon: BookOpenIcon },
];

const CATEGORY_OPTIONS = [
  { value: 'general', label: 'General' },
  { value: 'purchase-process', label: 'Proceso de Compra' },
  { value: 'courses', label: 'Cursos' },
];

const FAQPage: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [formData, setFormData] = useState<FAQFormData>({
    question: '',
    answer: '',
    iconName: 'question-mark-circle',
    category: 'general',
    order: 0,
    status: 'active'
  });

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const data = await faqService.getAllFAQs();
      setFaqs(data);
    } catch (error) {
      toast.error('Error al cargar las preguntas');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingFaq) {
        await faqService.updateFAQ(editingFaq._id, formData);
        toast.success('Pregunta actualizada');
      } else {
        await faqService.createFAQ(formData);
        toast.success('Pregunta creada');
      }
      setIsModalOpen(false);
      setEditingFaq(null);
      resetForm();
      fetchFaqs();
    } catch (error) {
      toast.error('Error al guardar');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar esta pregunta?')) return;
    try {
      await faqService.deleteFAQ(id);
      toast.success('Pregunta eliminada');
      fetchFaqs();
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  const handleEdit = (faq: FAQ) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      iconName: faq.iconName,
      category: faq.category,
      order: faq.order,
      status: faq.status
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      question: '',
      answer: '',
      iconName: 'question-mark-circle',
      category: 'general',
      order: faqs.length,
      status: 'active'
    });
  };

  const getIconComponent = (name: string) => {
    const option = ICON_OPTIONS.find(opt => opt.name === name);
    const Icon = option ? option.icon : QuestionMarkCircleIcon;
    return <Icon className="w-5 h-5" />;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Q&A (FAQ)</h1>
        <button
          onClick={() => {
            resetForm();
            setEditingFaq(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Nueva Pregunta
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Orden</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Icono</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Pregunta</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Categoría</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Estado</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {faqs.map((faq) => (
                <tr key={faq._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Bars3Icon className="w-4 h-4 text-gray-400" />
                      {faq.order}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-indigo-600 bg-indigo-50 p-2 rounded-lg inline-block">
                      {getIconComponent(faq.iconName)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{faq.question}</div>
                    <div className="text-xs text-gray-500 truncate max-w-xs">{faq.answer}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <span className="px-2 py-1 bg-gray-100 rounded-md text-xs uppercase tracking-wider font-semibold">
                      {CATEGORY_OPTIONS.find(c => c.value === faq.category)?.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {faq.status === 'active' ? (
                      <span className="flex items-center gap-1 text-green-600">
                        <EyeIcon className="w-4 h-4" /> Activa
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-gray-400">
                        <EyeSlashIcon className="w-4 h-4" /> Inactiva
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(faq)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <PencilSquareIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(faq._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Creación/Edición */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-800">
                {editingFaq ? 'Editar Pregunta' : 'Nueva Pregunta'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pregunta</label>
                  <input
                    type="text"
                    required
                    value={formData.question}
                    onChange={(e) => setFormData({...formData, question: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Ej: ¿Cómo compro un curso?"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Respuesta</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.answer}
                    onChange={(e) => setFormData({...formData, answer: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Describe los pasos o la respuesta profesional..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Icono</label>
                  <div className="flex flex-wrap gap-2">
                    {ICON_OPTIONS.map((opt) => (
                      <button
                        key={opt.name}
                        type="button"
                        onClick={() => setFormData({...formData, iconName: opt.name})}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          formData.iconName === opt.name 
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-600' 
                          : 'border-gray-100 hover:border-gray-300 text-gray-400'
                        }`}
                      >
                        <opt.icon className="w-6 h-6" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value as any})}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                  >
                    {CATEGORY_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Orden</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="active">Activa</option>
                    <option value="inactive">Inactiva</option>
                  </select>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all font-semibold"
                >
                  {editingFaq ? 'Guardar Cambios' : 'Crear Pregunta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FAQPage;
