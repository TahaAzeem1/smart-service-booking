import { useEffect, useMemo, useRef, useState } from "react";
import supabase from "../supabaseClient";
import { useAuth } from "../context/AuthContext";

export default function NotificationsBell() {
  const { user } = useAuth();

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);

  const intervalRef = useRef(null);
  const loadingRef = useRef(false);

  const safeItems = useMemo(() => {
    const list = Array.isArray(items) ? items : [];
    return list
      .filter((n) => {
        const msg = String(n?.message || "");
        return !msg.includes("Price: $0");
      })
      .map((n) => ({
        ...n,
        title: String(n?.title || "").replace(/\(demo\)/gi, "").trim(),
        message: String(n?.message || "").replace(/\(demo\)/gi, "").trim(),
      }));
  }, [items]);

  const computedUnread = useMemo(() => safeItems.filter((n) => !n.is_read).length, [safeItems]);

  useEffect(() => setUnread(computedUnread), [computedUnread]);

  async function load() {
    if (!user?.id) return;
    if (loadingRef.current) return;
    if (document.visibilityState === "hidden") return;

    loadingRef.current = true;

    try {
      const { data, error, status } = await supabase
        .from("notifications")
        .select("id, user_id, title, message, is_read, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) {
        if (status === 401 || status === 403) {
          stopPolling();
          window.location.href = "/login";
          return;
        }
        console.error("Notifications load error:", error);
        return;
      }

      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Notifications load crashed:", e);
    } finally {
      loadingRef.current = false;
    }
  }

  function stopPolling() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
  }

  function startPolling() {
    stopPolling();
    intervalRef.current = setInterval(load, 30000);
  }

  async function markAllRead() {
    const unreadIds = safeItems.filter((n) => !n.is_read).map((n) => n.id);
    if (unreadIds.length === 0) return;

    const { error, status } = await supabase.from("notifications").update({ is_read: true }).in("id", unreadIds);

    if (error) {
      if (status === 401 || status === 403) {
        stopPolling();
        window.location.href = "/login";
        return;
      }
      console.error("markAllRead error:", error);
      return;
    }

    await load();
  }

  useEffect(() => {
    if (!user?.id) {
      stopPolling();
      setItems([]);
      setUnread(0);
      return;
    }

    load();
    startPolling();

    const onVis = () => {
      if (document.visibilityState === "hidden") stopPolling();
      else {
        load();
        startPolling();
      }
    };

    document.addEventListener("visibilitychange", onVis);

    return () => {
      document.removeEventListener("visibilitychange", onVis);
      stopPolling();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // close on outside click
  useEffect(() => {
    function onDoc(e) {
      if (!open) return;
      const el = e.target;
      if (!(el instanceof Element)) return;
      const root = el.closest?.("[data-noti-root]");
      if (!root) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div className="relative" data-noti-root>
      <button
        onClick={() => {
          setOpen((v) => !v);
          if (!open) load();
        }}
        className="relative h-10 w-10 grid place-items-center rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white"
        title="Notifications"
        type="button"
      >
        🔔
        {unread > 0 && (
          <span className="absolute -top-2 -right-2 text-[11px] bg-red-600 text-white rounded-full min-w-[20px] h-5 px-1 grid place-items-center">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="
            absolute right-0 mt-2
            w-[92vw] sm:w-[420px]
            max-w-[92vw]
            rounded-2xl border border-white/10 bg-[#0b1222]/90 backdrop-blur-xl
            shadow-2xl overflow-hidden
          "
        >
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/10">
            <div className="font-semibold text-sm text-white">Notifications</div>
            <button
              onClick={markAllRead}
              className="text-xs px-3 py-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white"
              type="button"
            >
              Mark all read
            </button>
          </div>

          {/* max height based on viewport so mobile doesn't overflow */}
          <div className="max-h-[65vh] sm:max-h-80 overflow-auto">
            {safeItems.length === 0 ? (
              <div className="p-4 text-sm text-white/70">No notifications</div>
            ) : (
              safeItems.map((n) => (
                <div key={n.id} className="px-4 py-3 border-b border-white/10">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white break-words">{n.title}</div>
                      <div className="text-sm text-white/80 mt-1 break-words">{n.message}</div>
                      <div className="text-xs text-white/50 mt-2">
                        {new Date(n.created_at).toLocaleString()}
                      </div>
                    </div>

                    {!n.is_read && (
                      <span className="shrink-0 text-[11px] px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/25 text-red-200">
                        new
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
