import { Navigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

function ProtectedRoute({ children, roles }) {
  const { currentUser } = useUser();

  if (!currentUser || !roles.includes(currentUser.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute; 