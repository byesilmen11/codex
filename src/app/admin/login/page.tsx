"use client";

import { useState } from "react";
import { api } from "@/lib/client-api";
import { Button, Input } from "@/components/admin/ui";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/api/admin/auth/login", { email, password });
      const next =
        new URLSearchParams(window.location.search).get("next") || "/admin";
      window.location.href = next;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Giriş başarısız");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white shadow-sm">
            C
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            Codex Yönetim Paneli
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Devam etmek için hesabınıza giriş yapın.
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          {error && (
            <div
              role="alert"
              className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                E-posta
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                placeholder="ornek@site.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Şifre
              </label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" loading={loading} className="w-full">
              Giriş Yap
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Codex CMS — yetkili kullanıcılar içindir.
        </p>
      </div>
    </div>
  );
}
