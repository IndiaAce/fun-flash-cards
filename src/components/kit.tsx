/* ============================================================
   COMPAGNON — Component kit + icon set
   Typed port of the Claude Design prototype's components.jsx.
   The inline-style objects (reading CSS variables) ARE the
   pixel-perfect spec — kept faithfully, just typed.
   ============================================================ */

import {
  useEffect,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";

/* ---------- Icons (1.5px stroke, calm, consistent) ---------- */

export type IconName =
  | "home" | "cards" | "grid" | "book" | "spark" | "search" | "plus" | "check"
  | "chevronRight" | "chevronDown" | "chevronLeft" | "x" | "sun" | "moon"
  | "arrowRight" | "arrowLeft" | "settings" | "trash" | "edit" | "clock"
  | "flame" | "send" | "layers" | "volume" | "tag" | "inbox" | "sparkle"
  | "refresh" | "filter" | "upload" | "download";

const ICON_PATHS: Record<IconName, ReactNode> = {
  home: <><path d="M3.5 10.5 12 4l8.5 6.5" /><path d="M5.5 9.5V19a1 1 0 0 0 1 1H10v-5h4v5h3.5a1 1 0 0 0 1-1V9.5" /></>,
  cards: <><rect x="3" y="6" width="14" height="13" rx="2.5" /><path d="M7 3.5h10.5A2.5 2.5 0 0 1 20 6v10" /></>,
  grid: <><rect x="3.5" y="3.5" width="7" height="7" rx="1.8" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.8" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.8" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.8" /></>,
  book: <><path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v15.5H5.5A1.5 1.5 0 0 0 4 21z" /><path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H13v15.5h5.5A1.5 1.5 0 0 1 20 21z" /></>,
  spark: <><path d="M12 3.5c.3 3.7 1.8 5.2 5.5 5.5-3.7.3-5.2 1.8-5.5 5.5-.3-3.7-1.8-5.2-5.5-5.5 3.7-.3 5.2-1.8 5.5-5.5Z" /><path d="M18.5 14.5c.15 1.6.85 2.3 2.5 2.5-1.65.2-2.35.9-2.5 2.5-.15-1.6-.85-2.3-2.5-2.5 1.65-.2 2.35-.9 2.5-2.5Z" /></>,
  search: <><circle cx="11" cy="11" r="6.5" /><path d="m20 20-3.6-3.6" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  check: <path d="m5 12.5 4.5 4.5L19 7" />,
  chevronRight: <path d="m9 6 6 6-6 6" />,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  chevronLeft: <path d="m15 6-6 6 6 6" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2M12 19.5v2M4.5 12h-2M21.5 12h-2M5.6 5.6 4.2 4.2M19.8 19.8l-1.4-1.4M18.4 5.6l1.4-1.4M4.2 19.8l1.4-1.4" /></>,
  moon: <path d="M20 13.5A8 8 0 1 1 10.5 4a6.5 6.5 0 0 0 9.5 9.5Z" />,
  arrowRight: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
  arrowLeft: <><path d="M19 12H5" /><path d="m11 6-6 6 6 6" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M12 2.5v2.2M12 19.3v2.2M21.5 12h-2.2M4.7 12H2.5M18.7 5.3l-1.5 1.5M6.8 17.2l-1.5 1.5M18.7 18.7l-1.5-1.5M6.8 6.8 5.3 5.3" /></>,
  trash: <><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 12.5a1.5 1.5 0 0 0 1.5 1.5h7a1.5 1.5 0 0 0 1.5-1.5L18 7" /></>,
  edit: <><path d="M4 20h4L18.5 9.5a2 2 0 0 0-2.83-2.83L5 17.2z" /><path d="m14 7 3 3" /></>,
  clock: <><circle cx="12" cy="12" r="8" /><path d="M12 8v4.2l2.8 1.8" /></>,
  flame: <path d="M12 3c.5 3 3.5 4 3.5 7.5a3.5 3.5 0 0 1-7 0C8.5 8.5 9.5 8 9.5 6.5c1 .5 1.5 1.5 1.5 2.5.8-1.2 1.5-3.5 1-6Z" />,
  send: <path d="M4.5 12 20 4.5l-3 15.5-5-5-2.5 4-1-6.5-4-.5Z" />,
  layers: <><path d="m12 3 8 4.5-8 4.5-8-4.5Z" /><path d="m4 12 8 4.5 8-4.5M4 16.5 12 21l8-4.5" /></>,
  volume: <><path d="M11 5 6.5 8.5H3.5v7h3L11 19z" /><path d="M15 9.5a3.5 3.5 0 0 1 0 5M17.5 7a7 7 0 0 1 0 10" /></>,
  tag: <><path d="M4 4h7l9 9-7 7-9-9z" /><circle cx="8.5" cy="8.5" r="1.4" fill="currentColor" stroke="none" /></>,
  inbox: <><path d="M4 13h4l1.5 2.5h5L16 13h4" /><path d="M4 13 6 5.5A1.5 1.5 0 0 1 7.5 4.5h9A1.5 1.5 0 0 1 18 5.5L20 13v4.5A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5z" /></>,
  sparkle: <path d="M12 3c.4 4.5 2.5 6.6 7 7-4.5.4-6.6 2.5-7 7-.4-4.5-2.5-6.6-7-7 4.5-.4 6.6-2.5 7-7Z" />,
  refresh: <><path d="M20 12a8 8 0 1 1-2.3-5.6" /><path d="M20 4v4h-4" /></>,
  filter: <path d="M4 5h16l-6 7v6l-4 2v-8z" />,
  upload: <><path d="M12 16V4M7 9l5-5 5 5" /><path d="M5 20h14" /></>,
  download: <><path d="M12 4v12M7 11l5 5 5-5" /><path d="M5 20h14" /></>,
};

export function Icon({
  name,
  size = 20,
  stroke = 1.6,
  style,
}: {
  name: IconName;
  size?: number;
  stroke?: number;
  style?: CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      aria-hidden="true"
    >
      {ICON_PATHS[name] ?? null}
    </svg>
  );
}

/* ---------- Button ---------- */

export type ButtonVariant = "primary" | "quiet" | "ghost" | "outline" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export function Button({
  variant = "primary",
  size = "md",
  icon,
  iconRight,
  children,
  onClick,
  disabled,
  full,
  type = "button",
  style,
  title,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  iconRight?: IconName;
  children?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  full?: boolean;
  type?: "button" | "submit";
  style?: CSSProperties;
  title?: string;
}) {
  const sizes = {
    sm: { padding: "0 14px", height: 34, fontSize: "var(--text-sm)", radius: "var(--radius-sm)" },
    md: { padding: "0 18px", height: 42, fontSize: "var(--text-base)", radius: "var(--radius-md)" },
    lg: { padding: "0 24px", height: 52, fontSize: "var(--text-md)", radius: "var(--radius-lg)" },
  }[size];

  const base: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: sizes.height,
    padding: sizes.padding,
    fontSize: sizes.fontSize,
    fontWeight: 560,
    borderRadius: sizes.radius,
    border: "1px solid transparent",
    cursor: disabled ? "default" : "pointer",
    width: full ? "100%" : "auto",
    letterSpacing: "var(--tracking-snug)",
    transition:
      "background var(--dur-fast) var(--ease-soft), border-color var(--dur-fast), transform var(--dur-fast), box-shadow var(--dur-fast), color var(--dur-fast)",
    opacity: disabled ? 0.45 : 1,
    whiteSpace: "nowrap",
    ...style,
  };
  const variants: Record<ButtonVariant, CSSProperties> = {
    primary: { background: "var(--accent)", color: "var(--on-accent)", boxShadow: "var(--shadow-xs)" },
    quiet: { background: "var(--surface-3)", color: "var(--ink)" },
    ghost: { background: "transparent", color: "var(--ink-2)" },
    outline: { background: "var(--surface)", color: "var(--ink)", borderColor: "var(--line-2)", boxShadow: "var(--shadow-xs)" },
    danger: { background: "var(--miss-soft)", color: "var(--miss-ink)" },
  };
  const hover: Record<ButtonVariant, CSSProperties> = {
    primary: { background: "var(--accent-press)" },
    quiet: { background: "var(--line)" },
    ghost: { background: "var(--surface-3)", color: "var(--ink)" },
    outline: { borderColor: "var(--ink-3)" },
    danger: { background: "var(--miss)", color: "var(--on-accent)" },
  };

  const [hov, setHov] = useState(false);
  const [press, setPress] = useState(false);
  const iconSize = size === "sm" ? 16 : 18;

  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      title={title}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setHov(false); setPress(false); }}
      onMouseDown={() => setPress(true)}
      onMouseUp={() => setPress(false)}
      style={{
        ...base,
        ...variants[variant],
        ...(hov && !disabled ? hover[variant] : {}),
        transform: press && !disabled ? "scale(.975)" : "scale(1)",
      }}
    >
      {icon && <Icon name={icon} size={iconSize} />}
      {children}
      {iconRight && <Icon name={iconRight} size={iconSize} />}
    </button>
  );
}

