import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import CourseLinks from '../CourseLinks';
import { CourseListDesktopProps } from './types';

const CoursesListDesktop: React.FC<CourseListDesktopProps> = ({
  courses,
  loading,
  sortConfig,
  handleSort,
  handleEdit,
  handleDelete
}) => {
  const navigate = useNavigate();
  const formatPrice = (price: number | undefined) => {
    if (price === undefined) return '';
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(price);
  };

  const formatDate = (dateString: Date | string | undefined) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('es-AR', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getSortIcon = (column: string) => {
    if (sortConfig.key !== column) return '↕️';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse h-16 bg-gray-200 rounded"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="hidden md:block">
      <div className="overflow-x-auto shadow-sm border border-gray-100 rounded-xl">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('title')}>
                <div className="flex items-center space-x-1"><span>Curso</span><span>{getSortIcon('title')}</span></div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('category')}>
                <div className="flex items-center space-x-1"><span>Categoría</span><span>{getSortIcon('category')}</span></div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('price')}>
                <div className="flex items-center space-x-1"><span>Precio</span><span>{getSortIcon('price')}</span></div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('createdAt')}>
                <div className="flex items-center space-x-1"><span>Fecha</span><span>{getSortIcon('createdAt')}</span></div>
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {courses.map((course) => (
              <tr key={course._id || course.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img className="h-10 w-10 rounded-lg object-cover" src={course.imageUrl || course.image} alt={course.title} />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 max-w-xs truncate">{course.title}</div>
                      <CourseLinks course={course} variant="desktop" />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">{course.category || '-'}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatPrice(course.price)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-bold rounded-full ${course.isPresencial ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-50 text-blue-600'}`}>
                    {course.isPresencial ? 'PRESENCIAL' : 'ONLINE'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {course.status === 'active' ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <span className="w-2 h-2 mr-1.5 bg-green-500 rounded-full"></span>Activo
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      <span className="w-2 h-2 mr-1.5 bg-gray-400 rounded-full"></span>Inactivo
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(course.createdAt)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button onClick={() => handleEdit((course._id || course.id) as string)} className="text-indigo-600 hover:text-indigo-900"><PencilIcon className="h-5 w-5" /></button>
                    <button onClick={() => handleDelete((course._id || course.id) as string)} className="text-red-600 hover:text-red-900"><TrashIcon className="h-5 w-5" /></button>
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

export default CoursesListDesktop;
