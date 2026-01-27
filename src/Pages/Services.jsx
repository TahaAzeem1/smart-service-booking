import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";

function ServiceCard({ s, onOpen }) {
  const img = s?.image_url || "";

  return (
    <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white dark:bg-white/5 dark:border-white/10 shadow-sm hover:shadow-md transition">
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <div className="relative sm:w-[260px] w-full">
          <div className="aspect-[16/10] sm:aspect-auto sm:h-full w-full bg-slate-100 dark:bg-white/10 overflow-hidden">
            {img ? (
              <img
                src={img}
                alt={s?.name || "Service"}
                className="h-full w-full object-cover group-hover:scale-[1.03] transition duration-300"
                loading="lazy"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-slate-200 to-slate-100 dark:from-white/10 dark:to-white/5" />
            )}
          </div>

          {/* Category chip on image */}
          <div className="absolute left-3 top-3">
            <span className="text-xs px-2.5 py-1 rounded-full bg-black/60 text-white backdrop-blur border border-white/10">
              {s?.category || "General"}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
            <div className="min-w-0">
              <h3 className="text-xl font-semibold break-words">{s?.name}</h3>
              <p className="mt-2 text-slate-600 dark:text-white/70 line-clamp-2">
                {s?.description || "No description."}
              </p>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <p className="text-xs text-slate-500 dark:text-white/50">Starting from</p>
              <p className="text-2xl font-bold">${Number(s?.price || 0).toFixed(0)}</p>
            </div>
          </div>

          <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <button
              onClick={onOpen}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-black text-white hover:opacity-90
                         dark:bg-white dark:text-black dark:hover:opacity-90"
            >
              View & Book
            </button>

            <span className="text-xs text-slate-500 dark:text-white/40">
              Open details to book your slot
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SelectChevron() {
  return (
    <svg
      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 dark:text-white/60"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Services() {
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const activeReqId = useRef(0);
  const watchdogRef = useRef(null);

  const categories = useMemo(() => {
    const set = new Set((services || []).map((s) => s.category).filter(Boolean));
    return ["all", ...Array.from(set)];
  }, [services]);

  const loadServices = useCallback(async () => {
    const reqId = ++activeReqId.current;

    if (watchdogRef.current) {
      clearTimeout(watchdogRef.current);
      watchdogRef.current = null;
    }

    setLoading(true);
    setErrorMsg("");

    const timeoutMs = 12000;
    watchdogRef.current = setTimeout(() => {
      if (activeReqId.current !== reqId) return;
      setErrorMsg("Network/timeout issue. Check internet, Supabase URL, or CORS/adblock.");
      setServices([]);
      setLoading(false);
    }, timeoutMs);

    try {
      let query = supabase
        .from("services")
        .select("id, name, description, category, price, image_url, is_active, created_at")
        .eq("is_active", true);

      const search = q.trim();
      if (search) {
        const safe = search.replace(/,/g, "\\,");
        query = query.or(`name.ilike.%${safe}%,description.ilike.%${safe}%`);
      }

      if (category !== "all") query = query.eq("category", category);

      if (sortBy === "newest") query = query.order("created_at", { ascending: false });
      if (sortBy === "oldest") query = query.order("created_at", { ascending: true });
      if (sortBy === "price_low") query = query.order("price", { ascending: true });
      if (sortBy === "price_high") query = query.order("price", { ascending: false });

      const { data, error } = await query;

      if (activeReqId.current !== reqId) return;

      if (watchdogRef.current) {
        clearTimeout(watchdogRef.current);
        watchdogRef.current = null;
      }

      if (error) throw error;

      setServices(Array.isArray(data) ? data : []);
    } catch (err) {
      if (activeReqId.current !== reqId) return;

      if (watchdogRef.current) {
        clearTimeout(watchdogRef.current);
        watchdogRef.current = null;
      }

      console.error("SERVICES LOAD ERROR:", err);

      const msg = err?.message || "Failed to load services.";
      const details = err?.details || "";
      const status = err?.status;

      if (status === 401 || status === 403) {
        setErrorMsg("Blocked by RLS/Permissions. Add SELECT policy for anon/auth users on services.");
      } else if (
        msg.toLowerCase().includes("failed to fetch") ||
        msg.toLowerCase().includes("network") ||
        msg.toLowerCase().includes("timeout")
      ) {
        setErrorMsg("Network/timeout issue. Check internet, Supabase URL, or CORS/adblock.");
      } else if (
        msg.toLowerCase().includes("relation") ||
        msg.toLowerCase().includes("does not exist") ||
        msg.toLowerCase().includes("schema cache")
      ) {
        setErrorMsg(
          "Table/schema mismatch. Confirm table name is public.services and public schema is exposed in Settings > API."
        );
      } else if (details?.toLowerCase().includes("rls")) {
        setErrorMsg("Blocked by RLS/Permissions. Add SELECT policy for anon/auth users on services.");
      } else {
        setErrorMsg(msg);
      }

      setServices([]);
    } finally {
      if (activeReqId.current !== reqId) return;
      setLoading(false);
    }
  }, [q, category, sortBy]);

  useEffect(() => {
    loadServices();
    return () => {
      if (watchdogRef.current) {
        clearTimeout(watchdogRef.current);
        watchdogRef.current = null;
      }
    };
  }, [loadServices]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold">Services</h1>
          <p className="mt-2 text-slate-600 dark:text-white/70">
            Search services, apply filters and open detail page to book.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 sm:mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-1">
          <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white dark:bg-white/5 dark:border-white/10 px-3 py-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search services..."
              className="w-full bg-transparent outline-none"
            />
          </div>
        </div>

        {/* ✅ Category select (arrow aligned) */}
        <div className="relative">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 pr-12 rounded-xl bg-white border border-slate-300 outline-none appearance-none dark:bg-white/5 dark:border-white/10"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === "all" ? "All" : c}
              </option>
            ))}
          </select>
          <SelectChevron />
        </div>

        {/* ✅ Sort select (arrow aligned) */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-4 py-3 pr-12 rounded-xl bg-white border border-slate-300 outline-none appearance-none dark:bg-white/5 dark:border-white/10"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
          </select>
          <SelectChevron />
        </div>

        <button
          onClick={loadServices}
          className="w-full px-4 py-3 rounded-xl bg-black text-white hover:opacity-90 dark:bg-white dark:text-black"
        >
          Apply
        </button>
      </div>

      {errorMsg ? (
        <div className="mt-6 rounded-xl px-4 py-3 text-sm border bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-200">
          {errorMsg}
        </div>
      ) : null}

      {loading ? <p className="mt-6 text-slate-600 dark:text-white/70">Loading services...</p> : null}

      {!loading && !errorMsg && services.length === 0 ? (
        <p className="mt-6 text-slate-600 dark:text-white/70">No services found.</p>
      ) : null}

      {/* List */}
      <div className="mt-8 grid grid-cols-1 gap-6">
        {services.map((s) => (
          <ServiceCard key={s.id} s={s} onOpen={() => navigate(`/services/${s.id}`)} />
        ))}
      </div>
    </div>
  );
}
