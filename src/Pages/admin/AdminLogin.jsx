import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../supabaseClient";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;

    async function checkExistingAdmin() {
      const { data } = await supabase.auth.getSession();
      const user = data?.session?.user;
      if (!user?.id) return;

      const { data: adminRow } = await supabase
        .from("admins")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (alive && adminRow) navigate("/admin", { replace: true });
    }

    checkExistingAdmin();
    return () => {
      alive = false;
    };
  }, [navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const user = data?.user;
      if (!user?.id) throw new Error("Login failed (no user session).");

      const { data: adminRow, error: adminErr } = await supabase
        .from("admins")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (adminErr) throw adminErr;

      if (!adminRow) {
        await supabase.auth.signOut();
        throw new Error("Unauthorized: This account is not allowed as admin.");
      }

      navigate("/admin", { replace: true });
    } catch (e2) {
      setErr(e2?.message || "Admin login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 flex items-center justify-center px-4 py-10 dark:bg-slate-950 dark:text-white">
      <div className="w-full max-w-md rounded-2xl border border-black/10 bg-black/5 p-6 shadow-lg dark:border-white/10 dark:bg-white/5">
        <h1 className="text-2xl font-bold">Admin Login</h1>
        <p className="text-slate-600 mt-1 dark:text-white/70">
          Only admin account can access dashboard.
        </p>

        {err ? (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-red-700 text-sm dark:text-red-200">
            {err}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm text-slate-700 dark:text-white/80">Email</label>
            <input
              className="mt-1 w-full rounded-xl bg-white border border-black/10 px-4 py-3 outline-none focus:border-black/20
                         dark:bg-black/20 dark:border-white/10 dark:focus:border-white/25"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />
          </div>

          <div>
            <label className="text-sm text-slate-700 dark:text-white/80">Password</label>
            <input
              className="mt-1 w-full rounded-xl bg-white border border-black/10 px-4 py-3 outline-none focus:border-black/20
                         dark:bg-black/20 dark:border-white/10 dark:focus:border-white/25"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-black text-white py-3 font-semibold disabled:opacity-60
                       dark:bg-white dark:text-black"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
