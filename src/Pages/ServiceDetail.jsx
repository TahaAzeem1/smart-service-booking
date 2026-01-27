import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import supabase from "../supabaseClient";
import DemoPaymentModal from "../components/DemoPaymentModal";

const TIERS = [
  { value: 0, label: "Standard", multiplier: 1 },
  { value: 25, label: "Premium (+25%)", multiplier: 1.25 },
  { value: 50, label: "Urgent (+50%)", multiplier: 1.5 },
];

const TIME_SLOTS = [
  "10:00-11:00",
  "11:00-12:00",
  "12:00-13:00",
  "14:00-15:00",
  "15:00-16:00",
  "16:00-17:00",
];

const isValidEmail = (value) => {
  const v = (value || "").trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
};

const normalizePkPhone = (raw) => {
  let v = (raw || "").replace(/\s+/g, "");
  v = v.replace(/[^\d+]/g, "");
  if (!v.startsWith("+")) v = "+" + v;

  if (!v.startsWith("+92")) {
    if (v.startsWith("+0")) v = v.replace("+0", "+92");
    else if (v.startsWith("+3")) v = "+92" + v.slice(1);
    else if (v === "+") v = "+92";
    else if (!v.startsWith("+92")) v = "+92" + v.replace("+", "");
  }

  if (v.length > 13) v = v.slice(0, 13);
  return v;
};

const isValidPkPhone = (value) => {
  const v = (value || "").replace(/\s+/g, "");
  return /^\+923\d{9}$/.test(v);
};

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

