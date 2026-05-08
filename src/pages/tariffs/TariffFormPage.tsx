import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { tariffService } from '../../services/tariff/tariffService';
import { TariffFormData, ITariffMetadata } from '../../services/tariff/types';
import { 
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  CheckIcon,
  TagIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const INITIAL_METADATA: ITariffMetadata = {
  titulo: '',
  organizacion: 'Modista',
  periodo: { inicio: '', fin: '' },
  descripcion: '',
  nota_precios: '',
  nota_adicional: '',
  moneda: 'ARS',
  contacto: { email: '', nota: '' },
  notas: []
};

const INITIAL_FORM_DATA: TariffFormData = {
  type: 'modista',
  periodIdentifier: '',
  startDate: new Date().toISOString().split('T')[0],
  status: 'active',
  metadata: INITIAL_METADATA,
  content: { serviciosModista: [] }
};

const TariffFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState<TariffFormData>(INITIAL_FORM_DATA);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit) {
      fetchTariff();
    }
  }, [id]);

  const fetchTariff = async () => {
    try {
      const data = await tariffService.getTariffById(id!);
      const formattedData = {
        ...data,
        startDate: new Date(data.startDate).toISOString().split('T')[0]
      };
      setFormData(formattedData);
    } catch (error) {
      toast.error('Error al cargar el tarifario');
      navigate('/admin/tariffs');
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value;
    setFormData(prev => {
      const newData = { ...prev, type: newType };
      if (newType === 'modista') newData.content = { serviciosModista: [] };
      else if (newType === 'costurera') newData.content = { servicios: [] };
      else if (newType === 'arreglos') newData.content = { 
        tarifas_por_hora: [], 
        metro_lineal: [], 
        arreglos_principales: [],
        nota_final: ''
      };
      else if (newType === 'alta-costura') newData.content = { 
        categorias: {},
        tarifas_por_hora: [],
        metro_lineal: []
      };
      return newData;
    });
  };

  const addNote = () => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        notas: [...(prev.metadata.notas || []), '']
      }
    }));
  };

  const updateNote = (index: number, value: string) => {
    const newNotes = [...(formData.metadata.notas || [])];
    newNotes[index] = value;
    setFormData(prev => ({
      ...prev,
      metadata: { ...prev.metadata, notas: newNotes }
    }));
  };

  const removeNote = (index: number) => {
    const newNotes = (formData.metadata.notas || []).filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      metadata: { ...prev.metadata, notas: newNotes }
    }));
  };

  const addItemToSection = (section: string) => {
    setFormData(prev => {
      const sectionContent = prev.content[section] || [];
      return {
        ...prev,
        content: {
          ...prev.content,
          [section]: [...sectionContent, { item: '', precio: 0, descripcion: '' }]
        }
      };
    });
  };

  const updateItemInSection = (section: string, index: number, field: string, value: any) => {
    setFormData(prev => {
      const sectionContent = [...prev.content[section]];
      sectionContent[index] = { ...sectionContent[index], [field]: value };
      return {
        ...prev,
        content: { ...prev.content, [section]: sectionContent }
      };
    });
  };

  const removeItemFromSection = (section: string, index: number) => {
    setFormData(prev => {
      const sectionContent = prev.content[section].filter((_: any, i: number) => i !== index);
      return {
        ...prev,
        content: { ...prev.content, [section]: sectionContent }
      };
    });
  };

  // Alta Costura Category helpers
  const addCategory = () => {
    const catId = `cat_${Date.now()}`;
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        categorias: {
          ...prev.content.categorias,
          [catId]: { nombre: '', prendas: [], nota_agregado: '', nota_agregado_bordado: '' }
        }
      }
    }));
  };

  const updateCategory = (catId: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        categorias: {
          ...prev.content.categorias,
          [catId]: { ...prev.content.categorias[catId], [field]: value }
        }
      }
    }));
  };

  const removeCategory = (catId: string) => {
    setFormData(prev => {
      const newCategorias = { ...prev.content.categorias };
      delete newCategorias[catId];
      return {
        ...prev,
        content: { ...prev.content, categorias: newCategorias }
      };
    });
  };

  const addPrendaToCategory = (catId: string) => {
    setFormData(prev => {
      const categoria = prev.content.categorias[catId];
      return {
        ...prev,
        content: {
          ...prev.content,
          categorias: {
            ...prev.content.categorias,
            [catId]: {
              ...categoria,
              prendas: [...categoria.prendas, { item: '', precio: 0, descripcion: '' }]
            }
          }
        }
      };
    });
  };

  const updatePrendaInCategory = (catId: string, prendaIndex: number, field: string, value: any) => {
    setFormData(prev => {
      const categoria = prev.content.categorias[catId];
      const newPrendas = [...categoria.prendas];
      newPrendas[prendaIndex] = { ...newPrendas[prendaIndex], [field]: value };
      return {
        ...prev,
        content: {
          ...prev.content,
          categorias: {
            ...prev.content.categorias,
            [catId]: { ...categoria, prendas: newPrendas }
          }
        }
      };
    });
  };

  const removePrendaFromCategory = (catId: string, prendaIndex: number) => {
    setFormData(prev => {
      const categoria = prev.content.categorias[catId];
      const newPrendas = categoria.prendas.filter((_: any, i: number) => i !== prendaIndex);
      return {
        ...prev,
        content: {
          ...prev.content,
          categorias: {
            ...prev.content.categorias,
            [catId]: { ...categoria, prendas: newPrendas }
          }
        }
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.metadata.titulo.trim()) {
      toast.error('El título del tarifario es obligatorio');
      return;
    }
    if (!formData.periodIdentifier.trim()) {
      toast.error('El identificador de período es obligatorio (Ej: 2024-Q1)');
      return;
    }

    setSaving(true);
    try {
      if (isEdit) {
        await tariffService.updateTariff(id!, formData);
        toast.success('Tarifario actualizado');
      } else {
        await tariffService.createTariff(formData);
        toast.success('Tarifario creado');
      }
      navigate('/admin/tariffs');
    } catch (error) {
      toast.error('Error al guardar el tarifario');
    } finally {
      setSaving(false);
    }
  };

  const renderSectionEditor = (sectionTitle: string, sectionKey: string) => (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Bars3Icon className="w-5 h-5 text-indigo-500" />
          {sectionTitle}
        </h3>
        <button
          type="button"
          onClick={() => addItemToSection(sectionKey)}
          className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1 hover:bg-indigo-100 transition-colors"
        >
          <PlusIcon className="w-4 h-4" /> Añadir Servicio
        </button>
      </div>
      <div className="space-y-4">
        <div className="hidden md:grid grid-cols-12 gap-4 px-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
          <div className="md:col-span-8">Servicio / Descripción</div>
          <div className="md:col-span-3 text-right pr-4">Precio (ARS)</div>
          <div className="md:col-span-1"></div>
        </div>
        {(formData.content[sectionKey] || []).map((item: any, idx: number) => (
          <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-gray-50/50 p-3 rounded-xl border border-transparent hover:border-indigo-100 hover:bg-white transition-all group">
            <div className="md:col-span-8">
              <input
                type="text"
                placeholder="Nombre del servicio (Ej: Ruedo pantalón)"
                value={item.item}
                onChange={(e) => updateItemInSection(sectionKey, idx, 'item', e.target.value)}
                className="w-full bg-transparent border-none focus:ring-0 font-medium text-gray-700 placeholder-gray-400"
              />
              <input
                type="text"
                placeholder="Detalles adicionales (opcional)"
                value={item.descripcion}
                onChange={(e) => updateItemInSection(sectionKey, idx, 'descripcion', e.target.value)}
                className="w-full bg-transparent border-none focus:ring-0 text-sm text-gray-500 placeholder-gray-300 mt-1"
              />
            </div>
            <div className="md:col-span-3">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={item.precio}
                  onChange={(e) => updateItemInSection(sectionKey, idx, 'precio', parseFloat(e.target.value))}
                  className="w-full pl-7 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-right font-bold text-indigo-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="md:col-span-1 flex justify-end">
              <button
                type="button"
                onClick={() => removeItemFromSection(sectionKey, idx)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
        {(!formData.content[sectionKey] || formData.content[sectionKey].length === 0) && (
          <div className="text-center py-8 border-2 border-dashed border-gray-100 rounded-2xl">
            <p className="text-gray-400 text-sm">No hay servicios añadidos. Haz clic en "Añadir Servicio".</p>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto pb-24">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/tariffs')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {isEdit ? 'Editar Tarifario' : 'Crear Nuevo Tarifario'}
            </h1>
            <p className="text-sm text-gray-500">Configura los precios y servicios mostrados en el front.</p>
          </div>
        </div>
        
        <div className="hidden md:flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/tariffs')}
            className="px-6 py-2 rounded-xl text-gray-600 font-semibold hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={(e) => handleSubmit(e as any)}
            disabled={saving}
            className="px-8 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2"
          >
            {saving ? <div className="animate-spin h-5 w-5 border-b-2 border-white rounded-full"></div> : <CheckIcon className="w-5 h-5" />}
            Guardar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna Lateral: Configuración */}
        <div className="lg:col-span-1 space-y-6">
          <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <DocumentDuplicateIcon className="w-4 h-4" />
              Base
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Tipo</label>
                <select
                  value={formData.type}
                  onChange={handleTypeChange}
                  className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 capitalize"
                >
                  <option value="modista">Modista</option>
                  <option value="costurera">Costurera</option>
                  <option value="arreglos">Arreglos</option>
                  <option value="alta-costura">Alta Costura</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Identificador (Ej: 2024-Q1)</label>
                <input
                  type="text"
                  required
                  value={formData.periodIdentifier}
                  onChange={(e) => setFormData({...formData, periodIdentifier: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Fecha de Inicio</label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Estado</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as 'active' | 'inactive'})}
                  className={`w-full px-4 py-2 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 ${
                    formData.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  <option value="active">🟢 Activo (Visible en Front)</option>
                  <option value="inactive">⚪ Inactivo (Borrador)</option>
                </select>
              </div>
            </div>
          </section>

          <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <TagIcon className="w-4 h-4" />
                  Notas Importantes
                </h2>
                <button
                  type="button"
                  onClick={addNote}
                  className="p-1 text-indigo-600 hover:bg-indigo-50 rounded"
                >
                  <PlusIcon className="w-5 h-5" />
                </button>
             </div>
             <div className="space-y-3">
               {(formData.metadata.notas || []).map((nota, idx) => (
                 <div key={idx} className="flex gap-2 group">
                   <textarea
                     value={nota}
                     onChange={(e) => updateNote(idx, e.target.value)}
                     rows={2}
                     className="flex-1 px-3 py-2 text-sm bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 placeholder-gray-300"
                     placeholder="Ej: No incluye insumos..."
                   />
                   <button 
                     onClick={() => removeNote(idx)} 
                     type="button" 
                     className="text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                   >
                     <TrashIcon className="w-4 h-4" />
                   </button>
                 </div>
               ))}
               {(formData.metadata.notas || []).length === 0 && (
                 <p className="text-xs text-gray-400 text-center italic">No hay notas. Se mostrarán al principio del tarifario.</p>
               )}
             </div>
          </section>
        </div>

        {/* Columna Principal: Contenido */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div className="mb-8">
              <label className="block text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2">Título Principal</label>
              <input
                type="text"
                required
                value={formData.metadata.titulo}
                onChange={(e) => setFormData({...formData, metadata: {...formData.metadata, titulo: e.target.value}})}
                className="w-full text-3xl font-extrabold text-gray-900 border-none focus:ring-0 p-0 placeholder-gray-200"
                placeholder="Ej: Tarifario de Costurera"
              />
            </div>

            {/* Render dinámico de secciones según el tipo */}
            {formData.type === 'modista' && renderSectionEditor("Servicios Modista", "serviciosModista")}
            {formData.type === 'costurera' && renderSectionEditor("Servicios Generales", "servicios")}
            
            {formData.type === 'arreglos' && (
              <div className="space-y-6">
                {renderSectionEditor("Tarifas por Hora", "tarifas_por_hora")}
                {renderSectionEditor("Tarifas por Metro Lineal", "metro_lineal")}
                {renderSectionEditor("Arreglos Principales", "arreglos_principales")}
              </div>
            )}

            {formData.type === 'alta-costura' && (
              <div className="space-y-8">
                 <div className="flex justify-between items-center bg-indigo-50/50 p-4 rounded-2xl">
                   <div>
                     <h3 className="font-bold text-indigo-900">Categorías de Alta Costura</h3>
                     <p className="text-xs text-indigo-600">Agrupa prendas por estilo (Novias, Fiesta, etc.)</p>
                   </div>
                   <button
                      type="button"
                      onClick={addCategory}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1 hover:bg-indigo-700 shadow-md"
                    >
                      <PlusIcon className="w-4 h-4" /> Nueva Categoría
                    </button>
                 </div>
                 
                 {Object.entries(formData.content.categorias || {}).map(([catId, cat]: [string, any]) => (
                   <div key={catId} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group">
                      <div className="bg-gray-50/80 px-6 py-4 flex justify-between items-center border-b border-gray-100">
                        <input
                          type="text"
                          value={cat.nombre}
                          onChange={(e) => updateCategory(catId, 'nombre', e.target.value)}
                          className="text-lg font-bold bg-transparent border-none focus:ring-0 p-0 text-gray-800 placeholder-gray-400 w-full"
                          placeholder="Categoría (Ej: Vestidos de Novia)"
                        />
                        <button onClick={() => removeCategory(catId)} type="button" className="text-gray-300 hover:text-red-500 transition-colors">
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="p-6 space-y-4">
                        <div className="space-y-3">
                          {cat.prendas.map((prenda: any, pIdx: number) => (
                            <div key={pIdx} className="grid grid-cols-12 gap-3 items-center">
                               <input
                                type="text"
                                placeholder="Prenda"
                                value={prenda.item}
                                onChange={(e) => updatePrendaInCategory(catId, pIdx, 'item', e.target.value)}
                                className="col-span-8 bg-transparent border-none focus:ring-0 text-sm font-medium"
                              />
                              <div className="col-span-3 relative">
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-xs text-indigo-400 font-bold">$</span>
                                <input
                                  type="number"
                                  value={prenda.precio}
                                  onChange={(e) => updatePrendaInCategory(catId, pIdx, 'precio', parseFloat(e.target.value))}
                                  className="w-full pl-3 bg-transparent border-none focus:ring-0 text-right font-bold text-indigo-600 text-sm"
                                />
                              </div>
                              <button onClick={() => removePrendaFromCategory(catId, pIdx)} type="button" className="col-span-1 text-gray-300 hover:text-red-400 flex justify-center opacity-0 group-hover:opacity-100">
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => addPrendaToCategory(catId)}
                            className="w-full py-2 border-2 border-dashed border-gray-50 rounded-xl text-xs font-bold text-indigo-400 hover:border-indigo-100 hover:text-indigo-600 transition-all"
                          >
                            + Añadir Prenda
                          </button>
                        </div>
                      </div>
                   </div>
                 ))}

                 {renderSectionEditor("Tarifas por Hora", "tarifas_por_hora")}
                 {renderSectionEditor("Tarifas por Metro Lineal", "metro_lineal")}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Acciones móviles */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-100 flex gap-3 z-50">
        <button
          type="button"
          onClick={() => navigate('/admin/tariffs')}
          className="flex-1 py-3 rounded-xl text-gray-600 font-semibold bg-gray-50"
        >
          Cancelar
        </button>
        <button
          onClick={(e) => handleSubmit(e as any)}
          disabled={saving}
          className="flex-2 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
        >
          {saving ? <div className="animate-spin h-5 w-5 border-b-2 border-white rounded-full"></div> : <CheckIcon className="w-5 h-5" />}
          Guardar Cambios
        </button>
      </div>
    </div>
  );
};

export default TariffFormPage;
