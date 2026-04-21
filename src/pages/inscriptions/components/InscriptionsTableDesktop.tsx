import React from 'react';
import Spinner from '../../../components/shared/Spinner';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { SortableHeaderProps, InscriptionsTableDesktopProps, TurnoData } from './types';

const SortableHeader: React.FC<SortableHeaderProps> = ({ children, name, sortConfig, onSort }) => {
  const isSorted = sortConfig.key === name;
  const direction = isSorted ? sortConfig.direction : undefined;

  const getIcon = () => {
    if (!isSorted) return <FaSort className="inline ml-1" />;
    if (direction === 'asc') return <FaSortUp className="inline ml-1" />;
    return <FaSortDown className="inline ml-1" />;
  };

  return (
    <th
      className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer"
      onClick={() => onSort(name)}
    >
      {children}
      {getIcon()}
    </th>
  );
};

const InscriptionsTableDesktop: React.FC<InscriptionsTableDesktopProps> = ({
  inscriptions,
  loading,
  handlePaymentStatusUpdate,
  sortConfig,
  handleSort,
  handleSendCourseEmail,
  showDepositFeature = false,
  onDepositClick,
  hideCourseTitle = false
}) => {
  if (loading) {
    return <div className="flex justify-center items-center p-10"><Spinner /></div>;
  }

  return (
    <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto hidden md:block">
      <div className="inline-block min-w-full shadow rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <SortableHeader name="nombre" sortConfig={sortConfig} onSort={handleSort}>Nombre Completo</SortableHeader>
              <SortableHeader name="email" sortConfig={sortConfig} onSort={handleSort}>Email</SortableHeader>
              <SortableHeader name="celular" sortConfig={sortConfig} onSort={handleSort}>Celular</SortableHeader>
              {!hideCourseTitle && <SortableHeader name="courseTitle" sortConfig={sortConfig} onSort={handleSort}>Taller</SortableHeader>}
              <SortableHeader name="horario" sortConfig={sortConfig} onSort={handleSort}>Horario</SortableHeader>
              <SortableHeader name="coursePrice" sortConfig={sortConfig} onSort={handleSort}>Precio</SortableHeader>
              {showDepositFeature && <SortableHeader name="depositAmount" sortConfig={sortConfig} onSort={handleSort}>Seña</SortableHeader>}
              <SortableHeader name="paymentStatus" sortConfig={sortConfig} onSort={handleSort}>Estado Pago</SortableHeader>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
              <SortableHeader name="fechaInscripcion" sortConfig={sortConfig} onSort={handleSort}>Fecha de Inscripción</SortableHeader>
            </tr>
          </thead>
          <tbody>
            {inscriptions.map((inscription) => (
              <tr key={inscription._id}>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">{inscription.nombre} {inscription.apellido}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">{inscription.email}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">{inscription.celular}</p>
                </td>
                {!hideCourseTitle && (
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 font-medium">{inscription.courseTitle || 'N/A'}</p>
                  </td>
                )}
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {inscription.turnoId && typeof inscription.turnoId === 'object' ? (
                    <p className="text-xs text-indigo-600 font-bold bg-indigo-50 inline-block px-1.5 py-0.5 rounded">
                      {(inscription.turnoId as TurnoData).diaSemana} - {(inscription.turnoId as TurnoData).horaInicio} hs
                    </p>
                  ) : (
                    <span className="text-gray-400 italic">No asignado</span>
                  )}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">${inscription.coursePrice || 0}</p>
                </td>
                {showDepositFeature && (
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {inscription.depositAmount && inscription.depositAmount > 0 ? (
                      <div>
                        <p className="text-green-600 font-bold whitespace-no-wrap">${inscription.depositAmount}</p>
                        <p className="text-[10px] text-gray-400">
                          {inscription.depositDate ? new Date(inscription.depositDate).toLocaleDateString() : ''}
                        </p>
                      </div>
                    ) : (
                      <span className="text-gray-300 italic">Sin seña</span>
                    )}
                  </td>
                )}
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <span className={`px-2 py-1 text-xs rounded-full border ${inscription.paymentStatus === 'paid'
                    ? 'bg-green-100 text-green-800 border-green-200'
                    : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                    }`}>
                    {inscription.paymentStatus === 'paid' ? '✅ Pagado' : '⏳ Pendiente'}
                  </span>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <div className="flex items-center gap-2">
                    {inscription.paymentStatus === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePaymentStatusUpdate(inscription._id, 'paid')}
                          className="bg-green-500 text-white px-3 py-1 text-xs rounded hover:bg-green-600 transition-colors"
                          disabled={loading}
                        >
                          {loading ? '...' : 'Marcar Pagado'}
                        </button>
                        {showDepositFeature && !(inscription.depositAmount && inscription.depositAmount > 0) && (
                          <button
                            onClick={() => onDepositClick(inscription)}
                            className="bg-indigo-500 text-white px-3 py-1 text-xs rounded hover:bg-indigo-600 transition-colors"
                            disabled={loading}
                          >
                            Seña
                          </button>
                        )}
                      </div>
                    )}
                    {inscription.paymentStatus === 'paid' && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handlePaymentStatusUpdate(inscription._id, 'pending')}
                          className="bg-gray-500 text-white px-2 py-1 text-xs rounded hover:bg-gray-600 transition-colors"
                          disabled={loading}
                        >
                          Revertir
                        </button>
                        <button
                          onClick={() => handleSendCourseEmail(inscription)}
                          className="bg-blue-500 text-white px-2 py-1 text-xs rounded hover:bg-blue-600 transition-colors"
                          disabled={loading}
                        >
                          {loading ? '...' : 'Enviar Video'}
                        </button>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">
                    {new Date(inscription.fechaInscripcion).toLocaleDateString('es-AR')}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InscriptionsTableDesktop;
