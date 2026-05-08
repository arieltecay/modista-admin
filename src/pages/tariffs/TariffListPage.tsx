import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tariffService } from '../../services/tariff/tariffService';
import { AvailableTariffMeta } from '../../services/tariff/types';
import { 
  PlusIcon, 
  PencilSquareIcon, 
  TrashIcon,
  TagIcon,
  CalendarDaysIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const TariffListPage: React.FC = () => {
  const [tariffs, setTariffs] = useState<AvailableTariffMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTariffs();
  }, []);

  const fetchTariffs = async () => {
    try {
      setLoading(true);
      const data = await tariffService.getAllTariffsMeta();
      setTariffs(data);
    } catch (error) {
      toast.error('Error al cargar la lista de tarifarios');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este tarifario?')) return;
    try {
      await tariffService.deleteTariff(id);
      toast.success('Tarifario eliminado');
      fetchTariffs();
    } catch (error) {
      toast.error('Error al eliminar el tarifario');
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      toast.loading('Duplicando tarifario...', { id: 'duplicate' });
      await tariffService.duplicateTariff(id);
      toast.success('Tarifario duplicado correctamente (Inactivo)', { id: 'duplicate' });
      fetchTariffs();
    } catch (error) {
      toast.error('Error al duplicar el tarifario', { id: 'duplicate' });
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Tarifarios</h1>
        <button
          onClick={() => navigate('/admin/tariffs/add')}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Nuevo Tarifario
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
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Tipo</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Título / Estado</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Período</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Fecha Inicio</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tariffs.map((tariff) => (
                <tr key={tariff._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <TagIcon className="w-4 h-4 text-indigo-500" />
                      <span className="capitalize text-sm font-medium text-gray-900">{tariff.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{tariff.title}</div>
                        <div className="text-xs text-gray-500">{tariff.periodIdentifier}</div>
                      </div>
                      {tariff.status === 'active' ? (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-[10px] font-bold uppercase rounded-full border border-green-100">
                          <EyeIcon className="w-3 h-3" /> Activo
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold uppercase rounded-full border border-gray-200">
                          <EyeSlashIcon className="w-3 h-3" /> Inactivo
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {tariff.periodDescription}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <CalendarDaysIcon className="w-4 h-4 text-gray-400" />
                      {new Date(tariff.startDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => handleDuplicate(tariff._id)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Duplicar (Crear copia)"
                      >
                        <DocumentDuplicateIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => navigate(`/admin/tariffs/edit/${tariff._id}`)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <PencilSquareIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(tariff._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {tariffs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                    No hay tarifarios registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TariffListPage;
