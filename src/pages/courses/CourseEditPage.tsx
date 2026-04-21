import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCoursesAdmin, updateCourse } from '@/services/courses/coursesService';
import CourseForm from '@/pages/courses/components/CourseForm';
import toast from 'react-hot-toast';

const CourseEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await getCoursesAdmin(1, 1000);
        const found = response.data.find(c => (c._id || c.id) === id);
        if (found) setCourse({ ...found, price: found.price?.toString() });
      } catch (err) {
        toast.error('Error al cargar curso');
      } finally { setLoading(false); }
    };
    if (id) fetchCourse();
  }, [id]);

  const handleSubmit = async (courseData: any) => {
    setIsSubmitting(true);
    try {
      await updateCourse(id!, courseData);
      toast.success('Curso actualizado');
      navigate('/admin/courses');
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar');
    } finally { setIsSubmitting(false); }
  };

  if (loading) return <div className="flex justify-center p-10"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="container mx-auto py-4">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Editar Curso</h1>
        <button onClick={() => navigate('/admin/courses')} className="text-gray-600 hover:text-gray-900">← Volver</button>
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        {course && <CourseForm initialData={course} onSubmit={handleSubmit} isEditing={true} isSubmitting={isSubmitting} />}
      </div>
    </div>
  );
};

export default CourseEditPage;