/* ---------- Icon-only button ---------- */

export function IconButton({
  name,
  onClick,
  title,
  active,
  size = 40,
  iconSize = 20,
  style,
}: {
  name: IconName;
  onClick?: () => void;
  title: string;
  active?: boolean;
  size?: number;
  iconSize?: number;
  style?: CSSProperties;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: size,
        height: size,
        display: "grid",
        placeItems: "center",
        cursor: "pointer",
        borderRadius: "var(--radius-md)",
        border: "1px solid transparent",
        background: active ? "var(--accent-soft)" : hov ? "var(--surface-3)" : "transparent",
        color: active ? "var(--accent)" : hov ? "var(--ink)" : "var(--ink-2)",
        transition: "background var(--dur-fast), color var(--dur-fast)",
        ...style,
      }}
    >
      <Icon name={name} size={iconSize} />
    </button>
  );
}

/* ---------- Chip / Tag ---------- */

export type ChipTone = "neutral" | "accent" | "got" | "miss" | "warm" | "outline";

export function Chip({
  children,
  tone = "neutral",
  icon,
  size = "md",
  onClick,
  active,
  style,
}: {
  children?: ReactNode;
  tone?: ChipTone;
  icon?: IconName;
  size?: "sm" | "md";
  onClick?: () => void;
  active?: boolean;
  style?: CSSProperties;
}) {
  const tones: Record<ChipTone, { bg: string; fg: string; border?: string }> = {
    neutral: { bg: "var(--surface-3)", fg: "var(--ink-2)" },
    accent: { bg: "var(--accent-soft)", fg: "var(--accent-press)" },
    got: { bg: "var(--got-soft)", fg: "var(--got-ink)" },
    miss: { bg: "var(--miss-soft)", fg: "var(--miss-ink)" },
    warm: { bg: "var(--warm-soft)", fg: "var(--miss-ink)" },
    outline: { bg: "transparent", fg: "var(--ink-2)", border: "var(--line-2)" },
  };
  const t = tones[tone];
  const [hov, setHov] = useState(false);
  return (
    <span
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: size === "sm" ? "2px 9px" : "4px 11px",
        fontSize: size === "sm" ? "var(--text-xs)" : "var(--text-sm)",
        fontWeight: 540,
        borderRadius: "var(--radius-full)",
        background: active ? "var(--accent)" : t.bg,
        color: active ? "var(--on-accent)" : t.fg,
        border: `1px solid ${active ? "transparent" : t.border ?? "transparent"}`,
        cursor: onClick ? "pointer" : "default",
        letterSpacing: "var(--tracking-snug)",
        transition: "all var(--dur-fast)",
        opacity: onClick && hov && !active ? 0.7 : 1,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {icon && <Icon name={icon} size={size === "sm" ? 12 : 14} />}
      {children}
    </span>
  );
}

