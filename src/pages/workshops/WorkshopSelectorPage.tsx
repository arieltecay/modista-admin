import type { FC } from 'react';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCoursesAdmin } from '@/services/courses/coursesService';
import Spinner from '@/components/shared/Spinner';

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

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner text="Cargando talleres..." /></div>;

  return (
    <div className="bg-gray-50 min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Gestión de Talleres Presenciales</h1>
            <p className="text-gray-500">Selecciona un taller para gestionar horarios e inscriptos.</p>
          </div>
          <button onClick={() => navigate('/admin/courses/add?type=presencial')} className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold">Nuevo Taller</button>
        </header>

        {courses.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border">
            <h2 className="text-xl font-bold mb-4">No se encontraron talleres presenciales</h2>
            <button onClick={() => navigate('/admin/courses')} className="bg-indigo-600 text-white px-4 py-2 rounded">Configurar Cursos</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map(course => (
              <div key={course._id} onClick={() => navigate(`/admin/workshops/${course.uuid || course.id || course._id}`)} className="bg-white rounded-2xl shadow border overflow-hidden cursor-pointer hover:shadow-lg transition-all">
                <img src={course.imageUrl} className="h-40 w-full object-cover" />
                <div className="p-4">
                  <h2 className="text-lg font-bold mb-1 truncate">{course.title}</h2>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">{course.shortDescription}</p>
                  <div className="pt-4 border-t text-sm font-semibold text-indigo-600">Gestionar Taller →</div>
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
