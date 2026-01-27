import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import supabase from "../supabaseClient";

export default function Footer() {
  const [adminHref, setAdminHref] = useState("/admin-login");

  useEffect(() => {
    let alive = true;

    async function checkAdmin() {
      const { data } = await supabase.auth.getSession();
      const user = data?.session?.user;

      if (!user?.id) {
        if (alive) setAdminHref("/admin-login");
        return;
      }

      const { data: adminRow } = await supabase
        .from("admins")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (alive) setAdminHref(adminRow ? "/admin" : "/admin-login");
    }

    checkAdmin();

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      checkAdmin();
    });

    return () => {
      alive = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  return (
    <footer className="border-t bg-white dark:bg-gray-900 dark:border-gray-800">
      <div className="mx-auto max-w-6xl px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <span className="leading-relaxed">
            © {new Date().getFullYear()} Smart Service Booking Platform
          </span>

          <div className="flex items-center justify-between sm:justify-end gap-3">
            {/* Admin button */}
            <Link
              to={adminHref}
              className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700
                         text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10"
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
