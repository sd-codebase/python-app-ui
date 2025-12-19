import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@stores/authStore';
import { ROUTES } from '@utils/constants';

interface PublicRouteProps {
  children: React.ReactNode;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated, role } = useAuthStore();

  if (isAuthenticated) {
    const redirectTo = role === 'admin' ? ROUTES.ADMIN_DASHBOARD : ROUTES.DASHBOARD;
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};
