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
          <div key={i} className="animate-pulse bg-white p-5 rounded-lg shadow h-36"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="md:hidden space-y-4">
      {courses.map((course) => (
        <div key={course._id || course.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="relative">
            <img className="w-full h-44 object-cover" src={course.imageUrl || course.image} alt={course.title} />
            <div className="absolute top-3 right-3 flex gap-1.5">
              {(course.isPresencial) && (
                <button onClick={() => navigate(`/admin/workshops/${course.uuid || course.id || course._id}/schedule`)} className="p-2 bg-white/90 backdrop-blur-sm text-emerald-600 rounded-lg shadow-sm hover:bg-white"><CalendarIcon className="h-5 w-5" /></button>
              )}
              <button onClick={() => handleEdit((course._id || course.id) as string)} className="p-2 bg-white/90 backdrop-blur-sm text-indigo-600 rounded-lg shadow-sm hover:bg-white"><PencilIcon className="h-5 w-5" /></button>
              <button onClick={() => handleDelete((course._id || course.id) as string)} className="p-2 bg-white/90 backdrop-blur-sm text-red-600 rounded-lg shadow-sm hover:bg-white"><TrashIcon className="h-5 w-5" /></button>
            </div>
            <div className="absolute top-3 left-3 flex gap-1.5">
              <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-white/90 backdrop-blur-sm text-blue-800 shadow-sm">{course.category || '-'}</span>
              <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full shadow-sm ${course.status === 'active' ? 'bg-green-500/90 text-white' : 'bg-gray-500/90 text-white'}`}>
                {course.status === 'active' ? 'ACTIVO' : 'INACTIVO'}
              </span>
            </div>
          </div>
          <div className="p-4">
            <h3 className="text-base font-bold text-gray-900 line-clamp-2 leading-snug mb-2">{course.title}</h3>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${course.isPresencial ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-50 text-blue-600'}`}>
                {course.isPresencial ? 'PRESENCIAL' : 'ONLINE'}
              </span>
              <span className="text-lg font-bold text-gray-900">{formatPrice(course.price)}</span>
            </div>
            <CourseLinks course={course} variant="mobile" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default CoursesListMobile;
