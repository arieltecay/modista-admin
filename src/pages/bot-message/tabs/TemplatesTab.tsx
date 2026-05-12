import React, { useState, useEffect } from 'react';
import * as chatService from '../../../services/chatService';
import { FaPlus, FaSync, FaTrash, FaCheckCircle, FaClock, FaTimesCircle, FaWhatsapp, FaPaperPlane } from 'react-icons/fa';
import GlobalModal from '../../../components/shared/GlobalModal';

const TemplatesTab: React.FC = () => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    category: 'UTILITY',
    language: 'es_AR',
    body: ''
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const data = await chatService.getTemplates();
      setTemplates(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando plantillas", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (name: string) => {
    if (!window.confirm(`¿Estás seguro de eliminar la plantilla "${name}" de Meta?`)) return;
    try {
      await chatService.deleteTemplate(name);
      loadTemplates();
    } catch (err) {
      alert("Error al eliminar la plantilla");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    // Estructura requerida por Meta API para creación
    const templateData = {
      name: newTemplate.name.toLowerCase().replace(/\s+/g, '_'),
      category: newTemplate.category,
      language: newTemplate.language,
      components: [
        {
          type: 'BODY',
          text: newTemplate.body
        }
      ]
    };

    try {
      await chatService.createTemplate(templateData);
      setIsModalOpen(false);
      setNewTemplate({ name: '', category: 'UTILITY', language: 'es_AR', body: '' });
      loadTemplates();
      alert("Plantilla enviada a revisión en Meta.");
    } catch (err: any) {
      alert(err.message || "Error al crear la plantilla");
    }
  };

  const handleSendTest = async (tpl: any) => {
    const to = window.prompt("Ingresa el número de teléfono para la prueba (con código de país, ej: 549...)");
    if (!to) return;

    try {
      await chatService.sendTestTemplate({
        to,
        templateName: tpl.name,
        languageCode: tpl.language, // Enviamos el idioma real de la plantilla
        components: [] // hello_world no requiere componentes, para otras se puede mejorar
      });
      alert("¡Prueba enviada con éxito!");
    } catch (err: any) {
      alert("Error al enviar la prueba");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED': return <FaCheckCircle className="text-green-500" />;
      case 'PENDING': return <FaClock className="text-amber-500" />;
      case 'REJECTED': return <FaTimesCircle className="text-red-500" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header acciones */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-700 flex items-center gap-2">
          Plantillas Oficiales de WhatsApp ({templates.length})
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={loadTemplates}
            className="p-2.5 bg-white border rounded-xl text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
            title="Sincronizar con Meta"
          >
            <FaSync className={loading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-sm font-semibold"
          >
            <FaPlus /> Crear Plantilla
          </button>
        </div>
      </div>

      {/* Grid de Plantillas */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-gray-100 animate-pulse rounded-2xl border" />
          ))}
        </div>
      ) : templates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((tpl: any) => (
            <div key={tpl.id} className="bg-white border rounded-2xl shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
              <div className="p-4 border-b bg-gray-50 flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-1">{tpl.category}</span>
                  <h3 className="font-bold text-gray-800 break-all">{tpl.name}</h3>
                </div>
                <div className="flex items-center gap-2">
                  {tpl.status === 'APPROVED' && (
                    <button 
                      onClick={() => handleSendTest(tpl)}
                      className="text-indigo-400 hover:text-indigo-600 transition-colors"
                      title="Enviar prueba"
                    >
                      <FaPaperPlane size={14} />
                    </button>
                  )}
                  <span title={tpl.status}>{getStatusIcon(tpl.status)}</span>
                  <button 
                    onClick={() => handleDelete(tpl.name)}
                    className="text-red-400 hover:text-red-600 transition-colors"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              </div>
              
              <div className="p-4 flex-1 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat">
                <div className="bg-white p-3 rounded-xl rounded-tl-none shadow-sm text-sm text-gray-700 relative border border-gray-100">
                  {tpl.components.find((c: any) => c.type === 'BODY')?.text || 'Sin contenido'}
                  <div className="text-[9px] text-gray-400 text-right mt-1">
                    {tpl.language}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-50 border-2 border-dashed rounded-2xl text-gray-400">
          <FaWhatsapp size={40} className="mb-4 text-gray-300" />
          <p>No se encontraron plantillas en tu cuenta de Meta.</p>
          <p className="text-sm">Crea tu primera plantilla para automatizar notificaciones.</p>
        </div>
      )}

      {/* Modal Creación */}
      <GlobalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Crear Nueva Plantilla en Meta"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre (minúsculas y guiones bajos)</label>
            <input 
              type="text" 
              required
              value={newTemplate.name}
              onChange={e => setNewTemplate({...newTemplate, name: e.target.value})}
              placeholder="ej: confirmacion_pago"
              className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <select 
                value={newTemplate.category}
                onChange={e => setNewTemplate({...newTemplate, category: e.target.value})}
                className="w-full border rounded-xl px-4 py-2 outline-none"
              >
                <option value="UTILITY">Utilidad (Pagos, Avisos)</option>
                <option value="MARKETING">Marketing (Promociones)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Idioma</label>
              <select 
                value={newTemplate.language}
                onChange={e => setNewTemplate({...newTemplate, language: e.target.value})}
                className="w-full border rounded-xl px-4 py-2 outline-none"
              >
                <option value="es_AR">Español (Argentina)</option>
                <option value="es">Español (General)</option>
                <option value="en_US">Inglés (US)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contenido del Mensaje</label>
            <textarea 
              required
              rows={4}
              value={newTemplate.body}
              onChange={e => setNewTemplate({...newTemplate, body: e.target.value})}
              placeholder="Hola {{1}}, tu curso {{2}} ya está listo..."
              className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            />
            <p className="text-[10px] text-gray-400 mt-1">Usa {"{{1}}"}, {"{{2}}"}, etc. para insertar variables dinámicas desde el sistema.</p>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-2 border rounded-xl text-gray-600 hover:bg-gray-50 transition-colors font-semibold"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-semibold"
            >
              Enviar a Meta
            </button>
          </div>
        </form>
      </GlobalModal>
    </div>
  );
};

export default TemplatesTab;
