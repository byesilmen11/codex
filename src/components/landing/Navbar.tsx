"use client";

import { useState } from "react";
import type { AllSettings, NavigationItem } from "@/lib/types";

export default function Navbar({
  settings,
  nav,
  dark,
}: {
  settings: AllSettings;
  nav: NavigationItem[];
  dark: boolean;
}) {
  const [open, setOpen] = useState(false);
  const { site } = settings;
  const logoLabel = site.logoText || site.title;

  const linkClass = dark
    ? "text-sm font-medium text-slate-300 transition hover:text-white"
    : "text-sm font-medium text-slate-600 transition hover:text-slate-900";

  return (
    <header
      className={`sticky top-0 z-50 border-b backdrop-blur-md ${
        dark ? "border-slate-800 bg-slate-950/70" : "border-slate-200 bg-white/70"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <a href="#hero" className="flex items-center gap-2" aria-label="Ana sayfa">
          {site.logoImage ? (
            <img src={site.logoImage} alt={logoLabel} className="h-8 w-auto" />
          ) : (
            <span className="text-xl font-bold tracking-tight text-[var(--color-primary)]">
              {logoLabel}
            </span>
          )}
        </a>

        {nav.length > 0 && (
          <nav className="hidden items-center gap-8 md:flex" aria-label="Ana menü">
            {nav.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener" : undefined}
                className={linkClass}
              >
                {item.label}
              </a>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-3">
          {nav.length > 0 && (
            <a
              href="#pricing"
              className="hidden rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 md:inline-flex"
            >
              Başla
            </a>
          )}

          {nav.length > 0 && (
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-lg md:hidden ${
                dark ? "text-slate-200 hover:bg-slate-900" : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              {open ? (
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>

      {open && nav.length > 0 && (
        <div
          className={`border-t md:hidden ${
            dark ? "border-slate-800 bg-slate-950/95" : "border-slate-200 bg-white/95"
          }`}
        >
          <nav className="flex flex-col gap-1 px-4 py-4" aria-label="Mobil menü">
            {nav.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener" : undefined}
                onClick={() => setOpen(false)}
                className={`rounded-lg px-3 py-2 text-base font-medium ${
                  dark
                    ? "text-slate-200 hover:bg-slate-900"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {item.label}
              </a>
            ))}
            <a
              href="#pricing"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-lg bg-[var(--color-primary)] px-3 py-2 text-center text-base font-semibold text-white shadow-sm transition hover:opacity-90"
            >
              Başla
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
