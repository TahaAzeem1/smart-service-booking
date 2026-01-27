import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import supabase from "../supabaseClient";

export default function AdminGuard({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let alive = true;

    async function check() {
      setLoading(true);
      const { data } = await supabase.auth.getSession();
      const user = data?.session?.user;

      if (!user?.id) {
        if (alive) {
          setIsAdmin(false);
          setLoading(false);
        }
        return;
      }

      const { data: adminRow } = await supabase
        .from("admins")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (alive) {
        setIsAdmin(!!adminRow);
        setLoading(false);
      }
    }

    check();
    return () => {
      alive = false;
    };
  }, []);

  if (loading) return <div className="px-4 py-8 text-white/70">Checking admin...</div>;
  if (!isAdmin) return <Navigate to="/admin-login" replace />;

  return children;
}
