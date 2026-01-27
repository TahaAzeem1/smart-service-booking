import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading, profile } = useAuth();

  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  // optional: blocked user
  if (profile?.is_blocked) return <div className="p-6">Your account is blocked.</div>;

  return children;
}
