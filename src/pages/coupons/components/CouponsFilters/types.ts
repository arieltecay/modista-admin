export interface CouponsFiltersProps {
  status: '' | 'active' | 'paused' | 'scheduled' | 'expired' | 'exhausted';
  /** Empty = every course. */
  courseId: string;
  courses: Array<{ id: string; title: string }>;
  onStatusChange: (status: CouponsFiltersProps['status']) => void;
  onCourseChange: (courseId: string) => void;
}
