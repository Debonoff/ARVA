"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { T } from "@/lib/i18n";

/* ------------------------------- Auth ------------------------------- */
const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message };
  };

  const signUp = async (email, password, firstName, lastName, lang = "ru") => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { first_name: firstName, last_name: lastName, lang } },
    });
    if (error) return { error: error.message };
    // Если сессии нет — в проекте включено подтверждение по email.
    return { needsConfirm: !data.session };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

/* ---------------------------- Preferences ---------------------------- */
const PrefsContext = createContext(null);

export function usePrefs() {
  const ctx = useContext(PrefsContext);
  if (!ctx) throw new Error("usePrefs must be used within PrefsProvider");
  return ctx;
}

function PrefsProvider({ children }) {
  const { user } = useAuth();
  const [lang, setLangState] = useState("ru");

  const isLang = (l) => l === "ru" || l === "kk" || l === "en";

  // До входа: язык из localStorage (лендинг и экран входа).
  useEffect(() => {
    const l = localStorage.getItem("arva.lang");
    if (isLang(l)) setLangState(l);
  }, []);

  // После входа: язык из профиля пользователя — он следует за ним между устройствами.
  useEffect(() => {
    if (!user) return;
    let active = true;
    supabase
      .from("profiles")
      .select("lang")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (active && isLang(data?.lang)) {
          setLangState(data.lang);
          localStorage.setItem("arva.lang", data.lang);
        }
      });
    return () => {
      active = false;
    };
  }, [user]);

  // Смена языка: сохраняем локально и в профиль (если пользователь вошёл).
  const setLang = (l) => {
    if (!isLang(l)) return;
    setLangState(l);
    localStorage.setItem("arva.lang", l);
    if (user) {
      supabase
        .from("profiles")
        .update({ lang: l })
        .eq("id", user.id)
        .then(({ error }) => {
          if (error) console.error("Save lang error:", error.message);
        });
    }
  };

  // Тёмная тема не поддерживается: интерфейс всегда светлый.
  const theme = "light";
  const setTheme = () => {};

  return (
    <PrefsContext.Provider value={{ lang, setLang, theme, setTheme, t: T[lang] }}>
      {children}
    </PrefsContext.Provider>
  );
}

/* --------------------------- Combined root --------------------------- */
export function AppProviders({ children }) {
  return (
    <AuthProvider>
      <PrefsProvider>{children}</PrefsProvider>
    </AuthProvider>
  );
}
