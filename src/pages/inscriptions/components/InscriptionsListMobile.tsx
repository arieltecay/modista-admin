import React from 'react';
import Spinner from '../../../components/shared/Spinner';
import { TurnoData, InscriptionsListMobileProps } from './types';

const InscriptionsListMobile: React.FC<InscriptionsListMobileProps> = ({
  inscriptions,
  loading,
  handlePaymentStatusUpdate,
  handleSendCourseEmail,
  showDepositFeature = false,
  onDepositClick,
  hideCourseTitle = false
}) => {
  if (loading) {
    return <div className="flex justify-center items-center p-10"><Spinner /></div>;
  }

  return (
    <div className="md:hidden">
      {inscriptions.map((inscription) => (
        <div key={inscription._id} className="bg-white p-4 rounded-lg shadow mb-4 border border-gray-100">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="font-bold text-gray-900 whitespace-normal">{inscription.nombre} {inscription.apellido}</p>
              {inscription.turnoId && typeof inscription.turnoId === 'object' && (
                <p className="text-xs text-indigo-600 font-bold bg-indigo-50 inline-block px-1.5 py-0.5 rounded mt-0.5">
                  {(inscription.turnoId as TurnoData).diaSemana} - {(inscription.turnoId as TurnoData).horaInicio} hs
                </p>
              )}
            </div>
            <span className="text-xs text-gray-600 whitespace-nowrap">{new Date(inscription.fechaInscripcion).toLocaleDateString('es-AR')}</span>
          </div>
          <p className="text-sm text-gray-500 break-all">{inscription.email}</p>
          <p className="text-sm text-gray-500">{inscription.celular}</p>
          <div className="mt-3 flex justify-between items-end">
            <div>
              {!hideCourseTitle && <p className="text-sm font-medium text-gray-700 mb-1">{inscription.courseTitle || 'N/A'}</p>}
              <div className="flex items-center gap-2">
                <p className="text-sm text-green-600 font-bold">${inscription.coursePrice || 0}</p>
                {showDepositFeature && inscription.depositAmount && inscription.depositAmount > 0 ? (
                  <span className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded border border-green-100 font-bold">
                    Seña: ${inscription.depositAmount}
                  </span>
                ) : null}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`px-2 py-1 text-xs rounded-full border ${inscription.paymentStatus === 'paid'
                ? 'bg-green-100 text-green-800 border-green-200'
                : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                }`}>
                {inscription.paymentStatus === 'paid' ? '✅ Pagado' : '⏳ Pendiente'}
              </span>
              {inscription.paymentStatus === 'pending' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePaymentStatusUpdate(inscription._id, 'paid')}
                    className="bg-green-500 text-white px-3 py-1 text-xs rounded hover:bg-green-600 transition-colors"
                    disabled={loading}
                  >
                    {loading ? '...' : 'Pagado'}
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
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePaymentStatusUpdate(inscription._id, 'pending')}
                    className="bg-gray-500 text-white px-2 py-1 text-xs rounded hover:bg-gray-600 transition-colors"
                    disabled={loading}
                  >
                    Revertir
                  </button>
                  <button
                    onClick={() => handleSendCourseEmail(inscription)}
                    className="bg-blue-500 text-white px-3 py-1 text-xs rounded hover:bg-blue-600 transition-colors"
                    disabled={loading}
                  >
                    Video
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default InscriptionsListMobile;
