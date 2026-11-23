import { useEffect, useState } from 'react';
import { getCourses } from '@/services/courses/coursesService';
import type { CourseOption } from './types';

/** Courses a coupon can be tied to; an empty list (load failed) still lets the admin make "all courses" coupons. */
export const useCourseOptions = (): CourseOption[] => {
  const [options, setOptions] = useState<CourseOption[]>([]);

  useEffect(() => {
    let cancelled = false;
    getCourses()
      .then((courses) => {
        if (!cancelled) setOptions(courses.map((course) => ({ id: course.id, title: course.title, price: course.price })));
      })
      .catch(() => {
        if (!cancelled) setOptions([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return options;
};
