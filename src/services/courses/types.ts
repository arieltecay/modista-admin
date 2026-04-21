/**
 * @file Tipos e Interfaces específicos para el dominio de Cursos
 * @module services/courses/types
 */

export interface Course {
    id: string; // UUID (Principal)
    _id?: string; // ObjectId (Interno)
    uuid?: string; // Alias deprecado para id
    title: string;
    description: string;
    price: number;
    image?: string;
    deeplink?: string;
    coursePaid?: string;
    category?: string;
    shortDescription?: string;
    imageUrl?: string;
    isPresencial?: boolean;
    isWorkshop?: boolean;
    status?: string;
    lastMonthlyClosureDate?: Date;
    currentPaymentCycleStartDate?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface MonthlyClosureReport {
    _id: string;
    courseId: string | Partial<Course>;
    closureDate: string;
    paymentMonth: number;
    paymentYear: number;
    totalAmountCollected: number;
    reportUrl: string;
    generatedAt: string;
}

export interface CreateCourseData {
    title: string;
    description: string;
    price: number;
    image?: string;
    deeplink?: string;
    coursePaid?: string;
    shortDescription?: string;
}

export type UpdateCourseData = Partial<CreateCourseData>;

export interface CoursePaidResponse {
    success: boolean;
    data: {
        courseTitle: string;
        coursePaid: string;
    };
}

export interface CourseFilters {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
}
