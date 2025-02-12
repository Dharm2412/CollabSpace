import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export function AuthRoute({ children }) {
  const { currentUser } = useAuth();
  return currentUser ? <Navigate to="/" /> : children;
} 