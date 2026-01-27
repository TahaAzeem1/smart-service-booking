import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import supabase from "../supabaseClient";
import { useAuth } from "../context/AuthContext";

const badgeClass = (status) => {
  const s = (status || "").toLowerCase();
  if (s === "completed")
    return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-200 dark:border-emerald-500/20";
  if (s === "cancelled" || s === "canceled")
    return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-200 dark:border-rose-500/20";
  return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-200 dark:border-amber-500/20";
};

export default function Dashboard() {
  const { user } = useAuth();

  const [tab, setTab] = useState("upcoming"); // upcoming | completed
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const filtered = useMemo(() => {
    const t = tab;
    return (bookings || []).filter((b) => {
      const s = (b.status || "pending").toLowerCase();
      if (t === "completed") return s === "completed";
      return s !== "completed";
    });
  }, [bookings, tab]);

  async function loadBookings() {
    if (!user?.id) return;

    try {
      setErr("");
      setLoading(true);

      const { data, error } = await supabase
        .from("bookings")
        .select(
          `
          id,
          created_at,
          booking_date,
          time_slot,
          final_price,
          status,
          service_id,
          services:service_id ( name, category, price )
        `
        )
        .eq("user_id", user.id)
        .order("booking_date", { ascending: false });

      if (error) throw error;

      setBookings(data || []);
    } catch (e) {
      console.error(e);
      setErr(e?.message || "Failed to load bookings.");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Dashboard</h1>
          <p className="mt-1 text-gray-700 dark:text-gray-200">
            Track your bookings (upcoming & completed).
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <button
            onClick={loadBookings}
            className="text-sm px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700
                       text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10"
            type="button"
          >
            Refresh
          </button>

          <Link
            to="/services"
            className="text-sm px-3 py-2 rounded-lg bg-black text-white hover:opacity-90 text-center"
          >
            Book a Service
          </Link>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border bg-white dark:bg-gray-900 dark:border-gray-800 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">My Bookings</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              Upcoming and completed bookings.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTab("upcoming")}
              type="button"
              className={`text-sm px-3 py-2 rounded-lg border ${
                tab === "upcoming"
                  ? "bg-black text-white border-black"
                  : "border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10"
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setTab("completed")}
              type="button"
              className={`text-sm px-3 py-2 rounded-lg border ${
                tab === "completed"
                  ? "bg-black text-white border-black"
                  : "border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10"
              }`}
            >
              Completed
            </button>
          </div>
        </div>

        {err ? (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200 px-4 py-3 text-sm">
            {err}
          </div>
        ) : null}

        <div className="mt-5">
          {loading ? (
            <p className="text-sm text-gray-600 dark:text-gray-300">Loading bookings...</p>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-5">
              <p className="text-sm text-gray-700 dark:text-gray-200">
                {tab === "completed"
                  ? "No completed bookings yet."
                  : "No upcoming bookings. Book your first service now!"}
              </p>
              <Link
                to="/services"
                className="inline-block mt-3 text-sm px-3 py-2 rounded-lg bg-black text-white"
              >
                Explore Services
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
              <table className="w-full text-sm min-w-[720px]">
                <thead className="bg-gray-50 dark:bg-white/5">
                  <tr className="text-left">
                    <th className="px-4 py-3">Service</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Time</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((b) => {
                    const svc = b.services;
                    const serviceName =
                      svc?.name || `Service (${String(b.service_id).slice(0, 6)}...)`;
                    const category = svc?.category || "—";

                    return (
                      <tr key={b.id} className="border-t border-gray-200 dark:border-gray-800">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900 dark:text-white">{serviceName}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{category}</p>
                        </td>
                        <td className="px-4 py-3">{b.booking_date || "—"}</td>
                        <td className="px-4 py-3">{b.time_slot || "—"}</td>
                        <td className="px-4 py-3">${Number(b.final_price || 0).toFixed(0)}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs ${badgeClass(
                              b.status
                            )}`}
                          >
                            {(b.status || "pending").toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          Note: Booking completion status is updated by Admin.
        </p>
      </div>
    </div>
  );
}
