"use client";

// ---------------------------------------------------------------------------
// Admin panel kabuğu: sidebar navigasyon + mobil üst bar + kullanıcı alanı.
// (panel) layout'u (server component) tarafından render edilir.
// ---------------------------------------------------------------------------

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/client-api";
import { Capability, ROLE_LABELS, User, can } from "@/lib/types";
import { ToastProvider } from "./ui";

interface NavLink {
  href: string;
  label: string;
  cap: Capability | null; // null = herkes görebilir
  icon: string; // SVG path (24x24, outline)
}

interface NavGroup {
  heading: string | null;
  links: NavLink[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    heading: null,
    links: [
      {
        href: "/admin",
        label: "Panel",
        cap: null,
        icon: "M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z",
      },
    ],
  },
  {
    heading: "İçerik",
    links: [
      {
        href: "/admin/pages",
        label: "Sayfalar",
        cap: "content",
        icon: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z",
      },
      {
        href: "/admin/navigation",
        label: "Menüler",
        cap: "content",
        icon: "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5",
      },
      {
        href: "/admin/media",
        label: "Medya",
        cap: "content",
        icon: "M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25z",
      },
    ],
  },
  {
    heading: "Yönetim",
    links: [
      {
        href: "/admin/settings",
        label: "Ayarlar",
        cap: "settings",
        icon: "M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75",
      },
      {
        href: "/admin/flags",
        label: "Özellik Bayrakları",
        cap: "settings",
        icon: "M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5",
      },
      {
        href: "/admin/api-keys",
        label: "API Anahtarları",
        cap: "settings",
        icon: "M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z",
      },
      {
        href: "/admin/users",
        label: "Kullanıcılar",
        cap: "users",
        icon: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z",
      },
      {
        href: "/admin/audit",
        label: "Denetim Kaydı",
        cap: "audit",
        icon: "M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25",
      },
    ],
  },
];

function NavIcon({ d }: { d: string }) {
  return (
    <svg
      className="h-4.5 w-4.5 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

function SidebarContent({
  user,
  pathname,
  onNavigate,
}: {
  user: User;
  pathname: string;
  onNavigate?: () => void;
}) {
  const [loggingOut, setLoggingOut] = useState(false);

  const groups = NAV_GROUPS.map((g) => ({
    ...g,
    links: g.links.filter((l) => l.cap === null || can(user.role, l.cap)),
  })).filter((g) => g.links.length > 0);

  const isActive = (href: string) =>
    href === "/admin"
      ? pathname === "/admin"
      : pathname === href || pathname.startsWith(href + "/");

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await api.post("/api/admin/auth/logout");
    } catch {
      // oturum zaten düşmüş olabilir — yine de giriş sayfasına dön
    }
    window.location.href = "/admin/login";
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 border-b border-slate-800 px-5 py-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
          C
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">Codex</p>
          <p className="text-[11px] text-slate-400">Yönetim Paneli</p>
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {groups.map((group, gi) => (
          <div key={gi}>
            {group.heading && (
              <p className="mb-1.5 px-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                {group.heading}
              </p>
            )}
            <ul className="space-y-0.5">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={onNavigate}
                    className={
                      isActive(link.href)
                        ? "flex items-center gap-2.5 rounded-lg bg-indigo-600 px-2.5 py-2 text-sm font-medium text-white"
                        : "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                    }
                  >
                    <NavIcon d={link.icon} />
                    <span className="truncate">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-800 p-4">
        <div className="mb-3 min-w-0">
          <p className="truncate text-sm font-medium text-white">
            {user.name || user.email}
          </p>
          <p className="truncate text-xs text-slate-400">{user.email}</p>
          <span className="mt-1.5 inline-flex items-center rounded-full border border-slate-700 bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-indigo-300">
            {ROLE_LABELS[user.role]}
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
          >
            Siteyi Görüntüle
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
              />
            </svg>
          </a>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-700 hover:text-white disabled:opacity-60"
          >
            {loggingOut ? "Çıkış yapılıyor…" : "Çıkış Yap"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminShell({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-50">
        {/* Mobil üst bar */}
        <header className="sticky top-0 z-40 flex items-center justify-between bg-slate-900 px-4 py-3 lg:hidden">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white">
              C
            </span>
            <span className="text-sm font-semibold text-white">
              Codex Yönetim Paneli
            </span>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Menüyü aç"
            className="rounded-lg p-1.5 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
        </header>

        {/* Mobil açılır menü */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-slate-900/60"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-slate-900 shadow-xl">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Menüyü kapat"
                className="absolute right-2 top-3 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <SidebarContent
                user={user}
                pathname={pathname}
                onNavigate={() => setMobileOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Masaüstü sidebar */}
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-slate-900 lg:flex">
          <SidebarContent user={user} pathname={pathname} />
        </aside>

        {/* İçerik */}
        <main className="lg:pl-64">
          <div className="mx-auto w-full max-w-6xl p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </ToastProvider>
  );
}
