import { Course } from '@/services/types';

export interface CourseLinksProps {
  course: Course;
  variant?: 'mobile' | 'desktop';
}
