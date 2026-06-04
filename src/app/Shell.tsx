/* ============================================================
   COMPAGNON — App shell: sidebar nav, theme application, layout
   ============================================================ */

import { useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Icon, type IconName } from "@/components/kit";
import { useStore } from "./store";
import { applyTheme, suppressTransitionsDuringThemeSwitch } from "./theme";
import { dueCards } from "@/lib/srs";

interface NavItem {
  to: string;
  label: string;
  icon: IconName;
  end?: boolean;
}

const NAV: NavItem[] = [
  { to: "/", label: "Home", icon: "home", end: true },
  { to: "/review", label: "Review", icon: "cards" },
  { to: "/corpus", label: "Corpus", icon: "grid" },
  { to: "/guides", label: "Guides", icon: "book" },
  { to: "/pal", label: "Pal", icon: "sparkle" },
];

function Sidebar({ due }: { due: number }) {
  const { settings, setSettings } = useStore();
  const dark = settings.theme === "dark";

  return (
    <nav
      style={{
        width: 224,
        flexShrink: 0,
        height: "100%",
        borderRight: "1px solid var(--line)",
        background: "var(--surface)",
        display: "flex",
        flexDirection: "column",
        padding: "22px 14px",
      }}
    >
      {/* wordmark */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 10px 22px" }}>
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 9,
            background: "var(--accent)",
            color: "var(--on-accent)",
            display: "grid",
            placeItems: "center",
            fontFamily: "var(--font-serif)",
            fontWeight: 600,
            fontSize: 18,
          }}
        >
          C
        </div>
        <span
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "var(--text-xl)",
            fontWeight: 500,
            letterSpacing: "var(--tracking-tight)",
          }}
        >
          Compagnon
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: 11,
              padding: "9px 11px",
              border: "none",
              cursor: "pointer",
              borderRadius: "var(--radius-md)",
              textDecoration: "none",
              background: isActive ? "var(--accent-soft)" : "transparent",
              color: isActive ? "var(--accent-press)" : "var(--ink-2)",
              fontSize: "var(--text-base)",
              fontWeight: isActive ? 600 : 500,
              letterSpacing: "var(--tracking-snug)",
              transition: "background var(--dur-fast), color var(--dur-fast)",
            })}
          >
            {({ isActive }) => (
              <>
                <Icon name={n.icon} size={19} />
                <span style={{ flex: 1 }}>{n.label}</span>
                {n.to === "/review" && due > 0 && (
                  <span
                    style={{
                      fontSize: "var(--text-xs)",
                      fontWeight: 600,
                      color: isActive ? "var(--accent-press)" : "var(--ink-3)",
                      background: isActive ? "var(--surface)" : "var(--surface-3)",
                      borderRadius: 999,
                      padding: "1px 8px",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {due}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* settings + theme toggle */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <NavLink
          to="/settings"
          style={({ isActive }) => ({
            display: "flex",
            alignItems: "center",
            gap: 11,
            padding: "9px 11px",
            borderRadius: "var(--radius-md)",
            textDecoration: "none",
            background: isActive ? "var(--accent-soft)" : "transparent",
            color: isActive ? "var(--accent-press)" : "var(--ink-2)",
            fontSize: "var(--text-sm)",
            fontWeight: isActive ? 600 : 500,
          })}
        >
          <Icon name="settings" size={18} />
          <span>Settings</span>
        </NavLink>
        <button
          type="button"
          onClick={() => {
            suppressTransitionsDuringThemeSwitch();
            setSettings({ theme: dark ? "light" : "dark" });
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 11,
            padding: "9px 11px",
            border: "none",
            cursor: "pointer",
            borderRadius: "var(--radius-md)",
            background: "transparent",
            color: "var(--ink-2)",
            fontSize: "var(--text-sm)",
            fontFamily: "inherit",
            width: "100%",
            textAlign: "left",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-3)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <Icon name={dark ? "sun" : "moon"} size={18} />
          <span>{dark ? "Light" : "Dark"} mode</span>
        </button>
      </div>
    </nav>
  );
}

export function Shell() {
  const { cards, settings } = useStore();
  const location = useLocation();
  const due = dueCards(cards).length;

  // Apply theme + accent whenever they change.
  useEffect(() => {
    applyTheme(settings.theme, settings.accent);
  }, [settings.theme, settings.accent]);

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar due={due} />
      <main key={location.pathname} style={{ flex: 1, overflowY: "auto", background: "var(--paper)" }}>
        <Outlet />
      </main>
    </div>
  );
}
