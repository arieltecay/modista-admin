import { useState, useEffect } from 'react';
import { getCourses } from '../services/courses/coursesService';
import type { Course } from '../services/courses/types';

export const useCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const data = await getCourses();
        setCourses(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Error al cargar los cursos');
        console.error('Error in useCourses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return { courses, loading, error };
};
