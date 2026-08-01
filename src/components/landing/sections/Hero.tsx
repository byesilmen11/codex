import type { ReactNode } from "react";

const str = (v: unknown): string => (typeof v === "string" ? v : "");

function renderTitle(title: string, highlight: string): ReactNode {
  if (!highlight || !title.includes(highlight)) return title;
  const i = title.indexOf(highlight);
  return (
    <>
      {title.slice(0, i)}
      <span className="text-[var(--color-primary)]">{highlight}</span>
      {title.slice(i + highlight.length)}
    </>
  );
}

export default function Hero({
  content,
  dark,
}: {
  content: Record<string, unknown>;
  dark: boolean;
}) {
  const badge = str(content.badge);
  const title = str(content.title);
  const highlight = str(content.highlight);
  const subtitle = str(content.subtitle);
  const primaryCtaText = str(content.primaryCtaText);
  const primaryCtaUrl = str(content.primaryCtaUrl);
  const secondaryCtaText = str(content.secondaryCtaText);
  const secondaryCtaUrl = str(content.secondaryCtaUrl);
  const image = str(content.image);
  const note = str(content.note);

  if (!title && !subtitle) return null;

  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(52rem 26rem at 50% 0%, color-mix(in srgb, var(--color-primary) 10%, transparent), transparent)",
        }}
      />
      <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-24 text-center sm:pt-32">
        {badge && (
          <span className="inline-flex items-center rounded-full border border-[var(--color-primary)]/25 bg-[var(--color-primary)]/5 px-4 py-1.5 text-sm font-medium text-[var(--color-primary)]">
            {badge}
          </span>
        )}

        {title && (
          <h1
            className={`mx-auto mt-6 max-w-4xl text-4xl font-extrabold tracking-tight sm:text-6xl ${
              dark ? "text-white" : "text-slate-900"
            }`}
          >
            {renderTitle(title, highlight)}
          </h1>
        )}

        {subtitle && (
          <p
            className={`mx-auto mt-6 max-w-2xl text-lg leading-8 ${
              dark ? "text-slate-300" : "text-slate-600"
            }`}
          >
            {subtitle}
          </p>
        )}

        {(primaryCtaUrl && primaryCtaText) || (secondaryCtaUrl && secondaryCtaText) ? (
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            {primaryCtaUrl && primaryCtaText && (
              <a
                href={primaryCtaUrl}
                className="rounded-xl bg-[var(--color-primary)] px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:opacity-90"
              >
                {primaryCtaText}
              </a>
            )}
            {secondaryCtaUrl && secondaryCtaText && (
              <a
                href={secondaryCtaUrl}
                className={`rounded-xl border px-6 py-3 text-base font-semibold transition ${
                  dark
                    ? "border-slate-700 text-white hover:bg-slate-900"
                    : "border-slate-300 text-slate-900 hover:bg-slate-50"
                }`}
              >
                {secondaryCtaText}
              </a>
            )}
          </div>
        ) : null}

        {note && (
          <p className={`mt-5 text-sm ${dark ? "text-slate-400" : "text-slate-500"}`}>
            {note}
          </p>
        )}

        {image && (
          <div
            className={`mx-auto mt-16 max-w-5xl overflow-hidden rounded-2xl border shadow-2xl ${
              dark ? "border-slate-800" : "border-slate-200"
            }`}
          >
            <img src={image} alt={title || "Tanıtım görseli"} className="w-full" />
          </div>
        )}
      </div>
    </div>
  );
}
