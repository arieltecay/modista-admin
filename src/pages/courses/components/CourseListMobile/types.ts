import { Course } from '../../types';

export interface CourseListMobileProps {
  courses: Course[];
  loading: boolean;
  handleEdit: (id: string) => void;
  handleDelete: (id: string) => void;
}
