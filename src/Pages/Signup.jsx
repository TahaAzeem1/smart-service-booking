import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";

export default function Signup() {
  const navigate = useNavigate();

  const HERO_IMAGE_URL = "https://auto.edu/hubfs/shutterstock_2063093864.jpg";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    setLoading(false);

    if (error) {
      setErr(error.message);
      return;
    }

    if (!data?.session) {
      setMsg("Account created ✅ Please verify your email, then login.");
      return;
    }

    setMsg("Account created ✅ Redirecting...");
    navigate("/services", { replace: true });
  };

  const handleGoogleSignup = async () => {
    setErr("");
    setMsg("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/services` },
    });

    setLoading(false);
    if (error) setErr(error.message);
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-white text-slate-900 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* LEFT */}
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
                      Create your account
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-black/10 bg-black/5 backdrop-blur p-5 sm:p-6 shadow-xl dark:border-white/10 dark:bg-white/5">
                <h1 className="text-2xl sm:text-3xl font-bold">Create Account</h1>
                <p className="mt-2 text-slate-600 text-sm sm:text-base dark:text-white/60">
                  Sign up to continue.
                </p>

                {/* Toggle */}
                <div className="mt-5 grid grid-cols-2 rounded-xl bg-black/5 border border-black/10 p-1 dark:bg-white/5 dark:border-white/10">
                  <Link
                    to="/login"
                    className="rounded-lg py-2 text-sm font-semibold text-center text-slate-600 hover:text-slate-900 dark:text-white/70 dark:hover:text-white"
                  >
                    Sign In
                  </Link>
                  <button
                    type="button"
                    className="rounded-lg py-2 text-sm font-semibold bg-black text-white dark:bg-white dark:text-black"
                  >
                    Signup
                  </button>
                </div>

                {/* Google */}
                <button
                  type="button"
                  onClick={handleGoogleSignup}
                  disabled={loading}
                  className="mt-5 w-full rounded-xl bg-black text-white font-semibold py-3 hover:opacity-90 disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-white/90"
                >
                  Continue with Google
                </button>

                <div className="my-5 flex items-center gap-3">
                  <div className="h-px w-full bg-black/10 dark:bg-white/10" />
                  <span className="text-slate-400 text-sm dark:text-white/40">or</span>
                  <div className="h-px w-full bg-black/10 dark:bg-white/10" />
                </div>

                <form onSubmit={handleSignup} className="space-y-4">
                  <div>
                    <label className="text-sm text-slate-600 dark:text-white/70">Full Name</label>
                    <div className="mt-2 rounded-xl border border-black/10 bg-white px-4 py-3 focus-within:border-black/20 dark:border-white/10 dark:bg-black/20 dark:focus-within:border-white/25">
                      <input
                        className="w-full bg-transparent outline-none placeholder:text-slate-400 dark:placeholder:text-white/30"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Your name"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-slate-600 dark:text-white/70">Email Address</label>
                    <div className="mt-2 rounded-xl border border-black/10 bg-white px-4 py-3 focus-within:border-black/20 dark:border-white/10 dark:bg-black/20 dark:focus-within:border-white/25">
                      <input
                        className="w-full bg-transparent outline-none placeholder:text-slate-400 dark:placeholder:text-white/30"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
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

                  {err ? (
                    <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-red-700 text-sm dark:text-red-200">
                      {err}
                    </div>
                  ) : null}

                  {msg ? (
                    <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-3 text-green-700 text-sm dark:text-green-200">
                      {msg}
                    </div>
                  ) : null}

                  <button
                    disabled={loading}
                    className="w-full rounded-xl bg-black text-white font-semibold py-3 hover:opacity-90 disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-white/90"
                  >
                    {loading ? "Please wait..." : "Continue"}
                  </button>
                </form>

                <p className="text-slate-600 text-sm mt-5 dark:text-white/60">
                  Already have an account?{" "}
                  <Link className="text-slate-900 underline dark:text-white" to="/login">
                    Login
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT (Desktop) */}
          <div className="hidden lg:block">
            <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-black/5 dark:border-white/10 dark:bg-white/5">
              <div className="absolute inset-0 bg-gradient-to-br from-black/5 via-transparent to-transparent dark:from-white/10" />
              <div className="p-10">
                <div className="text-right">
                  <p className="text-sm text-slate-500 dark:text-white/60">Fast onboarding</p>
                  <p className="text-2xl font-bold mt-1">Start booking in minutes</p>
                </div>
              </div>

              <div className="px-10 pb-10">
                <div className="rounded-3xl bg-black/5 border border-black/10 overflow-hidden dark:bg-black/20 dark:border-white/10">
                  <img
                    src={HERO_IMAGE_URL}
                    alt="Signup visual"
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
                  <p className="text-xs text-slate-500 dark:text-white/60">Fast onboarding</p>
                  <p className="text-sm font-semibold">Start booking in minutes</p>
                </div>
              </div>
              <div className="px-5 pb-5">
                <div className="rounded-3xl bg-black/5 border border-black/10 overflow-hidden dark:bg-black/20 dark:border-white/10">
                  <img
                    src={HERO_IMAGE_URL}
                    alt="Signup visual"
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
