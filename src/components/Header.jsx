import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import NotificationsBell from "./NotificationsBell";

function SunIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M21 13.2A8.5 8.5 0 0 1 10.8 3a7 7 0 1 0 10.2 10.2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Header() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const logoTo = user ? "/home" : "/";
  const homeTo = user ? "/home" : "/";

  const pillLinkClass = ({ isActive }) =>
    `px-4 py-2 rounded-full text-sm transition whitespace-nowrap ${
      isActive
        ? "bg-black/10 text-slate-900 border border-black/10 shadow-sm dark:bg-white/15 dark:text-white dark:border-white/20"
        : "text-slate-600 hover:text-slate-900 hover:bg-black/5 dark:text-white/85 dark:hover:text-white dark:hover:bg-white/10"
    }`;

  async function handleLogout() {
    await signOut();
    if (location.pathname.startsWith("/admin")) {
      window.location.href = "/admin-login";
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-white/85 backdrop-blur dark:border-white/10 dark:bg-gray-900/70">
      <div className="mx-auto max-w-6xl px-4 py-3">
        {/* ✅ Mobile: stacked | Desktop: 3 columns (logo | nav | actions) */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
          {/* LEFT (Logo + mobile actions) */}
          <div className="flex items-center justify-between gap-3 min-w-0">
            <Link
              to={logoTo}
              className="font-bold text-base sm:text-lg tracking-wide truncate text-slate-900 dark:text-white"
              title="Smart Service Booking"
            >
              Smart Service Booking
            </Link>

            {/* ✅ Mobile-only actions (bell + theme) */}
            <div className="flex items-center gap-2 shrink-0 sm:hidden">
              {user && <NotificationsBell />}

              <button
                onClick={toggleTheme}
                className="inline-flex items-center justify-center h-10 w-10 rounded-full border border-black/10
                           text-slate-700 hover:text-slate-900 hover:bg-black/5
                           dark:border-white/15 dark:text-white/90 dark:hover:text-white dark:hover:bg-white/10"
                type="button"
                aria-label="Toggle theme"
                title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              >
                {theme === "dark" ? <SunIcon /> : <MoonIcon />}
              </button>
            </div>
          </div>

          {/* CENTER NAV */}
          <nav className="flex items-center gap-2 rounded-full border border-black/10 bg-black/5 px-2 py-1.5 overflow-x-auto sm:overflow-visible sm:justify-center dark:border-white/15 dark:bg-white/5">
            <NavLink to={homeTo} className={pillLinkClass}>
              Home
            </NavLink>

            <NavLink to="/services" className={pillLinkClass}>
              Services
            </NavLink>

            {user && (
              <NavLink to="/dashboard" className={pillLinkClass}>
                Dashboard
              </NavLink>
            )}

            {/* ✅ Mobile-only auth buttons (kept same behavior) */}
            {!user ? (
              <div className="flex items-center gap-2 sm:hidden ml-auto">
                <Link
                  to="/login"
                  className="text-sm px-4 py-2 rounded-full bg-black text-white font-semibold dark:bg-white dark:text-black"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="text-sm px-4 py-2 rounded-full border border-black/15 text-slate-900 hover:bg-black/5
                             dark:border-white/25 dark:text-white dark:hover:bg-white/10"
                >
                  Signup
                </Link>
              </div>
            ) : (
              <button
                onClick={handleLogout}
                className="text-sm px-4 py-2 rounded-full bg-red-600 text-white hover:opacity-90 sm:hidden ml-auto"
                type="button"
              >
                Logout
              </button>
            )}
          </nav>

          {/* RIGHT ACTIONS (Desktop only) */}
          <div className="hidden sm:flex items-center justify-end gap-2">
            {user && <NotificationsBell />}

            <button
              onClick={toggleTheme}
              className="inline-flex items-center justify-center h-10 w-10 rounded-full border border-black/10
                         text-slate-700 hover:text-slate-900 hover:bg-black/5
                         dark:border-white/15 dark:text-white/90 dark:hover:text-white dark:hover:bg-white/10"
              type="button"
              aria-label="Toggle theme"
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            </button>

            {!user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-sm px-4 py-2 rounded-full bg-black text-white font-semibold dark:bg-white dark:text-black"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="text-sm px-4 py-2 rounded-full border border-black/15 text-slate-900 hover:bg-black/5
                             dark:border-white/25 dark:text-white dark:hover:bg-white/10"
                >
                  Signup
                </Link>
              </div>
            ) : (
              <button
                onClick={handleLogout}
                className="text-sm px-4 py-2 rounded-full bg-red-600 text-white hover:opacity-90"
                type="button"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
