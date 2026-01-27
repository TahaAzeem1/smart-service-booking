import { useEffect, useState } from "react";
import supabase from "../../supabaseClient";

function formatDate(ts) {
  if (!ts) return "";
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return ts;
  }
}

function BookingCard({ b, showComplete, onComplete, onDelete }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-black/5 p-4 dark:border-white/10 dark:bg-white/5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm text-slate-500 dark:text-white/60">Customer</div>
          <div className="font-semibold break-words">{b.full_name || "-"}</div>
          <div className="text-sm text-slate-600 mt-1 break-words dark:text-white/70">
            {b.email || "-"}
          </div>
          <div className="text-sm text-slate-600 break-words dark:text-white/70">
            {b.phone || "-"}
          </div>
        </div>

        <div className="text-xs text-slate-500 text-right dark:text-white/60">
          <div>Created</div>
          <div className="mt-1">{formatDate(b.created_at)}</div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl border border-black/10 bg-white p-3 dark:border-white/10 dark:bg-black/20">
          <div className="text-slate-500 text-xs dark:text-white/60">Service</div>
          <div className="font-semibold break-words">{b.service_title || "-"}</div>
          {b.service_price != null ? (
            <div className="text-slate-500 text-xs mt-1 dark:text-white/60">
              Base: ${Number(b.service_price)}
            </div>
          ) : null}
        </div>

        <div className="rounded-xl border border-black/10 bg-white p-3 dark:border-white/10 dark:bg-black/20">
          <div className="text-slate-500 text-xs dark:text-white/60">Schedule</div>
          <div className="mt-1">
            <span className="text-slate-700 dark:text-white/80">Date:</span> {b.booking_date || "-"}
          </div>
          <div className="mt-1">
            <span className="text-slate-700 dark:text-white/80">Time:</span> {b.time_slot || "-"}
          </div>
        </div>

        <div className="rounded-xl border border-black/10 bg-white p-3 dark:border-white/10 dark:bg-black/20">
          <div className="text-slate-500 text-xs dark:text-white/60">Address</div>
          <div className="mt-1 whitespace-pre-wrap break-words">{b.address || "-"}</div>
        </div>

        <div className="rounded-xl border border-black/10 bg-white p-3 dark:border-white/10 dark:bg-black/20">
          <div className="text-slate-500 text-xs dark:text-white/60">Pricing</div>
          <div className="mt-1">
            <span className="text-slate-700 dark:text-white/80">Tier:</span>{" "}
            {b.price_tier != null ? `${b.price_tier}%` : "-"}
          </div>
          <div className="mt-1">
            <span className="text-slate-700 dark:text-white/80">Final:</span>{" "}
            {b.final_price != null ? `$${Number(b.final_price)}` : "-"}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row gap-2">
        {showComplete ? (
          <button
            onClick={() => onComplete(b)}
            className="w-full sm:w-auto rounded-xl bg-black text-white px-4 py-2 font-semibold hover:opacity-90 dark:bg-white dark:text-black"
            type="button"
          >
            Completed
          </button>
        ) : null}

        <button
          onClick={() => onDelete(b)}
          className="w-full sm:w-auto rounded-xl border border-red-500/40 bg-red-500/10 text-red-700 px-4 py-2 font-semibold dark:text-red-200"
          type="button"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

function Table({ title, rows, showComplete, onComplete, onDelete }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-black/5 p-4 shadow-lg dark:border-white/10 dark:bg-white/5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-xl font-bold">{title}</h2>
        <div className="text-sm text-slate-600 dark:text-white/70">{rows.length} total</div>
      </div>

      {/* ✅ Mobile cards */}
      <div className="mt-4 grid gap-4 md:hidden">
        {rows.length === 0 ? (
          <div className="text-slate-600 text-sm dark:text-white/60">No records.</div>
        ) : (
          rows.map((b) => (
            <BookingCard
              key={b.id}
              b={b}
              showComplete={showComplete}
              onComplete={onComplete}
              onDelete={onDelete}
            />
          ))
        )}
      </div>

      {/* ✅ Desktop table */}
      <div className="mt-4 hidden md:block overflow-x-auto">
        <table className="min-w-[1050px] w-full text-sm">
          <thead>
            <tr className="text-left text-slate-600 dark:text-white/70">
              <th className="py-2 pr-4">Customer</th>
              <th className="py-2 pr-4">Email</th>
              <th className="py-2 pr-4">Phone</th>
              <th className="py-2 pr-4">Address</th>
              <th className="py-2 pr-4">Service</th>
              <th className="py-2 pr-4">Date</th>
              <th className="py-2 pr-4">Time</th>
              <th className="py-2 pr-4">Tier</th>
              <th className="py-2 pr-4">Final Price</th>
              <th className="py-2 pr-4">Created</th>
              <th className="py-2 pr-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="py-6 text-slate-600 dark:text-white/60" colSpan={11}>
                  No records.
                </td>
              </tr>
            ) : (
              rows.map((b) => (
                <tr key={b.id} className="border-t border-black/10 align-top dark:border-white/10">
                  <td className="py-3 pr-4 font-semibold">{b.full_name || "-"}</td>
                  <td className="py-3 pr-4">{b.email || "-"}</td>
                  <td className="py-3 pr-4">{b.phone || "-"}</td>
                  <td className="py-3 pr-4 max-w-[260px] whitespace-pre-wrap">{b.address || "-"}</td>

                  <td className="py-3 pr-4">
                    <div className="font-semibold">{b.service_title || "-"}</div>
                    {b.service_price != null ? (
                      <div className="text-slate-500 dark:text-white/60">
                        Base: ${Number(b.service_price)}
                      </div>
                    ) : null}
                  </td>

                  <td className="py-3 pr-4">{b.booking_date || "-"}</td>
                  <td className="py-3 pr-4">{b.time_slot || "-"}</td>
                  <td className="py-3 pr-4">{b.price_tier != null ? `${b.price_tier}%` : "-"}</td>
                  <td className="py-3 pr-4">
                    {b.final_price != null ? `$${Number(b.final_price)}` : "-"}
                  </td>
                  <td className="py-3 pr-4 text-slate-600 dark:text-white/70">
                    {formatDate(b.created_at)}
                  </td>

                  <td className="py-3 pr-4">
                    <div className="flex flex-wrap gap-2">
                      {showComplete ? (
                        <button
                          onClick={() => onComplete(b)}
                          className="rounded-lg bg-black text-white px-3 py-2 font-semibold hover:opacity-90 dark:bg-white dark:text-black"
                          type="button"
                        >
                          Completed
                        </button>
                      ) : null}

                      <button
                        onClick={() => onDelete(b)}
                        className="rounded-lg border border-red-500/40 bg-red-500/10 text-red-700 px-3 py-2 font-semibold dark:text-red-200"
                        type="button"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [newBookings, setNewBookings] = useState([]);
  const [completedBookings, setCompletedBookings] = useState([]);

  const [refreshKey, setRefreshKey] = useState(0);

  async function loadAll() {
    setErr("");
    setLoading(true);

    try {
      const { data: nData, error: nErr } = await supabase
        .from("bookings")
        .select(
          "id, created_at, status, completed_at, user_id, full_name, email, phone, address, service_id, service_title, service_price, booking_date, time_slot, price_tier, final_price"
        )
        .in("status", ["new", "pending"])
        .order("created_at", { ascending: false });

      if (nErr) throw nErr;

      const { data: cData, error: cErr } = await supabase
        .from("bookings")
        .select(
          "id, created_at, status, completed_at, user_id, full_name, email, phone, address, service_id, service_title, service_price, booking_date, time_slot, price_tier, final_price"
        )
        .eq("status", "completed")
        .order("completed_at", { ascending: false });

      if (cErr) throw cErr;

      setNewBookings(nData || []);
      setCompletedBookings(cData || []);
    } catch (e) {
      setErr(e?.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  async function markCompleted(b) {
    const ok = confirm("Mark this booking as COMPLETED?");
    if (!ok) return;

    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("id", b.id);

      if (error) throw error;

      setRefreshKey((k) => k + 1);
    } catch (e) {
      alert(e?.message || "Failed to mark completed");
    }
  }

  async function deleteBooking(b) {
    const ok = confirm("Delete this booking permanently?");
    if (!ok) return;

    try {
      const { error } = await supabase.from("bookings").delete().eq("id", b.id);
      if (error) throw error;

      setRefreshKey((k) => k + 1);
    } catch (e) {
      alert(e?.message || "Failed to delete booking");
    }
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-white">
      <div className="px-4 py-8 max-w-6xl mx-auto space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-slate-600 mt-1 dark:text-white/70">
              New bookings → mark completed → completed table.
            </p>
          </div>

          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            className="w-full sm:w-auto rounded-xl bg-black text-white px-4 py-2 font-semibold hover:opacity-90 dark:bg-white dark:text-black"
            type="button"
          >
            Refresh
          </button>
        </div>

        {err ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-red-700 text-sm dark:text-red-200">
            {err}
          </div>
        ) : null}

        {loading ? (
          <div className="text-slate-600 dark:text-white/70">Loading...</div>
        ) : (
          <>
            <Table
              title="New Bookings"
              rows={newBookings}
              showComplete={true}
              onComplete={markCompleted}
              onDelete={deleteBooking}
            />

            <Table
              title="Completed Bookings"
              rows={completedBookings}
              showComplete={false}
              onComplete={() => {}}
              onDelete={deleteBooking}
            />
          </>
        )}
      </div>
    </div>
  );
}