/* ---------- Input ---------- */

export function Input({
  value,
  onChange,
  placeholder,
  icon,
  type = "text",
  style,
  onKeyDown,
  autoFocus,
}: {
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  icon?: IconName;
  type?: string;
  style?: CSSProperties;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  autoFocus?: boolean;
}) {
  const [foc, setFoc] = useState(false);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 9,
        height: 44,
        padding: "0 14px",
        background: "var(--surface)",
        border: `1px solid ${foc ? "var(--accent)" : "var(--line-2)"}`,
        borderRadius: "var(--radius-md)",
        transition: "border-color var(--dur-fast), box-shadow var(--dur-fast)",
        boxShadow: foc ? "0 0 0 4px var(--accent-soft)" : "var(--shadow-xs)",
        ...style,
      }}
    >
      {icon && <Icon name={icon} size={18} style={{ color: "var(--ink-3)", flexShrink: 0 }} />}
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        autoFocus={autoFocus}
        onChange={(e) => onChange?.(e.target.value)}
        onFocus={() => setFoc(true)}
        onBlur={() => setFoc(false)}
        onKeyDown={onKeyDown}
        style={{
          border: "none",
          outline: "none",
          background: "transparent",
          flex: 1,
          fontSize: "var(--text-base)",
          color: "var(--ink)",
          fontFamily: "inherit",
          minWidth: 0,
        }}
      />
    </div>
  );
}

