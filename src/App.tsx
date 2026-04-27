import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout/AdminLayout';
import LoginPage from './pages/auth/LoginPage';
import InscriptionsListPage from './pages/inscriptions/InscriptionsListPage';
import CourseListPage from './pages/courses/CourseListPage';
import CourseAddPage from './pages/courses/CourseAddPage';
import CourseEditPage from './pages/courses/CourseEditPage';
import CarouselManagerPage from './pages/carousel/CarouselManagerPage';
import WorkshopSelectorPage from './pages/workshops/WorkshopSelectorPage';
import WorkshopInscriptionsPage from './pages/workshops/WorkshopInscriptionsPage';
import WorkshopSchedulePage from './pages/workshops/WorkshopSchedulePage';
import WorkshopAnalyticsPage from './pages/workshops/WorkshopAnalyticsPage';
import WorkshopMonthlyClosurePage from './pages/workshops/WorkshopMonthlyClosurePage';
import FAQPage from './pages/faq/FAQPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route element={<AdminLayout />}>
              <Route path="dashboard" element={<InscriptionsListPage />} />
              <Route path="courses" element={<CourseListPage />} />
              <Route path="courses/add" element={<CourseAddPage />} />
              <Route path="courses/edit/:id" element={<CourseEditPage />} />
              <Route path="carousel" element={<CarouselManagerPage />} />
              <Route path="faq" element={<FAQPage />} />
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
      </Router>
    </AuthProvider>
  );
}

export default App;
