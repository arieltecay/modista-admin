import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLandingPages, deleteLandingPage, updateLandingPage } from '@/services/landing';
import toast from 'react-hot-toast';
import ConfirmDeleteModal from '@/components/shared/ConfirmDeleteModal';
import { useDebounce } from '@/hooks/useDebounce';
import type { LandingPage } from '@/services/types';
import { StatCard, SearchIcon } from '@/components/shared/AdminStatComponents';
import { RocketLaunchIcon, PlusIcon, LinkIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';

const LandingListPage: React.FC = () => {
  const navigate = useNavigate();
  const [landings, setLandings] = useState<LandingPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: '', title: '' });

  const fetchLandings = async () => {
    setLoading(true);
    try {
      const res = await getLandingPages({ search: debouncedSearch });
      setLandings(res.data);
    } catch (err) {
      toast.error('Error al cargar las landings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLandings();
  }, [debouncedSearch]);

  const handleDelete = async () => {
    try {
      await deleteLandingPage(deleteModal.id);
      toast.success('Landing eliminada');
      fetchLandings();
    } catch (err) {
      toast.error('Error al eliminar');
    } finally {
      setDeleteModal({ isOpen: false, id: '', title: '' });
    }
  };

  const copyToClipboard = (slug: string) => {
    // Usar la URL base del frontend, no del admin
    const baseUrl = import.meta.env.VITE_FRONTEND_URL || 'https://modista-app.com';
    const url = `${baseUrl}/lp/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success('¡Link copiado al portapapeles!');
  };

  const toggleStatus = async (landing: LandingPage) => {
    try {
      const newStatus = landing.status === 'active' ? 'inactive' : 'active';
      await updateLandingPage((landing._id || landing.id)!, { status: newStatus });
      setLandings(prev => prev.map(l => (l._id || l.id) === (landing._id || landing.id) ? { ...l, status: newStatus } : l));
      toast.success(`Landing ${newStatus === 'active' ? 'activada' : 'desactivada'}`);
    } catch (err) {
      toast.error('Error al actualizar estado');
    }
  };

  return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Landing Pages</h1>
          <p className="text-gray-500">Gestiona tus campañas de Meta Ads</p>
        </div>
        <button
          onClick={() => navigate('/admin/landings/add')}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg"
        >
          <PlusIcon className="w-5 h-5" />
          NUEVA CAMPAÑA
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Campañas Activas" 
          value={landings.filter(l => l.status === 'active').length} 
          icon={<RocketLaunchIcon className="w-8 h-8 text-indigo-600" />} 
          colorClass="bg-indigo-50" 
          loading={loading}
        />
      </div>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="p-6 border-b border-gray-50 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <SearchIcon />
            <input
              type="text"
              placeholder="Buscar campaña..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-xs font-black uppercase tracking-widest">
                <th className="px-6 py-4">Campaña / Slug</th>
                <th className="px-6 py-4 text-center">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && landings.length === 0 ? (
                <tr><td colSpan={3} className="text-center py-20 text-gray-400 font-medium">Cargando campañas...</td></tr>
              ) : landings.length === 0 ? (
                <tr><td colSpan={3} className="text-center py-20 text-gray-400 font-medium">No hay campañas creadas</td></tr>
              ) : landings.map((landing) => (
                <tr key={landing._id || landing.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{landing.title}</div>
                    <div className="text-xs text-indigo-500 font-mono">/lp/{landing.slug}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <button
                        onClick={() => toggleStatus(landing)}
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter transition-all ${
                          landing.status === 'active' 
                            ? 'bg-green-100 text-green-700 border border-green-200' 
                            : 'bg-gray-100 text-gray-500 border border-gray-200'
                        }`}
                      >
                        {landing.status === 'active' ? 'ACTIVA' : 'INACTIVA'}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => copyToClipboard(landing.slug)}
                        title="Copiar Link"
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                      >
                        <LinkIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          const baseUrl = import.meta.env.VITE_FRONTEND_URL || 'https://modista-app.com';
                          window.open(`${baseUrl}/lp/${landing.slug}`, '_blank');
                        }}
                        title="Ver en vivo"
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => navigate(`/admin/landings/edit/${landing._id || landing.id}`)}
                        title="Editar"
                        className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setDeleteModal({ isOpen: true, id: (landing._id || landing.id)!, title: landing.title })}
                        title="Eliminar"
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
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
      </div>

      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: '', title: '' })}
        onConfirm={handleDelete}
        itemName={deleteModal.title}
        itemType="la campaña"
      />
    </div>
  );
};

export default LandingListPage;