export default function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  const [bookingDate, setBookingDate] = useState("");
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[0]);
  const [priceTier, setPriceTier] = useState(TIERS[0].value);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+92");
  const [address, setAddress] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const [fieldErr, setFieldErr] = useState({
    bookingDate: "",
    fullName: "",
    email: "",
    phone: "",
    address: "",
  });

  // ✅ Payment modal state
  const [payOpen, setPayOpen] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState(null);
  const [payInfo, setPayInfo] = useState(null);

  // ✅ fallback image (sirf jab DB me image_url missing ho)
  const FALLBACK_IMAGE =
    "https://img.freepik.com/free-vector/household-renovation-professions-set_23-2148658596.jpg?semt=ais_hybrid&w=740&q=80";

  const minDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadService() {
      if (!id) {
        setService(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setMsg({ type: "", text: "" });

      const { data, error } = await supabase
        .from("services")
        .select("id, name, description, category, price, image_url, is_active")
        .eq("id", id)
        .single();

      if (!isMounted) return;

      if (error) {
        console.error("loadService error:", error);
        setService(null);
      } else {
        setService(data);
      }

      setLoading(false);
    }

    loadService();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const basePrice = useMemo(() => {
    const p = Number(service?.price ?? 0);
    return Number.isFinite(p) ? p : 0;
  }, [service]);

  const selectedTier = useMemo(() => {
    return TIERS.find((t) => t.value === Number(priceTier)) || TIERS[0];
  }, [priceTier]);

  const finalPrice = useMemo(() => {
    return Math.round(basePrice * selectedTier.multiplier);
  }, [basePrice, selectedTier]);

  const heroImage = useMemo(() => {
    const url = String(service?.image_url || "").trim();
    return url || FALLBACK_IMAGE;
  }, [service]);

  function validateAll() {
    const errs = { bookingDate: "", fullName: "", email: "", phone: "", address: "" };

    if (!bookingDate) errs.bookingDate = "Please select a date.";
    else if (bookingDate < minDate) errs.bookingDate = "You can only select from tomorrow onwards.";

    if (!fullName.trim()) errs.fullName = "Please enter full name.";

    if (!email.trim()) errs.email = "Please enter email.";
    else if (!isValidEmail(email)) errs.email = "Invalid email (example: name@gmail.com).";

    const cleanedPhone = (phone || "").replace(/\s+/g, "");
    if (!cleanedPhone || cleanedPhone === "+92") errs.phone = "Please enter phone number.";
    else if (!isValidPkPhone(cleanedPhone))
      errs.phone = "Invalid phone. Use format: +923XXXXXXXXX (no spaces).";

    if (!address.trim()) errs.address = "Please enter address.";

    setFieldErr(errs);
    return errs.bookingDate || errs.fullName || errs.email || errs.phone || errs.address || "";
  }

  async function handleBook(e) {
    if (e?.preventDefault) e.preventDefault();
    if (submitting) return;

    setMsg({ type: "", text: "" });
    setPayInfo(null);

    if (!service?.id) {
      setMsg({ type: "error", text: "Service not loaded. Please refresh and try again." });
      return;
    }

    const firstErr = validateAll();
    if (firstErr) {
      setMsg({ type: "error", text: firstErr });
      return;
    }

    try {
      setSubmitting(true);

      const { data: authData, error: authErr } = await supabase.auth.getUser();
      if (authErr) console.error("authErr:", authErr);

      const user = authData?.user;
      if (!user) {
        setMsg({ type: "error", text: "Session expired. Please login again." });
        navigate("/login", { replace: true, state: { from: `/services/${id}` } });
        return;
      }

      // pre-check duplicate booking
      const { data: existing, error: existErr } = await supabase
        .from("bookings")
        .select("id")
        .eq("user_id", user.id)
        .eq("service_id", service.id)
        .eq("booking_date", bookingDate)
        .eq("time_slot", timeSlot)
        .limit(1);

      if (existErr) console.error("precheck error:", existErr);

      if (existing && existing.length > 0) {
        setMsg({
          type: "error",
          text: "You already booked this service for the selected date & time. Please choose a different time slot.",
        });
        return;
      }

      const payload = {
        user_id: user.id,
        service_id: service.id,

        service_title: service.name,
        service_price: Number(basePrice),

        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.replace(/\s+/g, ""),
        address: address.trim(),

        booking_date: bookingDate,
        time_slot: timeSlot,
        price_tier: Number(priceTier),
        final_price: Number(finalPrice),

        status: "new",
        completed_at: null,

        payment_mode: "demo",
        payment_status: "unpaid",
        payment_method: null,
        payment_txn_ref: null,
        paid_at: null,
      };

      const { data: inserted, error } = await supabase
        .from("bookings")
        .insert([payload])
        .select("id")
        .single();

      if (error) {
        const isDuplicate =
          error?.code === "23505" ||
          (error?.message || "").toLowerCase().includes("duplicate key") ||
          (error?.message || "").toLowerCase().includes("uniq_user_service_datetime");

        if (isDuplicate) {
          setMsg({
            type: "error",
            text: "You already booked this service for the selected date & time. Please choose a different time slot.",
          });
          return;
        }

        const isRls =
          (error?.message || "").toLowerCase().includes("row-level security") ||
          (error?.message || "").toLowerCase().includes("permission") ||
          (error?.message || "").toLowerCase().includes("not authorized");

        setMsg({
          type: "error",
          text: isRls
            ? "Booking blocked by permissions (RLS). Please ensure bookings INSERT policy allows authenticated users."
            : error.message || "Booking failed.",
        });
        return;
      }

      setCreatedBookingId(inserted?.id);
      setPayOpen(true);
      setMsg({ type: "success", text: "Booking created. Complete payment to confirm." });
    } catch (err) {
      console.error("handleBook catch:", err);
      setMsg({ type: "error", text: err?.message || "Booking failed." });
    } finally {
      setSubmitting(false);
    }
  }

  function resetFormAfterPaid() {
    setBookingDate("");
    setTimeSlot(TIME_SLOTS[0]);
    setPriceTier(TIERS[0].value);
    setFullName("");
    setEmail("");
    setPhone("+92");
    setAddress("");
    setFieldErr({ bookingDate: "", fullName: "", email: "", phone: "", address: "" });
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <p className="text-slate-600 dark:text-white/70">Loading service...</p>
      </div>
    );
  }

  if (!service || service?.is_active === false) {
    return (
      <div className="container mx-auto px-4 py-10">
        <button
          onClick={() => navigate("/services")}
          className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 dark:border-white/20 dark:hover:bg-white/10"
        >
          ← Back
        </button>
        <p className="mt-6 text-slate-600 dark:text-white/70">Service not found or inactive.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:py-10">
      <DemoPaymentModal
        open={payOpen}
        onClose={() => setPayOpen(false)}
        bookingId={createdBookingId}
        amount={finalPrice}
        currency="USD"
        onPaid={async (info) => {
          setPayInfo(info);

          try {
            const { data: authData } = await supabase.auth.getUser();
            const user = authData?.user;

            if (user) {
              await supabase.from("notifications").insert([
                {
                  user_id: user.id,
                  title: "Payment Successful",
                  message: `Payment received for ${service?.name}. Txn: ${info?.txnRef}`,
                  is_read: false,
                },
              ]);
            }
          } catch (nErr) {
            console.log("payment notification skipped:", nErr?.message);
          }

          setMsg({ type: "success", text: "Payment successful. Booking confirmed!" });
          resetFormAfterPaid();
        }}
      />

      {/* Top bar (responsive) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <button
          onClick={() => navigate("/services")}
          className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 dark:border-white/20 dark:hover:bg-white/10"
        >
          ← Back
        </button>

        <div className="text-left sm:text-right">
          <p className="text-slate-500 dark:text-white/60 text-sm">Starting from</p>
          <p className="text-2xl font-bold">${basePrice.toFixed(0)}</p>
        </div>
      </div>

      {/* HERO */}
      <div className="mt-6 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur">
        <div className="relative h-[240px] sm:h-[280px] md:h-[360px]">
          <img src={heroImage} alt={service.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent" />

          <div className="absolute left-5 right-5 sm:left-6 sm:right-6 bottom-5 sm:bottom-6">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white break-words">
              {service.name}
            </h1>

            <p className="mt-2 text-white/80 max-w-3xl line-clamp-2 text-sm sm:text-base">
              {service.description || "No description."}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full text-sm bg-white/15 border border-white/20 text-white">
                {service.category || "General"}
              </span>
              <span className="px-3 py-1 rounded-full text-sm bg-white/15 border border-white/20 text-white">
                Starting from ${basePrice.toFixed(0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">
          {msg.text ? (
            <div
              className={`rounded-2xl px-4 py-3 text-sm border ${
                msg.type === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-200"
                  : "bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-200"
              }`}
            >
              {msg.text}
            </div>
          ) : null}

          {/* Booking Schedule */}
          <div className="rounded-2xl bg-white/80 border border-slate-200 p-5 sm:p-6 dark:bg-white/5 dark:border-white/10 backdrop-blur">
            <h2 className="text-xl font-semibold">Booking Schedule</h2>
            <p className="mt-1 text-slate-600 dark:text-white/70">
              Select date, time slot and tier to calculate final price.
            </p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <label className="block text-sm font-medium mb-2">Date</label>
                <input
                  type="date"
                  value={bookingDate}
                  min={minDate}
                  onChange={(e) => {
                    setBookingDate(e.target.value);
                    setFieldErr((p) => ({ ...p, bookingDate: "" }));
                  }}
                  className={`w-full px-4 py-3 rounded-xl bg-white border outline-none focus:ring-2
                    dark:bg-black/20 dark:border-white/10 dark:focus:ring-white/10
                    ${
                      fieldErr.bookingDate
                        ? "border-rose-400 focus:ring-rose-200"
                        : "border-slate-300 focus:ring-slate-300"
                    }`}
                />
                {fieldErr.bookingDate ? (
                  <p className="mt-2 text-sm text-rose-600 dark:text-rose-300">
                    {fieldErr.bookingDate}
                  </p>
                ) : null}
              </div>

              {/* ✅ Time Slot select (arrow aligned) */}
              <div className="md:col-span-1">
                <label className="block text-sm font-medium mb-2">Time Slot</label>
                <div className="relative">
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full px-4 py-3 pr-12 rounded-xl bg-white border border-slate-300 outline-none appearance-none dark:bg-black/20 dark:border-white/10"
                  >
                    {TIME_SLOTS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <SelectChevron />
                </div>
              </div>

              {/* ✅ Price Tier select (arrow aligned) */}
              <div className="md:col-span-1">
                <label className="block text-sm font-medium mb-2">Price Tier</label>
                <div className="relative">
                  <select
                    value={priceTier}
                    onChange={(e) => setPriceTier(Number(e.target.value))}
                    className="w-full px-4 py-3 pr-12 rounded-xl bg-white border border-slate-300 outline-none appearance-none dark:bg-black/20 dark:border-white/10"
                  >
                    {TIERS.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                  <SelectChevron />
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 p-4 dark:border-white/10">
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-600 dark:text-white/70">Base price</span>
                <span className="font-semibold">${basePrice.toFixed(0)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-3">
                <span className="text-slate-600 dark:text-white/70">Tier</span>
                <span className="font-semibold text-right">{selectedTier.label}</span>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between gap-3">
                <span className="font-semibold">Final price</span>
                <span className="text-xl font-bold">${finalPrice.toFixed(0)}</span>
              </div>
            </div>

            {payInfo?.txnRef ? (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
                <div className="font-semibold">Payment Receipt</div>
                <div className="mt-1">
                  Method: <span className="font-medium">{payInfo.method}</span>
                </div>
                <div className="mt-1">
                  Txn: <code className="text-xs break-all">{payInfo.txnRef}</code>
                </div>
              </div>
            ) : null}
          </div>

          {/* Contact Details */}
          <div className="rounded-2xl bg-white/80 border border-slate-200 p-5 sm:p-6 dark:bg-white/5 dark:border-white/10 backdrop-blur">
            <h2 className="text-xl font-semibold">Contact Details</h2>
            <p className="mt-1 text-slate-600 dark:text-white/70">
              Fill your details to confirm booking.
            </p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    setFieldErr((p) => ({ ...p, fullName: "" }));
                  }}
                  placeholder="Your name"
                  className={`w-full px-4 py-3 rounded-xl bg-white border outline-none focus:ring-2
                    dark:bg-black/20 dark:border-white/10 dark:focus:ring-white/10
                    ${
                      fieldErr.fullName
                        ? "border-rose-400 focus:ring-rose-200"
                        : "border-slate-300 focus:ring-slate-300"
                    }`}
                />
                {fieldErr.fullName ? (
                  <p className="mt-2 text-sm text-rose-600 dark:text-rose-300">
                    {fieldErr.fullName}
                  </p>
                ) : null}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setFieldErr((p) => ({ ...p, email: "" }));
                  }}
                  onBlur={() => {
                    if (email.trim() && !isValidEmail(email)) {
                      setFieldErr((p) => ({
                        ...p,
                        email: "Invalid email (example: name@gmail.com).",
                      }));
                    }
                  }}
                  placeholder="you@example.com"
                  className={`w-full px-4 py-3 rounded-xl bg-white border outline-none focus:ring-2
                    dark:bg-black/20 dark:border-white/10 dark:focus:ring-white/10
                    ${
                      fieldErr.email
                        ? "border-rose-400 focus:ring-rose-200"
                        : "border-slate-300 focus:ring-slate-300"
                    }`}
                />
                {fieldErr.email ? (
                  <p className="mt-2 text-sm text-rose-600 dark:text-rose-300">{fieldErr.email}</p>
                ) : null}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <input
                  value={phone}
                  onChange={(e) => {
                    const normalized = normalizePkPhone(e.target.value);
                    setPhone(normalized);
                    setFieldErr((p) => ({ ...p, phone: "" }));
                  }}
                  onBlur={() => {
                    const cleaned = phone.replace(/\s+/g, "");
                    if (cleaned && cleaned !== "+92" && !isValidPkPhone(cleaned)) {
                      setFieldErr((p) => ({
                        ...p,
                        phone: "Invalid phone. Use format: +923XXXXXXXXX (no spaces).",
                      }));
                    }
                  }}
                  placeholder="+923XXXXXXXXX"
                  inputMode="numeric"
                  className={`w-full px-4 py-3 rounded-xl bg-white border outline-none focus:ring-2
                    dark:bg-black/20 dark:border-white/10 dark:focus:ring-white/10
                    ${
                      fieldErr.phone
                        ? "border-rose-400 focus:ring-rose-200"
                        : "border-slate-300 focus:ring-slate-300"
                    }`}
                />
                <p className="mt-2 text-xs text-slate-500 dark:text-white/50">
                  Format: <span className="font-medium">+923XXXXXXXXX</span> (no spaces)
                </p>
                {fieldErr.phone ? (
                  <p className="mt-2 text-sm text-rose-600 dark:text-rose-300">{fieldErr.phone}</p>
                ) : null}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Address</label>
                <textarea
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    setFieldErr((p) => ({ ...p, address: "" }));
                  }}
                  placeholder="Street, area, city..."
                  rows={4}
                  className={`w-full px-4 py-3 rounded-xl bg-white border outline-none focus:ring-2
                    dark:bg-black/20 dark:border-white/10 dark:focus:ring-white/10
                    ${
                      fieldErr.address
                        ? "border-rose-400 focus:ring-rose-200"
                        : "border-slate-300 focus:ring-slate-300"
                    }`}
                />
                {fieldErr.address ? (
                  <p className="mt-2 text-sm text-rose-600 dark:text-rose-300">{fieldErr.address}</p>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT (sticky summary) */}
        <div className="lg:col-span-1 lg:sticky lg:top-6">
          <div className="rounded-2xl bg-white/80 border border-slate-200 p-5 sm:p-6 dark:bg-white/5 dark:border-white/10 backdrop-blur">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm text-slate-600 dark:text-white/70">Total</div>
                <div className="text-3xl font-bold">${finalPrice.toFixed(0)}</div>
              </div>
              <div className="text-right text-xs text-slate-500 dark:text-white/60">
                {selectedTier.label}
              </div>
            </div>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3 text-slate-600 dark:text-white/70">
                <span>Date</span>
                <span className="text-slate-900 dark:text-white text-right">{bookingDate || "—"}</span>
              </div>
              <div className="flex items-center justify-between gap-3 text-slate-600 dark:text-white/70">
                <span>Time</span>
                <span className="text-slate-900 dark:text-white text-right">{timeSlot}</span>
              </div>
              <div className="flex items-center justify-between gap-3 text-slate-600 dark:text-white/70">
                <span>Service</span>
                <span className="text-slate-900 dark:text-white text-right break-words">
                  {service?.name}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleBook}
              disabled={submitting}
              className="mt-6 w-full px-4 py-3 rounded-xl bg-black text-white hover:opacity-90 disabled:opacity-60
                         dark:bg-white dark:text-black dark:hover:opacity-90"
            >
              {submitting ? "Booking..." : `Confirm Booking ($${finalPrice.toFixed(0)})`}
            </button>

            <p className="mt-3 text-xs text-slate-500 dark:text-white/50">
              Note: Booking completion status is updated by Admin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
