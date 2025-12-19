import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from '@utils/constants';

import { PublicRoute } from './PublicRoute';
import { AdminRoute } from './AdminRoute';

import {
  LoginPage,
  ForgotPasswordPage,
  ResetPasswordPage,
} from '@pages/auth';
import { AdminDashboardPage, AdminUsersPage, AdminSettingsPage, AdminPredefinedTestsPage, SetTestPage } from '@pages/admin';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path={ROUTES.LOGIN}
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path={ROUTES.FORGOT_PASSWORD}
        element={
          <PublicRoute>
            <ForgotPasswordPage />
          </PublicRoute>
        }
      />
      <Route
        path={ROUTES.RESET_PASSWORD}
        element={
          <PublicRoute>
            <ResetPasswordPage />
          </PublicRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path={ROUTES.ADMIN_DASHBOARD}
        element={
          <AdminRoute>
            <AdminDashboardPage />
          </AdminRoute>
        }
      />
      <Route
        path={ROUTES.SET_TEST}
        element={
          <AdminRoute>
            <SetTestPage />
          </AdminRoute>
        }
      />
      <Route
        path={ROUTES.ADMIN_PREDEFINED_TESTS}
        element={
          <AdminRoute>
            <AdminPredefinedTestsPage />
          </AdminRoute>
        }
      />
      <Route
        path={ROUTES.ADMIN_USERS}
        element={
          <AdminRoute>
            <AdminUsersPage />
          </AdminRoute>
        }
      />
      <Route
        path={ROUTES.ADMIN_SETTINGS}
        element={
          <AdminRoute>
            <AdminSettingsPage />
          </AdminRoute>
        }
      />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />
      <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
    </Routes>
  );
};

export * from './PublicRoute';
export * from './AdminRoute';