/* ---------- Textarea ---------- */

export function Textarea({
  value,
  onChange,
  placeholder,
  rows = 3,
  style,
}: {
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  rows?: number;
  style?: CSSProperties;
}) {
  const [foc, setFoc] = useState(false);
  return (
    <textarea
      value={value}
      placeholder={placeholder}
      rows={rows}
      onChange={(e) => onChange?.(e.target.value)}
      onFocus={() => setFoc(true)}
      onBlur={() => setFoc(false)}
      style={{
        width: "100%",
        padding: "11px 14px",
        resize: "vertical",
        fontFamily: "inherit",
        fontSize: "var(--text-base)",
        lineHeight: 1.55,
        color: "var(--ink)",
        background: "var(--surface)",
        border: `1px solid ${foc ? "var(--accent)" : "var(--line-2)"}`,
        borderRadius: "var(--radius-md)",
        outline: "none",
        boxShadow: foc ? "0 0 0 4px var(--accent-soft)" : "var(--shadow-xs)",
        transition: "border-color var(--dur-fast), box-shadow var(--dur-fast)",
        ...style,
      }}
    />
  );
}

/* ---------- Toggle ---------- */

export function Toggle({
  on,
  onChange,
  size = 28,
}: {
  on: boolean;
  onChange?: (on: boolean) => void;
  size?: number;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange?.(!on)}
      style={{
        width: size * 1.72,
        height: size,
        borderRadius: 999,
        border: "none",
        cursor: "pointer",
        padding: 3,
        background: on ? "var(--accent)" : "var(--line-2)",
        transition: "background var(--dur) var(--ease-soft)",
        display: "flex",
        alignItems: "center",
      }}
    >
      <span
        style={{
          width: size - 6,
          height: size - 6,
          borderRadius: 999,
          background: "#fff",
          boxShadow: "var(--shadow-sm)",
          transform: on ? `translateX(${size * 0.72}px)` : "translateX(0)",
          transition: "transform var(--dur) var(--ease-calm)",
        }}
      />
    </button>
  );
}

/* ---------- Segmented control ---------- */

