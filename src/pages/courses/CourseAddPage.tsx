import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createCourse } from '@/services/courses/coursesService';
import { defaultCourseValues } from '@/pages/courses/validation/courseValidation';
import CourseForm from '@/pages/courses/components/CourseForm';
import toast from 'react-hot-toast';

const CourseAddPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const isPresencialParam = queryParams.get('type') === 'presencial';
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (courseData: any) => {
    setIsSubmitting(true);
    try {
      await createCourse(courseData);
      toast.success('Curso creado exitosamente');
      navigate('/admin/courses');
    } catch (error: any) {
      toast.error(error.message || 'Error al crear el curso');
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className="container mx-auto py-4">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Agregar Nuevo Curso</h1>
        <button onClick={() => navigate('/admin/courses')} className="text-gray-600 hover:text-gray-900">← Volver</button>
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <CourseForm initialData={{ ...defaultCourseValues, isPresencial: isPresencialParam }} onSubmit={handleSubmit} isEditing={false} isSubmitting={isSubmitting} />
      </div>
    </div>
  );
};

export default CourseAddPage;
