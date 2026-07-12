"use client";

// Базовые UI компоненты Arva (issue 35).
// Острые углы, монохром плюс один акцент, светлая тема. Иконки через lucide-react.

/* ------------------------------- Button ------------------------------- */
// variant: primary (чёрная) | accent (зелёная) | secondary | ghost
// size: sm | md | lg
export function Button({
  variant = "primary",
  size = "md",
  block = false,
  iconLeft = null,
  iconRight = null,
  className = "",
  type = "button",
  children,
  ...props
}) {
  const cls = [
    "btn",
    `btn-${variant}`,
    size === "sm" ? "btn-sm" : size === "lg" ? "btn-lg" : "",
    block ? "btn-block" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <button type={type} className={cls} {...props}>
      {iconLeft}
      {children}
      {iconRight}
    </button>
  );
}

// Квадратная кнопка только с иконкой.
export function IconButton({ variant = "ghost", size = "md", className = "", children, ...props }) {
  const cls = ["btn", `btn-${variant}`, "btn-icon", size === "sm" ? "btn-sm" : "", className]
    .filter(Boolean)
    .join(" ");
  return (
    <button type="button" className={cls} {...props}>
      {children}
    </button>
  );
}

/* -------------------------------- Card -------------------------------- */
export function Card({ padding = 20, hover = false, className = "", style, children, ...props }) {
  const cls = ["card-soft", hover ? "card-hover" : "", className].filter(Boolean).join(" ");
  return (
    <div className={cls} style={{ padding, ...style }} {...props}>
      {children}
    </div>
  );
}

/* --------------------------- Field / Input --------------------------- */
export function Field({ label, htmlFor, children, style }) {
  return (
    <div style={{ marginBottom: 14, ...style }}>
      {label && (
        <label className="field-label" htmlFor={htmlFor}>
          {label}
        </label>
      )}
      {children}
    </div>
  );
}

export function Input({ className = "", ...props }) {
  return <input className={`inp ${className}`.trim()} {...props} />;
}

export function Textarea({ className = "", rows = 4, ...props }) {
  return <textarea className={`inp ${className}`.trim()} rows={rows} {...props} />;
}

export function Select({ className = "", children, ...props }) {
  return (
    <select className={`inp ${className}`.trim()} {...props}>
      {children}
    </select>
  );
}

/* -------------------------------- Badge ------------------------------- */
// variant: neutral | accent | solid | outline. Точка dot по желанию.
export function Badge({ variant = "neutral", dot = false, className = "", children }) {
  const cls = ["chip", `chip-${variant}`, className].filter(Boolean).join(" ");
  return (
    <span className={cls}>
      {dot && <span className="chip-dot" />}
      {children}
    </span>
  );
}

/* --------------------------------- Stat -------------------------------- */
// Показатель для дашборда. Иконка в квадратной плашке, монохром плюс акцент.
export function Stat({ label, value, icon, accent = false }) {
  return (
    <Card padding={18} className="fadein">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600 }}>{label}</span>
        <span
          style={{
            width: 30,
            height: 30,
            borderRadius: "var(--radius)",
            display: "grid",
            placeItems: "center",
            background: accent ? "var(--accent-weak)" : "var(--surface-2)",
            color: accent ? "var(--accent-strong)" : "var(--ink-2)",
            border: "1px solid var(--line)",
          }}
        >
          {icon}
        </span>
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, marginTop: 10, letterSpacing: "-0.02em" }}>{value}</div>
    </Card>
  );
}

/* ------------------------------- Spinner ------------------------------- */
export function Spinner() {
  return (
    <div style={{ display: "grid", placeItems: "center", minHeight: "60vh" }}>
      <div className="spinner" />
    </div>
  );
}