export type SegmentedOption<T extends string> = { value: T; label: string };

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  full,
  style,
}: {
  options: Array<SegmentedOption<T>>;
  value: T;
  onChange?: (v: T) => void;
  full?: boolean;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        padding: 3,
        gap: 2,
        background: "var(--surface-3)",
        borderRadius: "var(--radius-md)",
        width: full ? "100%" : "auto",
        ...style,
      }}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange?.(o.value)}
            style={{
              flex: full ? 1 : "none",
              height: 34,
              padding: "0 16px",
              border: "none",
              cursor: "pointer",
              borderRadius: "var(--radius-sm)",
              fontSize: "var(--text-sm)",
              fontWeight: 560,
              fontFamily: "inherit",
              background: active ? "var(--surface)" : "transparent",
              color: active ? "var(--ink)" : "var(--ink-3)",
              boxShadow: active ? "var(--shadow-xs)" : "none",
              letterSpacing: "var(--tracking-snug)",
              transition: "background var(--dur-fast), color var(--dur-fast)",
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Card surface ---------- */

export type Elevation = "none" | "xs" | "sm" | "md" | "lg";

export function Surface({
  children,
  pad = 24,
  elevation = "sm",
  style,
  onClick,
  hover: hoverable,
}: {
  children?: ReactNode;
  pad?: number;
  elevation?: Elevation;
  style?: CSSProperties;
  onClick?: () => void;
  hover?: boolean;
}) {
  const [hov, setHov] = useState(false);
  const sh: Record<Elevation, string> = {
    none: "none",
    xs: "var(--shadow-xs)",
    sm: "var(--shadow-sm)",
    md: "var(--shadow-md)",
    lg: "var(--shadow-lg)",
  };
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--line)",
        borderRadius: "var(--radius-xl)",
        padding: pad,
        boxShadow: hoverable && hov ? "var(--shadow-md)" : sh[elevation],
        transition:
          "box-shadow var(--dur) var(--ease-soft), transform var(--dur) var(--ease-soft), border-color var(--dur)",
        transform: hoverable && hov ? "translateY(-2px)" : "none",
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ---------- Empty state ---------- */

export function EmptyState({
  icon = "inbox",
  title,
  body,
  action,
}: {
  icon?: IconName;
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "56px 24px", gap: 14 }}>
      <div style={{ width: 64, height: 64, borderRadius: "var(--radius-xl)", background: "var(--surface-3)", display: "grid", placeItems: "center", color: "var(--ink-3)" }}>
        <Icon name={icon} size={28} />
      </div>
      <div style={{ fontSize: "var(--text-xl)", fontWeight: 600, letterSpacing: "var(--tracking-tight)" }}>{title}</div>
      {body && <div style={{ fontSize: "var(--text-base)", color: "var(--ink-3)", maxWidth: 340, lineHeight: 1.55 }}>{body}</div>}
      {action && <div style={{ marginTop: 6 }}>{action}</div>}
    </div>
  );
}

/* ---------- Tabs (underline) ---------- */

export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  style,
}: {
  tabs: Array<{ value: T; label: string }>;
  value: T;
  onChange?: (v: T) => void;
  style?: CSSProperties;
}) {
  return (
    <div style={{ display: "flex", gap: 4, borderBottom: "1px solid var(--line)", ...style }}>
      {tabs.map((t) => {
        const active = t.value === value;
        return (
          <button
            key={t.value}
            type="button"
            onClick={() => onChange?.(t.value)}
            style={{
              position: "relative",
              padding: "12px 16px",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontSize: "var(--text-base)",
              fontWeight: active ? 600 : 500,
              fontFamily: "inherit",
              color: active ? "var(--ink)" : "var(--ink-3)",
              letterSpacing: "var(--tracking-snug)",
              transition: "color var(--dur-fast)",
            }}
          >
            {t.label}
            <span
              style={{
                position: "absolute",
                left: 12,
                right: 12,
                bottom: -1,
                height: 2,
                borderRadius: 2,
                background: "var(--accent)",
                transform: active ? "scaleX(1)" : "scaleX(0)",
                transition: "transform var(--dur) var(--ease-calm)",
              }}
            />
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Section label ---------- */

export function Eyebrow({ children, style }: { children?: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        fontSize: "var(--text-xs)",
        fontWeight: 640,
        letterSpacing: "var(--tracking-wide)",
        textTransform: "uppercase",
        color: "var(--ink-3)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ---------- Appear: safe entrance (visible end-state, never stuck hidden) ---------- */

export function Appear({
  delay = 0,
  y = 14,
  children,
  style,
}: {
  delay?: number;
  y?: number;
  children?: ReactNode;
  style?: CSSProperties;
}) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setOn(true), 30 + delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div
      style={{
        opacity: on ? 1 : 0,
        transform: on ? "translateY(0)" : `translateY(${y}px)`,
        transition:
          "opacity var(--dur-slow) var(--ease-calm), transform var(--dur-slow) var(--ease-calm)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
