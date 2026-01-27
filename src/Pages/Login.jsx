import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import supabase from "../supabaseClient";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const HERO_IMAGE_URL = "https://auto.edu/hubfs/shutterstock_2063093864.jpg";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const to = location.state?.from || "/services";
      navigate(to, { replace: true });
    } catch (err) {
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-white text-slate-900 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* LEFT: Auth panel */}
          <div className="flex justify-center lg:justify-start">
            <div className="w-full max-w-md">
              {/* Brand */}
              <div className="mb-6 sm:mb-8">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-black/5 border border-black/10 flex items-center justify-center dark:bg-white/10 dark:border-white/10">
                    <span className="font-bold">SS</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold leading-none truncate">Smart Service Booking</p>
                    <p className="text-sm text-slate-500 truncate dark:text-white/60">
                      Secure access to your account
                    </p>
                  </div>
                </div>
              </div>

              {/* Card */}
              <div className="rounded-2xl border border-black/10 bg-black/5 backdrop-blur p-5 sm:p-6 shadow-xl dark:border-white/10 dark:bg-white/5">
                <h1 className="text-2xl sm:text-3xl font-bold">Welcome Back</h1>
                <p className="mt-2 text-slate-600 text-sm sm:text-base dark:text-white/60">
                  Please enter your details to continue.
                </p>

                {/* Toggle */}
                <div className="mt-5 grid grid-cols-2 rounded-xl bg-black/5 border border-black/10 p-1 dark:bg-white/5 dark:border-white/10">
                  <button
                    type="button"
                    className="rounded-lg py-2 text-sm font-semibold bg-black text-white dark:bg-white dark:text-black"
                  >
                    Sign In
                  </button>
                  <Link
                    to="/signup"
                    className="rounded-lg py-2 text-sm font-semibold text-center text-slate-600 hover:text-slate-900 dark:text-white/70 dark:hover:text-white"
                  >
                    Signup
                  </Link>
                </div>

                <form onSubmit={handleLogin} className="mt-5 space-y-4">
                  <div>
                    <label className="text-sm text-slate-600 dark:text-white/70">Email Address</label>
                    <div className="mt-2 rounded-xl border border-black/10 bg-white px-4 py-3 focus-within:border-black/20 dark:border-white/10 dark:bg-black/20 dark:focus-within:border-white/25">
                      <input
                        className="w-full bg-transparent outline-none placeholder:text-slate-400 dark:placeholder:text-white/30"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@email.com"
                        type="email"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-slate-600 dark:text-white/70">Password</label>
                    <div className="mt-2 rounded-xl border border-black/10 bg-white px-4 py-3 focus-within:border-black/20 dark:border-white/10 dark:bg-black/20 dark:focus-within:border-white/25">
                      <input
                        className="w-full bg-transparent outline-none placeholder:text-slate-400 dark:placeholder:text-white/30"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        type="password"
                        required
                      />
                    </div>
                  </div>

                  {error ? (
                    <div className="text-sm text-red-700 bg-red-500/10 border border-red-500/20 rounded-xl p-3 dark:text-red-200">
                      {error}
                    </div>
                  ) : null}

                  <button
                    disabled={loading}
                    className="w-full rounded-xl bg-black text-white font-semibold py-3 hover:opacity-90 disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-white/90"
                  >
                    {loading ? "Logging in..." : "Continue"}
                  </button>

                  <div className="mt-4 text-sm text-slate-600 dark:text-white/60">
                    Don’t have an account?{" "}
                    <Link to="/signup" className="text-slate-900 underline dark:text-white">
                      Sign up
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* RIGHT: Hero (Desktop) */}
          <div className="hidden lg:block">
            <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-black/5 dark:border-white/10 dark:bg-white/5">
              <div className="absolute inset-0 bg-gradient-to-br from-black/5 via-transparent to-transparent dark:from-white/10" />
              <div className="p-10">
                <div className="text-right">
                  <p className="text-sm text-slate-500 dark:text-white/60">Smart • Simple • Secure</p>
                  <p className="text-2xl font-bold mt-1">Manage bookings easily</p>
                </div>
              </div>

              <div className="px-10 pb-10">
                <div className="rounded-3xl bg-black/5 border border-black/10 overflow-hidden dark:bg-black/20 dark:border-white/10">
                  <img
                    src={HERO_IMAGE_URL}
                    alt="Login visual"
                    className="w-full h-[360px] object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Hero (Mobile/Tablet) */}
          <div className="lg:hidden">
            <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-black/5 dark:border-white/10 dark:bg-white/5">
              <div className="absolute inset-0 bg-gradient-to-br from-black/5 via-transparent to-transparent dark:from-white/10" />
              <div className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-slate-500 dark:text-white/60">Smart • Simple • Secure</p>
                  <p className="text-sm font-semibold">Manage bookings easily</p>
                </div>
              </div>
              <div className="px-5 pb-5">
                <div className="rounded-3xl bg-black/5 border border-black/10 overflow-hidden dark:bg-black/20 dark:border-white/10">
                  <img
                    src={HERO_IMAGE_URL}
                    alt="Login visual"
                    className="w-full h-[220px] object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
          {/* End */}
        </div>
      </div>
    </div>
  );
}
