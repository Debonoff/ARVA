"use client";

import { Globe } from "lucide-react";
import { usePrefs } from "@/components/providers";
import { LANGS } from "@/lib/i18n";

// Быстрый переключатель языка в верхней панели.
export default function LanguageSwitcher() {
  const { lang, setLang } = usePrefs();
  return (
    <label
      className="lang-switch"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        padding: "8px 12px",
        borderRadius: "var(--radius)",
        cursor: "pointer",
        background: "var(--surface-2)",
        border: "1px solid var(--line)",
      }}
      title="Язык / Language"
    >
      <Globe size={16} strokeWidth={1.75} style={{ color: "var(--muted)" }} />
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value)}
        style={{
          border: "none",
          background: "transparent",
          color: "inherit",
          fontFamily: "inherit",
          fontSize: 13.5,
          fontWeight: 600,
          outline: "none",
          cursor: "pointer",
          appearance: "none",
        }}
      >
        {LANGS.map((l) => (
          <option key={l.key} value={l.key} style={{ color: "#111" }}>
            {l.label}
          </option>
        ))}
      </select>
    </label>
  );
}
