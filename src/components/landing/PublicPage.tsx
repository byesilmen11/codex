import type { CSSProperties } from "react";
import type { PublicContent } from "@/lib/content";
import Navbar from "@/components/landing/Navbar";
import SectionRenderer from "@/components/landing/SectionRenderer";
import Footer from "@/components/landing/Footer";
import HeadScripts from "@/components/landing/HeadScripts";

// Hem ana sayfa (/) hem de dinamik sayfalar (/[slug]) için ortak landing
// render'ı. Marka renklerini CSS değişkeni olarak basar, bakım modunu ele alır,
// head/body özel kodlarını enjekte eder.
export default function PublicPage({ data }: { data: PublicContent }) {
  const { settings, sections, navigation } = data;
  const { site, branding, scripts } = settings;
  const dark = branding.backgroundStyle === "dark";

  const cssVars = {
    "--color-primary": branding.primaryColor,
    "--color-accent": branding.accentColor,
  } as CSSProperties;

  if (site.maintenanceMode) {
    return (
      <main
        style={cssVars}
        className={`flex min-h-screen items-center justify-center px-4 ${
          dark ? "bg-slate-950" : "bg-slate-50"
        }`}
      >
        <div
          className={`w-full max-w-md rounded-2xl border p-10 text-center shadow-sm ${
            dark
              ? "border-slate-800 bg-slate-900 text-white"
              : "border-slate-200 bg-white text-slate-900"
          }`}
        >
          <span
            aria-hidden
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-2xl"
          >
            🔧
          </span>
          <h1 className="mt-6 text-2xl font-bold tracking-tight">{site.title}</h1>
          <p className={`mt-3 leading-7 ${dark ? "text-slate-300" : "text-slate-600"}`}>
            {site.maintenanceMessage || "Kısa bir bakım çalışması yapıyoruz. Birazdan buradayız."}
          </p>
        </div>
      </main>
    );
  }

  return (
    <div
      style={cssVars}
      className={
        dark
          ? "min-h-screen bg-slate-950 text-white"
          : "min-h-screen bg-white text-slate-900"
      }
    >
      {scripts.headScripts ? <HeadScripts html={scripts.headScripts} /> : null}

      <Navbar settings={settings} nav={navigation.header} dark={dark} />

      <main>
        <SectionRenderer sections={sections} dark={dark} />
      </main>

      <Footer settings={settings} nav={navigation.footer} />

      {scripts.bodyScripts ? (
        <div dangerouslySetInnerHTML={{ __html: scripts.bodyScripts }} />
      ) : null}
    </div>
  );
}

export function SitePreparing() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="text-center">
        <p className="text-5xl" aria-hidden>
          🚧
        </p>
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">
          Site hazırlanıyor
        </h1>
        <p className="mt-3 text-slate-600">
          İçerik henüz yayınlanmadı. Lütfen daha sonra tekrar uğrayın.
        </p>
      </div>
    </main>
  );
}
