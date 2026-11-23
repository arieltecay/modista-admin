import type { CouponsFiltersProps } from './types';

const STATUS_OPTIONS: Array<{ value: CouponsFiltersProps['status']; label: string }> = [
  { value: '', label: 'Todos' },
  { value: 'active', label: 'Activos' },
  { value: 'scheduled', label: 'Programados' },
  { value: 'paused', label: 'Pausados' },
  { value: 'expired', label: 'Vencidos' },
  { value: 'exhausted', label: 'Agotados' },
];
const FIELD = 'rounded-md border border-gray-300 px-3 py-2 text-sm';

export const CouponsFilters = ({ status, courseId, courses, onStatusChange, onCourseChange }: CouponsFiltersProps) => (
  <div className="flex flex-wrap items-end gap-4">
    <div className="flex flex-col gap-1 text-sm font-medium text-gray-700">
      <label htmlFor="filter-status">Estado</label>
      <select id="filter-status" value={status} onChange={(event) => onStatusChange(event.target.value as CouponsFiltersProps['status'])} className={FIELD}>
        {STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
    <div className="flex flex-col gap-1 text-sm font-medium text-gray-700">
      <label htmlFor="filter-course">Filtrar por curso</label>
      <select id="filter-course" value={courseId} onChange={(event) => onCourseChange(event.target.value)} className={FIELD}>
        <option value="">Todos los cursos</option>
        {courses.map((course) => (
          <option key={course.id} value={course.id}>
            {course.title}
          </option>
        ))}
      </select>
    </div>
  </div>
);

export default CouponsFilters;
