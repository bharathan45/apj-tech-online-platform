import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { PublicLayout } from './components/PublicLayout';
import { SiteProvider } from './context/SiteContext';
import { AboutPage } from './pages/AboutPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { CertificatesPage } from './pages/CertificatesPage';
import { ContactPage } from './pages/ContactPage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { CoursesPage } from './pages/CoursesPage';
import { HomePage } from './pages/HomePage';
import { MaterialsPage } from './pages/MaterialsPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ServicesPage } from './pages/ServicesPage';

function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const target = document.getElementById(hash.slice(1));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname, hash]);

  return null;
}

export default function App() {
  return (
    <SiteProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Separate Secure Admin Dashboard Routes */}
          <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />

          {/* Public Website Routes */}
          <Route
            path="/"
            element={
              <PublicLayout>
                <HomePage />
              </PublicLayout>
            }
          />
          <Route
            path="/about"
            element={
              <PublicLayout>
                <AboutPage />
              </PublicLayout>
            }
          />
          <Route
            path="/services"
            element={
              <PublicLayout>
                <ServicesPage />
              </PublicLayout>
            }
          />
          <Route
            path="/projects"
            element={
              <PublicLayout>
                <ProjectsPage />
              </PublicLayout>
            }
          />
          <Route
            path="/courses"
            element={
              <PublicLayout>
                <CoursesPage />
              </PublicLayout>
            }
          />
          <Route
            path="/courses/:slug"
            element={
              <PublicLayout>
                <CourseDetailPage />
              </PublicLayout>
            }
          />
          <Route
            path="/materials"
            element={
              <PublicLayout>
                <MaterialsPage />
              </PublicLayout>
            }
          />
          <Route
            path="/certificates"
            element={
              <PublicLayout>
                <CertificatesPage />
              </PublicLayout>
            }
          />
          <Route
            path="/contact"
            element={
              <PublicLayout>
                <ContactPage />
              </PublicLayout>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </SiteProvider>
  );
}
