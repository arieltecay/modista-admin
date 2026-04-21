import type { FC } from 'react';
import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  handlePrevPage: () => void;
  handleNextPage: () => void;
  handleItemsPerPageChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const Pagination: FC<PaginationProps> = ({ 
  currentPage, 
  totalPages, 
  totalItems, 
  itemsPerPage, 
  handlePrevPage, 
  handleNextPage, 
  handleItemsPerPageChange 
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="px-5 py-5 bg-white border-t flex flex-col xs:flex-row items-center xs:justify-between">
      <div className="flex items-center">
        <span className="text-xs xs:text-sm text-gray-900">Resultados por página:</span>
        <select onChange={handleItemsPerPageChange} value={itemsPerPage} className="ml-2 text-sm border border-gray-300 rounded">
          {[10, 20, 30, 50].map(size => (<option key={size} value={size}>{size}</option>))}
        </select>
      </div>
      <span className="text-xs xs:text-sm text-gray-900">
        Mostrando {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} a {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} resultados
      </span>
      <div className="inline-flex mt-2 xs:mt-0">
        <button onClick={handlePrevPage} disabled={currentPage === 1} className="text-sm bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-l disabled:opacity-50 disabled:cursor-not-allowed">Anterior</button>
        <button onClick={handleNextPage} disabled={currentPage >= totalPages || totalItems === 0} className="text-sm bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-r disabled:opacity-50 disabled:cursor-not-allowed">Siguiente</button>
      </div>
    </div>
  );
};

export default Pagination;
