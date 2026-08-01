"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/client-api";
import { Badge, Card, PageHeader, Spinner } from "@/components/admin/ui";
import { AuditEntry } from "@/lib/types";

interface StatsResponse {
  counts: {
    pages: number;
    sections: number;
    media: number;
    users: number;
    flags: number;
    apiKeys: number;
  };
  recentAudit: AuditEntry[];
}

const ACTION_LABELS: Record<string, string> = {
  login: "Giriş",
  logout: "Çıkış",
  create: "Oluşturma",
  update: "Güncelleme",
  delete: "Silme",
  upload: "Yükleme",
  reorder: "Sıralama",
};

function actionLabel(action: string): string {
  if (ACTION_LABELS[action]) return ACTION_LABELS[action];
  const prefix = action.split(/[._:]/)[0];
  return ACTION_LABELS[prefix] ?? action;
}

function actionColor(action: string): "gray" | "green" | "red" | "blue" | "amber" {
  if (action.startsWith("delete")) return "red";
  if (action.startsWith("create") || action.startsWith("upload")) return "green";
  if (action.startsWith("update") || action.startsWith("reorder")) return "blue";
  if (action === "login" || action === "logout") return "amber";
  return "gray";
}

const QUICK_LINKS: { href: string; label: string; description: string }[] = [
  { href: "/admin/pages", label: "Sayfalar", description: "Sayfaları ve bölümleri düzenleyin" },
  { href: "/admin/navigation", label: "Menüler", description: "Üst ve alt menüyü yönetin" },
  { href: "/admin/media", label: "Medya", description: "Görsel yükleyin ve yönetin" },
  { href: "/admin/settings", label: "Ayarlar", description: "Site ayarlarını güncelleyin" },
];

export default function AdminDashboardPage() {
  const [data, setData] = useState<StatsResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    api
      .get<StatsResponse>("/api/admin/stats")
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "İşlem başarısız");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <>
        <PageHeader title="Panel" description="Sitenize genel bakış." />
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      </>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-indigo-600">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const stats: { label: string; value: number; href: string }[] = [
    { label: "Sayfalar", value: data.counts.pages, href: "/admin/pages" },
    { label: "Bölümler", value: data.counts.sections, href: "/admin/pages" },
    { label: "Medya", value: data.counts.media, href: "/admin/media" },
    { label: "Kullanıcılar", value: data.counts.users, href: "/admin/users" },
    { label: "Bayraklar", value: data.counts.flags, href: "/admin/flags" },
    { label: "API Anahtarları", value: data.counts.apiKeys, href: "/admin/api-keys" },
  ];

  return (
    <>
      <PageHeader
        title="Panel"
        description="Sitenize genel bakış: içerik, kullanıcılar ve son işlemler."
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-indigo-300 hover:bg-indigo-50/40"
          >
            <p className="text-2xl font-semibold tracking-tight text-slate-900">
              {s.value}
            </p>
            <p className="mt-0.5 truncate text-xs font-medium text-slate-500">
              {s.label}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="Hızlı Erişim">
          <ul className="space-y-2">
            {QUICK_LINKS.map((q) => (
              <li key={q.href}>
                <Link
                  href={q.href}
                  className="group flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3.5 py-2.5 transition-colors hover:border-indigo-300 hover:bg-indigo-50/40"
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-slate-900">
                      {q.label}
                    </span>
                    <span className="block truncate text-xs text-slate-500">
                      {q.description}
                    </span>
                  </span>
                  <svg
                    className="h-4 w-4 shrink-0 text-slate-400 transition-colors group-hover:text-indigo-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.25 4.5l7.5 7.5-7.5 7.5"
                    />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>
        </Card>

        {data.recentAudit.length > 0 && (
          <Card title="Son İşlemler">
            <ul className="divide-y divide-slate-100">
              {data.recentAudit.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <Badge color={actionColor(entry.action)}>
                      {actionLabel(entry.action)}
                    </Badge>
                    <div className="min-w-0">
                      <p className="truncate text-sm text-slate-700">
                        {entry.entity
                          ? `${entry.entity}${entry.entity_id ? ` #${entry.entity_id}` : ""}`
                          : entry.action}
                      </p>
                      <p className="truncate text-xs text-slate-400">
                        {entry.user_email || "Sistem"}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 text-xs tabular-nums text-slate-400">
                    {entry.created_at}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </>
  );
}
