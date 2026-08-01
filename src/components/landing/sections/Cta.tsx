const str = (v: unknown): string => (typeof v === "string" ? v : "");

export default function Cta({
  content,
}: {
  content: Record<string, unknown>;
  dark: boolean;
}) {
  const title = str(content.title);
  const subtitle = str(content.subtitle);
  const ctaText = str(content.ctaText);
  const ctaUrl = str(content.ctaUrl);
  const note = str(content.note);

  if (!title && !ctaText) return null;

  return (
    <div className="py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="rounded-3xl bg-[var(--color-primary)] px-6 py-16 text-center shadow-lg sm:px-16">
          {title && (
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-white/85">
              {subtitle}
            </p>
          )}
          {ctaText && (
            <a
              href={ctaUrl || "#"}
              className="mt-8 inline-flex rounded-xl bg-white px-6 py-3 text-base font-semibold text-[var(--color-primary)] shadow-sm transition hover:bg-white/90"
            >
              {ctaText}
            </a>
          )}
          {note && <p className="mt-4 text-sm text-white/70">{note}</p>}
        </div>
      </div>
    </div>
  );
}
