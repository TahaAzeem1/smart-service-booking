import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PublicRoute() {
  const { user, loading } = useAuth();
  const loc = useLocation();

  const isLoading = loading === true;
  if (isLoading) return <div className="p-6">Loading...</div>;

  // logged-in user ko login/signup par mat rehne do
  if (user) {
    const to = loc.state?.from || "/services";
    return <Navigate to={to} replace />;
  }

  return <Outlet />;
}
