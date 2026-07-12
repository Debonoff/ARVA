"use client";

import { useState } from "react";
import { Leaf } from "lucide-react";
import { useAuth, usePrefs } from "@/components/providers";

export default function AuthScreen() {
  const { t, lang } = usePrefs();
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState("signin");
  const [f, setF] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const submit = async () => {
    setMsg(null);
    if (!f.email || !f.password) return setMsg(t.auth.fillEmail);
    if (mode === "signup" && !f.firstName) return setMsg(t.auth.fillName);
    setBusy(true);
    if (mode === "signin") {
      const { error } = await signIn(f.email, f.password);
      if (error) setMsg(error);
    } else {
      const { error, needsConfirm } = await signUp(f.email, f.password, f.firstName, f.lastName, lang);
      if (error) setMsg(error);
      else if (needsConfirm) setMsg(t.auth.checkEmail);
    }
    setBusy(false);
  };

  return (
    <div className="auth-grid">
      {/* левая панель бренда, светлая и минималистичная */}
      <div
        className="auth-hero"
        style={{
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 56,
          background: "var(--surface-2)",
          borderRight: "1px solid var(--line)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: "var(--radius)", background: "var(--ink)", display: "grid", placeItems: "center" }}>
            <Leaf size={22} strokeWidth={1.75} color="var(--accent)" />
          </div>
          <span className="display" style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" }}>Arva</span>
        </div>
        <div>
          <h1 style={{ fontSize: 40, fontWeight: 700, lineHeight: 1.05, letterSpacing: "-0.03em", margin: 0, maxWidth: 420 }}>
            {t.auth.tagline}
          </h1>
          <p className="lead" style={{ marginTop: 16, maxWidth: 380 }}>{t.auth.heroSub}</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <span style={{ width: 36, height: 6, borderRadius: "var(--radius-sm)", background: "var(--accent)" }} />
          <span style={{ width: 16, height: 6, borderRadius: "var(--radius-sm)", background: "var(--line-strong)" }} />
          <span style={{ width: 16, height: 6, borderRadius: "var(--radius-sm)", background: "var(--line-strong)" }} />
        </div>
      </div>

      {/* форма */}
      <div style={{ display: "grid", placeItems: "center", padding: 32, background: "var(--bg)" }}>
        <div style={{ width: "100%", maxWidth: 380 }} className="fadein">
          <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", margin: 0 }}>
            {mode === "signin" ? t.auth.signIn : t.auth.signUp}
          </h2>
          <p className="muted" style={{ marginTop: 8, marginBottom: 26, fontSize: 14 }}>
            {mode === "signin" ? "Arva" : t.auth.tagline}
          </p>

          {mode === "signup" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <input className="inp" placeholder={t.auth.firstName} value={f.firstName} onChange={(e) => setF({ ...f, firstName: e.target.value })} />
              <input className="inp" placeholder={t.auth.lastName} value={f.lastName} onChange={(e) => setF({ ...f, lastName: e.target.value })} />
            </div>
          )}
          <div style={{ marginBottom: 12 }}>
            <input className="inp" type="email" placeholder={t.auth.email} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <input
              className="inp"
              type="password"
              placeholder={t.auth.password}
              value={f.password}
              onChange={(e) => setF({ ...f, password: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
          </div>

          {msg && (
            <div
              style={{
                marginBottom: 16,
                fontSize: 13,
                color: "var(--ink)",
                background: "var(--surface-2)",
                border: "1px solid var(--line-strong)",
                borderLeft: "3px solid var(--ink)",
                borderRadius: "var(--radius)",
                padding: "10px 12px",
              }}
            >
              {msg}
            </div>
          )}

          <button className="btn btn-accent btn-block btn-lg" onClick={submit} disabled={busy}>
            {busy ? "..." : mode === "signin" ? t.auth.submitIn : t.auth.submitUp}
          </button>

          <div className="muted" style={{ textAlign: "center", marginTop: 18, fontSize: 14 }}>
            {mode === "signin" ? t.auth.noAccount : t.auth.haveAccount}{" "}
            <button
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setMsg(null);
              }}
              style={{ background: "none", border: "none", color: "var(--accent-strong)", fontWeight: 600, cursor: "pointer", fontSize: 14 }}
            >
              {mode === "signin" ? t.auth.toSignUp : t.auth.toSignIn}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
