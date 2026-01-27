import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import supabase from "../supabaseClient";

export default function AdminRoute({ children }) {
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let alive = true;

    async function run() {
      setChecking(true);

      const { data } = await supabase.auth.getSession();
      const user = data?.session?.user;

      if (!user?.id) {
        if (alive) {
          setIsAdmin(false);
          setChecking(false);
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
        setChecking(false);
      }
    }

    run();
    return () => {
      alive = false;
    };
  }, []);

  if (checking) return <div className="p-6 text-white/70">Checking admin...</div>;

  if (!isAdmin) return <Navigate to="/admin-login" replace />;

  return children;
}
