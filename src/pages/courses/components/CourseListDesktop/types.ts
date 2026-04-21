import { Course, SortConfig } from '../../types';

export interface CourseListDesktopProps {
  courses: Course[];
  loading: boolean;
  sortConfig: SortConfig;
  handleSort: (key: string) => void;
  handleEdit: (id: string) => void;
  handleDelete: (id: string) => void;
}
