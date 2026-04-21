import { apiClient } from '../config/apiClient';
import type { PaginatedResponse } from '../types';
import type {
    Course,
    CreateCourseData,
    UpdateCourseData,
    MonthlyClosureReport
} from './types';

export const processMonthlyClosure = (courseId: string, closureDate: string): Promise<MonthlyClosureReport> =>
    apiClient.post(`/courses/${courseId}/process-closure`, { closureDate });

export const getMonthlyReports = (
    courseId: string,
    page: number = 1,
    limit: number = 10
): Promise<PaginatedResponse<MonthlyClosureReport>> =>
    apiClient.get(`/courses/${courseId}/reports`, {
        params: { page, limit }
    });

export const getCourses = (): Promise<Course[]> =>
    apiClient.get('/courses');

export const createCourse = (courseData: CreateCourseData): Promise<Course> =>
    apiClient.post('/courses', courseData);

export const updateCourse = (courseId: string, courseData: UpdateCourseData): Promise<Course> =>
    apiClient.put(`/courses/${courseId}`, courseData);

export const deleteCourse = (courseId: string): Promise<{ message: string }> =>
    apiClient.delete(`/courses/${courseId}`);

export const getCourseById = (id: string): Promise<Course> =>
    apiClient.get(`/courses/${id}`);

export const getCoursesAdmin = (
    page: number = 1,
    limit: number = 10,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
    search?: string
): Promise<PaginatedResponse<Course>> =>
    apiClient.get('/courses/admin', {
        params: { page, limit, sortBy, sortOrder, search },
    });
