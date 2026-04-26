import type { FC } from 'react';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCoursesAdmin } from '@/services/courses/coursesService';
import Spinner from '@/components/shared/Spinner';
import { HiPlus, HiChevronRight, HiAcademicCap, HiArrowLeft } from 'react-icons/hi';

interface Course {
  _id: string;
  uuid?: string;
  id?: string;
  title: string;
  isPresencial: boolean;
  imageUrl: string;
  shortDescription: string;
}

const WorkshopSelectorPage: FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response: any = await getCoursesAdmin(1, 100);
        // Filtrar solo los cursos presenciales
        const presencialCourses: Course[] = response.data.filter((c: any) => c.isPresencial);
        setCourses(presencialCourses);
      } catch (error: any) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Spinner text="Cargando talleres..." /></div>;

  return (
    <div className="bg-gray-50/30 min-h-screen p-4 sm:p-10">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center text-gray-500 hover:text-indigo-600 mb-6 transition-colors font-medium text-sm group"
          >
            <HiArrowLeft className="h-4 w-4 mr-1.5 group-hover:-translate-x-1 transition-transform" />
            Volver al Panel General
          </button>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">Gestión de Talleres Presenciales</h1>
              <p className="text-gray-500 mt-2 text-lg font-medium">Selecciona un taller para gestionar inscriptos, pagos y horarios.</p>
            </div>
            <button
              onClick={() => navigate('/admin/courses/add?type=presencial')}
              className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all active:scale-95 flex items-center"
            >
              <HiPlus className="h-6 w-6 mr-2" />
              Crear Nuevo Taller
            </button>
          </div>
        </header>

        {courses.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-20 text-center shadow-sm border border-gray-100">
            <div className="bg-emerald-50 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <HiAcademicCap className="h-12 w-12 text-emerald-600" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">No hay talleres presenciales</h2>
            <p className="text-gray-500 mb-10 max-w-md mx-auto text-lg font-medium">Para que un taller aparezca aquí, debe estar marcado como "Presencial" en la configuración del curso.</p>
            <button
              onClick={() => navigate('/admin/courses')}
              className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95"
            >
              Configurar Cursos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            {courses.map(course => (
              <div
                key={course._id}
                onClick={() => navigate(`/admin/workshops/${course.uuid || course.id || course._id}`)}
                className="group bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
              >
                <div className="h-56 overflow-hidden relative">
                  <img
                    src={course.imageUrl}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-8">
                    <span className="px-4 py-1.5 bg-emerald-500/90 backdrop-blur-sm text-white text-[10px] font-black rounded-full uppercase tracking-[0.2em] shadow-lg">
                      Presencial
                    </span>
                  </div>
                </div>
                <div className="p-8">
                  <h2 className="text-2xl font-black text-gray-900 mb-3 truncate group-hover:text-indigo-600 transition-colors tracking-tight">
                    {course.title}
                  </h2>
                  <p className="text-gray-500 text-sm font-medium line-clamp-2 mb-8 leading-relaxed">
                    {course.shortDescription}
                  </p>
                  <div className="flex justify-between items-center pt-6 border-t border-gray-50">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-300 uppercase font-black tracking-widest mb-0.5">Acción</span>
                      <span className="text-base font-bold text-gray-700 group-hover:text-indigo-600 transition-colors">Gestionar Taller</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm">
                      <HiChevronRight className="h-6 w-6" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkshopSelectorPage;
