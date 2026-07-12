"use client";

import { Globe, User, Check } from "lucide-react";
import { usePrefs, useAuth } from "@/components/providers";
import { LANGS } from "@/lib/i18n";
import { Card } from "@/components/ui";

export default function Settings() {
  const { t, lang, setLang } = usePrefs();
  const { user } = useAuth();

  const meta = user?.user_metadata ?? {};
  const fullName = [meta.first_name, meta.last_name].filter(Boolean).join(" ") || "—";

  return (
    <div className="fadein" style={{ maxWidth: 640 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", margin: 0 }}>{t.set.title}</h1>
      <p className="muted" style={{ marginTop: 6, marginBottom: 24 }}>
        Arva
      </p>

      {/* язык */}
      <Card padding={22} style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <Globe size={18} strokeWidth={1.75} />
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600 }}>{t.set.lang}</h3>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px,1fr))", gap: 10 }}>
          {LANGS.map((l) => (
            <button
              key={l.key}
              onClick={() => setLang(l.key)}
              className={`btn ${lang === l.key ? "btn-primary" : "btn-secondary"}`}
              style={{ justifyContent: "space-between" }}
            >
              {l.label} {lang === l.key && <Check size={16} strokeWidth={2} color="var(--accent)" />}
            </button>
          ))}
        </div>
      </Card>

      {/* аккаунт */}
      <Card padding={22}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <User size={18} strokeWidth={1.75} />
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600 }}>{t.set.account}</h3>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "var(--radius)",
              background: "var(--ink)",
              display: "grid",
              placeItems: "center",
              color: "#fff",
              fontWeight: 700,
              fontSize: 18,
            }}
          >
            {(meta.first_name?.[0] || user?.email?.[0] || "A").toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>{fullName}</div>
            <div className="muted" style={{ fontSize: 13 }}>
              {t.set.signedAs} {user?.email}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
