import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import Layout from "./components/Layout";

import Home from "./Pages/Home";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import Services from "./Pages/Services";
import ServiceDetail from "./Pages/ServiceDetail";
import Dashboard from "./Pages/Dashboard";

import AdminLogin from "./Pages/admin/AdminLogin";
import AdminDashboard from "./Pages/admin/AdminDashboard";

import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";
import AdminRoute from "./components/AdminRoute";

import { useAuth } from "./context/AuthContext";
import supabase from "./supabaseClient";

function RootRedirect() {
  const { user, loading } = useAuth();
  const isLoading = loading === true;

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-slate-600 dark:text-white/70">Loading...</div>
      </div>
    );
  }

  return user ? <Navigate to="/services" replace /> : <Navigate to="/login" replace />;
}

function AuthWatcher() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === "TOKEN_REFRESH_FAILED") {
        try {
          await supabase.auth.signOut();
        } catch (e) {}
        navigate("/login", { replace: true, state: { from: location.pathname } });
      }

      if (event === "SIGNED_OUT") {
        if (
          location.pathname.startsWith("/services") ||
          location.pathname.startsWith("/dashboard") ||
          location.pathname.startsWith("/admin")
        ) {
          navigate("/login", { replace: true, state: { from: location.pathname } });
        }
      }
    });

    return () => {
      data?.subscription?.unsubscribe?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, location.pathname, user?.id]);

  return null;
}

export default function App() {
  return (
    <Layout>
      <AuthWatcher />

      <Routes>
        <Route path="/" element={<RootRedirect />} />

        {/* ✅ Admin login accessible for both logged-in and logged-out users */}
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* ✅ Public routes (only for logged-out users) */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>

        {/* ✅ Protected routes (only for logged-in users) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:id" element={<ServiceDetail />} />
          <Route path="/dashboard" element={<Dashboard />} />

          {/* ✅ Admin Dashboard */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
