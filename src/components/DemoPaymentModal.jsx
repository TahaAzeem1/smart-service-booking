import { useMemo, useState } from "react";
import supabase from "../supabaseClient";

function makeTxnRef() {
  const rand = Math.random().toString(16).slice(2, 8).toUpperCase();
  return `TXN-${Date.now()}-${rand}`;
}

export default function DemoPaymentModal({
  open,
  onClose,
  bookingId,
  amount,
  currency = "USD",
  onPaid,
}) {
  const [method, setMethod] = useState("card"); // card | paypal | jazzcash
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const methods = useMemo(
    () => [
      { id: "card", label: "Visa / MasterCard" },
      { id: "paypal", label: "PayPal" },
      { id: "jazzcash", label: "JazzCash" },
    ],
    []
  );

  if (!open) return null;

  async function handlePay() {
    setErr("");
    setLoading(true);

    try {
      if (!bookingId) throw new Error("Missing bookingId for payment.");

      const txnRef = makeTxnRef();
      await new Promise((r) => setTimeout(r, 1200));

      const { error } = await supabase
        .from("bookings")
        .update({
          payment_mode: "demo",
          payment_status: "paid_demo",
          payment_method: method,
          payment_txn_ref: txnRef,
          paid_at: new Date().toISOString(),
          status: "confirmed",
        })
        .eq("id", bookingId);

      if (error) throw error;

      onPaid?.({ txnRef, method });
      onClose?.();
    } catch (e) {
      setErr(e?.message || "Payment failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="
          w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-950 text-white shadow-2xl
          max-h-[90vh] overflow-auto
        "
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-5 sm:px-6 pt-5 sm:pt-6">
          <div className="min-w-0">
            <h3 className="text-xl sm:text-2xl font-semibold tracking-tight">
              Complete Payment
            </h3>
            <p className="mt-2 text-sm text-white/70">
              Choose a payment method to confirm your booking.
            </p>
          </div>

          <button
            onClick={onClose}
            disabled={loading}
            className="shrink-0 h-11 w-11 sm:h-12 sm:w-12 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-60 flex items-center justify-center text-xl"
            aria-label="Close"
            title="Close"
            type="button"
          >
            ✕
          </button>
        </div>

        {/* Amount + Booking Box */}
        <div className="px-5 sm:px-6 mt-5">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 sm:px-5 py-4">
            <div className="flex items-center justify-between gap-4">
              <span className="text-white/70">Amount</span>
              <span className="text-2xl sm:text-3xl font-semibold">
                {currency} {Number(amount || 0).toFixed(0)}
              </span>
            </div>

            <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span className="text-white/70">Booking ID</span>
              <code className="text-xs text-white/80 break-all">{bookingId}</code>
            </div>
          </div>
        </div>

        {/* Methods */}
        <div className="px-5 sm:px-6 mt-6">
          <p className="text-sm font-semibold text-white/90 mb-3">
            Select Payment Method
          </p>

          <div className="grid gap-3">
            {methods.map((m) => {
              const active = method === m.id;

              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMethod(m.id)}
                  disabled={loading}
                  className={[
                    "w-full flex items-center gap-4 rounded-2xl border px-4 sm:px-5 py-4 text-left transition",
                    "disabled:opacity-60",
                    active ? "border-white/20 bg-white/10" : "border-white/10 bg-white/5 hover:bg-white/10",
                  ].join(" ")}
                >
                  {/* Custom radio */}
                  <span
                    className={[
                      "h-5 w-5 rounded-full border flex items-center justify-center shrink-0",
                      active ? "border-rose-500" : "border-white/30",
                    ].join(" ")}
                    aria-hidden="true"
                  >
                    <span className={["h-2.5 w-2.5 rounded-full transition", active ? "bg-rose-500" : "bg-transparent"].join(" ")} />
                  </span>

                  <span className="text-base font-medium">{m.label}</span>
                </button>
              );
            })}
          </div>

          {err ? <p className="mt-4 text-sm text-rose-300">{err}</p> : null}
        </div>

        {/* Footer Buttons */}
        <div className="px-5 sm:px-6 pb-5 sm:pb-6 mt-7">
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={onClose}
              disabled={loading}
              className="sm:flex-1 h-12 sm:h-14 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-60 text-base font-medium"
              type="button"
            >
              Cancel
            </button>

            <button
              onClick={handlePay}
              disabled={loading}
              className="sm:flex-[2] h-12 sm:h-14 rounded-2xl bg-white text-slate-950 hover:opacity-90 disabled:opacity-60 text-base font-semibold"
              type="button"
            >
              {loading ? "Processing..." : "Pay Now"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
