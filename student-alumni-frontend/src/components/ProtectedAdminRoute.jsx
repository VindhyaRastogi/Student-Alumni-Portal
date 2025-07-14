// components/ProtectedAdminRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedAdminRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedAdminRoute;
