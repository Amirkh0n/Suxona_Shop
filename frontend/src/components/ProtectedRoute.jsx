import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageSpinner } from './Spinner';

export default function ProtectedRoute({ children }) {
  const { user, initializing } = useAuth();
  const location = useLocation();

  if (initializing) return <PageSpinner />;
  if (!user) return <Navigate to="/kirish" state={{ from: location }} replace />;
  return children;
}

// Gate for the seller dashboard: requires a store application to exist.
// Doesn't require ACTIVE status — a PENDING store still sees the dashboard
// shell with a "waiting for approval" banner, since that's informative,
// not a security boundary.
export function SellerRoute({ children }) {
  const { user, myStore, initializing } = useAuth();
  const location = useLocation();

  if (initializing) return <PageSpinner />;
  if (!user) return <Navigate to="/kirish" state={{ from: location }} replace />;
  if (!myStore) return <Navigate to="/dokon-ochish" replace />;
  return children;
}
