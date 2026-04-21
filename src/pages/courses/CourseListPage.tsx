import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCoursesAdmin, deleteCourse } from '@/services/courses/coursesService';
import toast from 'react-hot-toast';
import CoursesListMobile from '@/pages/courses/components/CourseListMobile';
import CoursesListDesktop from '@/pages/courses/components/CourseListDesktop';
import ConfirmDeleteModal from '@/components/shared/ConfirmDeleteModal';
import { useDebounce } from '@/hooks/useDebounce';
import type { Course } from '@/services/types';
import type { SortConfig, CoursesStats, DeleteModalState } from './types';
import { StatCard, BookIcon, SearchIcon } from '@/components/shared/AdminStatComponents';

const CourseListPage: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [totalItems, setTotalItems] = useState<number>(0);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'createdAt', direction: 'desc' });

  const [coursesStats, setCoursesStats] = useState<CoursesStats | null>(null);
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({ isOpen: false, courseId: null, courseTitle: '' });
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const data = await getCoursesAdmin(
          currentPage,
          itemsPerPage,
          sortConfig.key,
          sortConfig.direction,
          debouncedSearchTerm
        );
        setCourses(data.data);
        setTotalItems(data.total);

        setCoursesStats({ total: data.total });
      } catch (err: any) {
        setError(err.message || 'Error al cargar los cursos.');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [currentPage, itemsPerPage, debouncedSearchTerm, sortConfig]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  const handleDeleteCourse = async () => {
    if (!deleteModal.courseId) return;
    setIsDeleting(true);
    try {
      await deleteCourse(deleteModal.courseId);
      setCourses(prev => prev.filter(c => (c._id || c.id) !== deleteModal.courseId));
      if (coursesStats) setCoursesStats({ total: coursesStats.total - 1 });
      toast.success('Curso eliminado exitosamente');
    } catch (error: any) {
      toast.error('Error al eliminar el curso: ' + error.message);
    } finally {
      setIsDeleting(false);
      setDeleteModal({ isOpen: false, courseId: null, courseTitle: '' });
    }
  };

  const handleEdit = (courseId: string) => navigate(`/admin/courses/edit/${courseId}`);
  const handleDelete = (courseId: string) => {
    const course = courses.find(c => (c._id || c.id) === courseId);
    if (course) setDeleteModal({ isOpen: true, courseId, courseTitle: course.title });
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="p-8 bg-white shadow-lg rounded-lg text-center">
          <h2 className="text-2xl font-bold text-red-600">Error</h2>
          <p className="mt-2 text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  const handlePrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 sm:px-8 py-4">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Gestión de Cursos</h1>
            <p className="text-sm text-gray-500">Administra todos los cursos de la plataforma</p>
          </div>
          <button
            onClick={() => navigate('/admin/courses/add')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Agregar Curso
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <StatCard title="Total Cursos" value={coursesStats?.total ?? '...'} icon={<BookIcon />} colorClass="bg-blue-100" loading={!coursesStats} />
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <div className="mb-6">
            <div className="relative max-w-md">
              <SearchIcon />
              <input
                type="text"
                placeholder="Buscar curso..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-2 w-full border border-gray-200 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              />
            </div>
          </div>

          <CoursesListMobile courses={courses} loading={loading} handleEdit={handleEdit} handleDelete={handleDelete} />
          <CoursesListDesktop courses={courses} loading={loading} sortConfig={sortConfig} handleSort={handleSort} handleEdit={handleEdit} handleDelete={handleDelete} />

          {totalPages > 1 && (
            <div className="mt-8 flex justify-between items-center">
              <div className="flex items-center space-x-2 text-sm">
                <span>Mostrar</span>
                <select value={itemsPerPage} onChange={handleItemsPerPageChange} className="border rounded px-1">
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={handlePrevPage} disabled={currentPage === 1} className="px-3 py-1 border rounded disabled:opacity-50">Ant.</button>
                <span className="text-sm">Página {currentPage} de {totalPages}</span>
                <button onClick={handleNextPage} disabled={currentPage === totalPages} className="px-3 py-1 border rounded disabled:opacity-50">Sig.</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, courseId: null, courseTitle: '' })}
        onConfirm={handleDeleteCourse}
        itemName={deleteModal.courseTitle}
        itemType="el curso"
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default CourseListPage;
