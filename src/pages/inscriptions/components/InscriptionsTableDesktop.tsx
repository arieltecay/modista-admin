import React from 'react';
import Spinner from '../../../components/shared/Spinner';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { SortableHeaderProps, InscriptionsTableDesktopProps, TurnoData } from './types';
import { formatDateTime } from '@/utils/date-utils';

const SortableHeader: React.FC<SortableHeaderProps> = ({ children, name, sortConfig, onSort }) => {
  const isSorted = sortConfig.key === name;
  const direction = isSorted ? sortConfig.direction : undefined;

  const getIcon = () => {
    if (!isSorted) return <FaSort className="inline ml-1 opacity-20" />;
    if (direction === 'asc') return <FaSortUp className="inline ml-1 text-indigo-500" />;
    return <FaSortDown className="inline ml-1 text-indigo-500" />;
  };

  return (
    <th
      className="px-4 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest cursor-pointer hover:bg-gray-200 transition-colors"
      onClick={() => onSort(name)}
    >
      <div className="flex items-center">
        {children}
        {getIcon()}
      </div>
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
      <div className="inline-block min-w-full shadow-sm rounded-xl overflow-hidden border border-gray-100">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <SortableHeader name="nombre" sortConfig={sortConfig} onSort={handleSort}>Nombre</SortableHeader>
              <SortableHeader name="email" sortConfig={sortConfig} onSort={handleSort}>Email</SortableHeader>
              <SortableHeader name="celular" sortConfig={sortConfig} onSort={handleSort}>Celular</SortableHeader>
              {!hideCourseTitle && <SortableHeader name="courseTitle" sortConfig={sortConfig} onSort={handleSort}>Taller</SortableHeader>}
              <SortableHeader name="coursePrice" sortConfig={sortConfig} onSort={handleSort}>Precio</SortableHeader>
              {showDepositFeature && <SortableHeader name="depositAmount" sortConfig={sortConfig} onSort={handleSort}>Seña</SortableHeader>}
              <SortableHeader name="paymentStatus" sortConfig={sortConfig} onSort={handleSort}>Pago</SortableHeader>
              <SortableHeader name="sourceType" sortConfig={sortConfig} onSort={handleSort}>Origen</SortableHeader>
              <SortableHeader name="marketingSource" sortConfig={sortConfig} onSort={handleSort}>Campaña</SortableHeader>
              <th className="px-4 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Acciones</th>
              <SortableHeader name="fechaInscripcion" sortConfig={sortConfig} onSort={handleSort}>Fecha</SortableHeader>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-50">
            {inscriptions.map((inscription) => (
              <tr key={inscription._id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-4 text-sm">
                  <p className="text-gray-900 font-bold leading-tight">{inscription.nombre}</p>
                  <p className="text-gray-500 text-[11px]">{inscription.apellido}</p>
                </td>
                <td className="px-4 py-4 text-[11px] max-w-[150px]">
                  <p className="text-gray-600 break-all font-medium leading-tight">{inscription.email}</p>
                </td>
                <td className="px-4 py-4 text-sm">
                  <p className="text-gray-900 font-mono text-[12px]">{inscription.celular}</p>
                </td>
                {!hideCourseTitle && (
                  <td className="px-4 py-4 text-sm max-w-[150px]">
                    <p className="text-gray-800 font-bold text-[11px] leading-tight uppercase">{inscription.courseTitle || 'N/A'}</p>
                  </td>
                )}
                <td className="px-4 py-4 text-sm font-mono font-bold text-gray-900">
                  ${inscription.coursePrice || 0}
                </td>
                {showDepositFeature && (
                  <td className="px-4 py-4 text-sm">
                    {inscription.depositAmount && inscription.depositAmount > 0 ? (
                      <div>
                        <p className="text-green-600 font-bold font-mono">${inscription.depositAmount}</p>
                        <p className="text-[9px] text-gray-400 uppercase">
                          {inscription.depositDate ? new Date(inscription.depositDate).toLocaleDateString() : ''}
                        </p>
                      </div>
                    ) : (
                      <span className="text-gray-200 italic text-[11px]">Sin seña</span>
                    )}
                  </td>
                )}
                <td className="px-4 py-4 text-sm whitespace-nowrap">
                  <span className={`px-2 py-0.5 text-[9px] font-black rounded-full uppercase tracking-tighter border ${inscription.paymentStatus === 'paid'
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                    }`}>
                    {inscription.paymentStatus === 'paid' ? 'PAGADO' : 'PENDIENTE'}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm whitespace-nowrap">
                  <span className={`px-2 py-0.5 text-[9px] font-black rounded uppercase tracking-tighter border ${inscription.sourceType === 'landing'
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    : 'bg-gray-50 text-gray-500 border-gray-200'
                    }`}>
                    {inscription.sourceType === 'landing' ? 'LANDING' : 'APP'}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm whitespace-nowrap">
                  <span className="text-[10px] font-bold text-gray-600 uppercase tracking-tight">
                    {inscription.marketingSource || '-'}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    {inscription.paymentStatus === 'pending' && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handlePaymentStatusUpdate(inscription._id, 'paid')}
                          className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 text-[10px] font-black rounded shadow-sm transition-all uppercase"
                          disabled={loading}
                        >
                          PAGÓ
                        </button>
                        {showDepositFeature && !(inscription.depositAmount && inscription.depositAmount > 0) && (
                          <button
                            onClick={() => onDepositClick(inscription)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 text-[10px] font-black rounded shadow-sm transition-all uppercase"
                            disabled={loading}
                          >
                            SEÑA
                          </button>
                        )}
                      </div>
                    )}
                    {inscription.paymentStatus === 'paid' && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handlePaymentStatusUpdate(inscription._id, 'pending')}
                          className="bg-gray-400 hover:bg-gray-500 text-white px-2 py-1 text-[10px] font-black rounded shadow-sm transition-all uppercase"
                          disabled={loading}
                        >
                          REV
                        </button>
                        <button
                          onClick={() => handleSendCourseEmail(inscription)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 text-[10px] font-black rounded shadow-sm transition-all uppercase"
                          disabled={loading}
                        >
                          VIDEO
                        </button>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4 text-sm whitespace-nowrap">
                  <div className="text-gray-500 font-mono text-[10px] leading-tight text-right">
                    <p>{formatDateTime(inscription.fechaInscripcion).date}</p>
                    <p className="opacity-50">{formatDateTime(inscription.fechaInscripcion).time}</p>
                  </div>
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
