import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#fff7f8' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ width: 48, height: 48, border: '4px solid #f3d0d9', borderTop: '4px solid #C0392B', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#666' }}>Loading AnemiaAI...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to={role === 'doctor' ? '/doctor-dashboard' : '/dashboard'} replace />;
  }

  return children;
}

export default ProtectedRoute;

