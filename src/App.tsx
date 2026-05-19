import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout/AdminLayout';

// Lazy loading components
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));
const InscriptionsListPage = lazy(() => import('./pages/inscriptions/InscriptionsListPage'));
const CourseListPage = lazy(() => import('./pages/courses/CourseListPage'));
const CourseAddPage = lazy(() => import('./pages/courses/CourseAddPage'));
const CourseEditPage = lazy(() => import('./pages/courses/CourseEditPage'));
const CarouselManagerPage = lazy(() => import('./pages/carousel/CarouselManagerPage'));
const WorkshopSelectorPage = lazy(() => import('./pages/workshops/WorkshopSelectorPage'));
const WorkshopInscriptionsPage = lazy(() => import('./pages/workshops/WorkshopInscriptionsPage'));
const WorkshopSchedulePage = lazy(() => import('./pages/workshops/WorkshopSchedulePage'));
const WorkshopAnalyticsPage = lazy(() => import('./pages/workshops/WorkshopAnalyticsPage'));
const WorkshopMonthlyClosurePage = lazy(() => import('./pages/workshops/WorkshopMonthlyClosurePage'));
const FAQPage = lazy(() => import('./pages/faq/FAQPage'));
const TestimonialsPage = lazy(() => import('./pages/testimonials/TestimonialsPage'));
const BotMessagePage = lazy(() => import('./pages/bot-message/BotMessagePage'));
const TariffListPage = lazy(() => import('./pages/tariffs/TariffListPage'));
const TariffFormPage = lazy(() => import('./pages/tariffs/TariffFormPage'));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
        <Toaster />
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route element={<AdminLayout />}>
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="inscriptions" element={<InscriptionsListPage />} />
                <Route path="courses" element={<CourseListPage />} />
                <Route path="courses/add" element={<CourseAddPage />} />
                <Route path="courses/edit/:id" element={<CourseEditPage />} />
                <Route path="carousel" element={<CarouselManagerPage />} />
                <Route path="chat" element={<BotMessagePage />} />

                <Route path="faq" element={<FAQPage />} />
                <Route path="testimonials" element={<TestimonialsPage />} />
                <Route path="tariffs" element={<TariffListPage />} />
                <Route path="tariffs/add" element={<TariffFormPage />} />
                <Route path="tariffs/edit/:id" element={<TariffFormPage />} />
                <Route path="workshops" element={<WorkshopSelectorPage />} />
                <Route path="workshops/:id" element={<WorkshopInscriptionsPage />} />
                <Route path="workshops/:id/schedule" element={<WorkshopSchedulePage />} />
                <Route path="workshops/more-info/:id" element={<WorkshopAnalyticsPage />} />
                <Route path="workshops/closures/:id" element={<WorkshopMonthlyClosurePage />} />
                <Route index element={<Navigate to="dashboard" replace />} />
              </Route>
            </Route>
            <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="*" element={<div className="min-h-screen flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-800">404</h1>
                <p className="text-gray-600">Página no encontrada</p>
                <button onClick={() => window.location.href = '/admin/dashboard'} className="mt-4 text-indigo-600 font-medium">Volver</button>
              </div>
            </div>} />
          </Routes>
        </Suspense>
      </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
