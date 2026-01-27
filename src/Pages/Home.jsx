import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import supabase from "../supabaseClient";

export default function Home() {
  const { user } = useAuth();

  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  const HOME_HERO_IMAGE =
    "https://img.freepik.com/free-vector/household-renovation-professions-set_23-2148658596.jpg?semt=ais_hybrid&w=740&q=80";

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("services")
          .select("id, name, description, category, price, image_url, is_active, created_at")
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(6);

        if (!alive) return;
        if (error) throw error;

        setFeatured(data || []);
      } catch (e) {
        setFeatured([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
      {/* HERO */}
      <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur">
        <div className="relative">
          <div className="h-[340px] sm:h-[380px] md:h-[420px] w-full">
            <img src={HOME_HERO_IMAGE} alt="Hero" className="h-full w-full object-cover" />
          </div>

          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

          <div className="absolute inset-0 p-5 sm:p-6 md:p-10 flex flex-col justify-center">
            <div className="max-w-2xl">
              <p className="text-white/80 text-xs sm:text-sm">Smart • Simple • Secure</p>

              <h1 className="mt-2 text-3xl sm:text-4xl md:text-6xl font-bold text-white leading-tight">
                Book services <span className="text-white/80">in minutes.</span>
              </h1>

              <p className="mt-3 sm:mt-4 text-white/80 max-w-xl text-sm sm:text-base">
                Browse trusted services, choose a date & time slot, and confirm instantly. Your booking
                appears in your dashboard and the admin panel for processing.
              </p>

              <div className="mt-5 sm:mt-6 flex flex-wrap gap-3">
                <Link
                  to="/services"
                  className="px-5 py-2.5 rounded-xl bg-white text-black text-sm font-semibold"
                >
                  Explore Services
                </Link>

                {!user ? (
                  <>
                    <Link
                      to="/login"
                      className="px-5 py-2.5 rounded-xl border border-white/30 text-white text-sm hover:bg-white/10"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      className="px-5 py-2.5 rounded-xl border border-white/30 text-white text-sm hover:bg-white/10"
                    >
                      Signup
                    </Link>
                  </>
                ) : (
                  <Link
                    to="/dashboard"
                    className="px-5 py-2.5 rounded-xl border border-white/30 text-white text-sm hover:bg-white/10"
                  >
                    My Dashboard
                  </Link>
                )}
              </div>
            </div>

            {/* Desktop card */}
            <div className="hidden lg:block absolute right-8 top-8 w-[320px] rounded-2xl border border-white/15 bg-white/10 backdrop-blur p-5 text-white">
              <h3 className="font-semibold">How it works</h3>
              <ol className="mt-3 space-y-2 text-sm text-white/85">
                <li>1) Choose a service</li>
                <li>2) Select date & time slot</li>
                <li>3) Confirm booking</li>
                <li>4) Track in dashboard</li>
              </ol>
              <p className="mt-4 text-xs text-white/60">
                Tip: Use filters on Services page to find faster.
              </p>
            </div>
          </div>
        </div>

        {/* Mobile/Tablet card (same content) */}
        <div className="lg:hidden px-5 sm:px-6 pb-6">
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-white/5 backdrop-blur p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white">How it works</h3>
            <ol className="mt-3 space-y-2 text-sm text-gray-700 dark:text-white/80">
              <li>1) Choose a service</li>
              <li>2) Select date & time slot</li>
              <li>3) Confirm booking</li>
              <li>4) Track in dashboard</li>
            </ol>
            <p className="mt-4 text-xs text-gray-500 dark:text-white/60">
              Tip: Use filters on Services page to find faster.
            </p>
          </div>
        </div>
      </div>

      {/* FEATURED */}
      <div className="mt-10">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Featured Services</h2>
          <Link to="/services" className="text-sm underline underline-offset-4">
            View all
          </Link>
        </div>

        {loading ? (
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">Loading services...</p>
        ) : featured.length === 0 ? (
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
            No featured services yet. Click “Explore Services”.
          </p>
        ) : (
          <div className="mt-5 space-y-4">
            {featured.map((s) => {
              const img = String(s?.image_url || "").trim() || HOME_HERO_IMAGE;

              return (
                <div
                  key={s.id}
                  className="group rounded-2xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row">
                    <div className="relative md:w-[340px] w-full h-[210px] sm:h-[240px] md:h-auto">
                      <img src={img} alt={s.name} className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-70" />
                    </div>

                    <div className="flex-1 p-5">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="text-xl font-semibold break-words">{s.name}</h3>
                          <p className="mt-1 text-slate-600 dark:text-white/70 line-clamp-2">
                            {s.description || "No description."}
                          </p>
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span className="text-xs px-3 py-1 rounded-full border border-slate-200 bg-slate-50 dark:bg-white/10 dark:border-white/10">
                              {s.category || "General"}
                            </span>
                          </div>
                        </div>

                        <div className="text-left sm:text-right shrink-0">
                          <div className="text-xs text-slate-500 dark:text-white/60">From</div>
                          <div className="text-2xl font-bold">${Number(s.price || 0).toFixed(0)}</div>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="text-sm text-slate-500 dark:text-white/60">
                          Open details to book quickly
                        </div>

                        <Link
                          to={`/services/${s.id}`}
                          className="w-full sm:w-auto text-center px-5 py-2.5 rounded-xl bg-black text-white hover:opacity-90 dark:bg-white dark:text-black"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
