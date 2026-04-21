import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PencilIcon, TrashIcon, CalendarIcon } from '@heroicons/react/24/outline';
import CourseLinks from '../CourseLinks';
import { CourseListMobileProps } from './types';

const CoursesListMobile: React.FC<CourseListMobileProps> = ({ courses, loading, handleEdit, handleDelete }) => {
  const navigate = useNavigate();
  const formatPrice = (price: number | undefined) => {
    if (price === undefined) return '';
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(price);
  };

  const formatDate = (dateString: Date | string | undefined) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('es-AR', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="space-y-4 md:hidden">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse bg-white p-4 rounded-lg shadow h-24"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="md:hidden space-y-4">
      {courses.map((course) => (
        <div key={course._id || course.id} className="bg-white rounded-lg shadow p-4 border border-gray-100">
          <div className="flex space-x-4">
            <img className="w-16 h-16 rounded-lg object-cover" src={course.imageUrl || course.image} alt={course.title} />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between">
                <h3 className="text-sm font-medium text-gray-900 truncate">{course.title}</h3>
                <div className="flex space-x-1">
                  {(course.isPresencial) && (
                    <button onClick={() => navigate(`/admin/workshops/${course.uuid || course.id || course._id}/schedule`)} className="p-1 text-emerald-600"><CalendarIcon className="h-5 w-5" /></button>
                  )}
                  <button onClick={() => handleEdit((course._id || course.id) as string)} className="p-1 text-indigo-600"><PencilIcon className="h-5 w-5" /></button>
                  <button onClick={() => handleDelete((course._id || course.id) as string)} className="p-1 text-red-600"><TrashIcon className="h-5 w-5" /></button>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex gap-2">
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">{course.category || '-'}</span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${course.status === 'active' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                    {course.status === 'active' ? 'ACTIVO' : 'INACTIVO'}
                  </span>
                </div>
                <span className="text-sm font-bold text-gray-900">{formatPrice(course.price)}</span>
              </div>
              <CourseLinks course={course} variant="mobile" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CoursesListMobile;
