"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import {
  LayoutGrid,
  Sprout,
  Wallet,
  Thermometer,
  Settings as SettingsIcon,
  LogOut,
  Search,
  Menu,
} from "lucide-react";
import { useAuth, usePrefs } from "@/components/providers";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { ICON } from "@/components/Icon";

export default function Shell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { t } = usePrefs();
  const [query, setQuery] = useState("");
  const [navOpen, setNavOpen] = useState(false);

  const meta = user?.user_metadata ?? {};
  const firstName = meta.first_name || (user?.email?.split("@")[0] ?? "Arva");
  const lastName = meta.last_name || "";

  const nav = [
    { href: "/dashboard", label: t.nav.dashboard, icon: <LayoutGrid size={ICON.size} strokeWidth={ICON.stroke} /> },
    { href: "/greenhouses", label: t.nav.greenhouses, icon: <Sprout size={ICON.size} strokeWidth={ICON.stroke} /> },
    { href: "/expenses", label: t.nav.expenses, icon: <Wallet size={ICON.size} strokeWidth={ICON.stroke} /> },
    { href: "/readings", label: t.nav.readings, icon: <Thermometer size={ICON.size} strokeWidth={ICON.stroke} /> },
    { href: "/settings", label: t.nav.settings, icon: <SettingsIcon size={ICON.size} strokeWidth={ICON.stroke} /> },
  ];

  const logout = async () => {
    await signOut();
    router.replace("/login");
  };

  return (
    <div className="arva-root" style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <div style={{ display: "flex", minHeight: "100vh" }}>
        {navOpen && <div className="nav-overlay" onClick={() => setNavOpen(false)} />}

        {/* Sidebar */}
        <aside className={`sidebar ${navOpen ? "open" : ""}`}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 8px 22px" }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "var(--radius)",
                background: "var(--ink)",
                display: "grid",
                placeItems: "center",
              }}
            >
              <Sprout size={18} strokeWidth={ICON.stroke} color="var(--accent)" />
            </div>
            <span className="display" style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em" }}>
              Arva
            </span>
          </div>

          <nav style={{ display: "grid", gap: 3 }}>
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`navitem ${pathname === n.href ? "active" : ""}`}
                onClick={() => setNavOpen(false)}
              >
                {n.icon} {n.label}
              </Link>
            ))}
          </nav>

          <button className="navitem" style={{ marginTop: "auto" }} onClick={logout}>
            <LogOut size={ICON.size} strokeWidth={ICON.stroke} /> {t.nav.logout}
          </button>
        </aside>

        {/* Main */}
        <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <header className="topbar">
            <button
              className="menu-btn btn btn-ghost btn-icon"
              onClick={() => setNavOpen(true)}
              aria-label="Меню"
            >
              <Menu size={20} strokeWidth={ICON.stroke} />
            </button>

            <div className="search-box" style={{ position: "relative", flex: 1, maxWidth: 420 }}>
              <Search
                size={17}
                strokeWidth={ICON.stroke}
                style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--faint)" }}
              />
              <input
                className="inp"
                placeholder={t.search}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ paddingLeft: 38 }}
              />
            </div>

            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
              <LanguageSwitcher />
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "var(--radius)",
                    background: "var(--ink)",
                    display: "grid",
                    placeItems: "center",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 14,
                    flexShrink: 0,
                  }}
                >
                  {(firstName[0] || "A").toUpperCase()}
                  {(lastName[0] || "").toUpperCase()}
                </div>
                <div className="user-meta" style={{ lineHeight: 1.2 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>
                    {firstName} {lastName}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>{user?.email}</div>
                </div>
              </div>
            </div>
          </header>

          <div className="page" style={{ flex: 1 }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
