"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Info } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isSupabaseConfigured) {
      router.push("/dashboard");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, surname } },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/dashboard");
  }

  return (
    <div className="rounded-3xl border border-line bg-paper p-8 shadow-card">
      <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">Регистрация</h1>
      <p className="mt-1 text-sm text-muted">Создайте аккаунт Arva.</p>

      {!isSupabaseConfigured && (
        <p className="mt-4 flex items-start gap-2 rounded-xl bg-brand-50 p-3 text-xs text-brand-dark">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Supabase не подключён — вход в демо-режиме, данные хранятся в браузере.
        </p>
      )}

      <form onSubmit={submit} className="mt-6 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="name">Имя</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="given-name"
            />
          </div>
          <div>
            <Label htmlFor="surname">Фамилия</Label>
            <Input
              id="surname"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              autoComplete="family-name"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>
        <div>
          <Label htmlFor="password">Пароль</Label>
          <Input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Создаём…" : "Создать аккаунт"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Уже есть аккаунт?{" "}
        <Link href="/login" className="font-medium text-brand">
          Войти
        </Link>
      </p>
    </div>
  );
}
