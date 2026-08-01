const str = (v: unknown): string => (typeof v === "string" ? v : "");

const asList = (v: unknown): Record<string, unknown>[] =>
  Array.isArray(v)
    ? v.filter(
        (x): x is Record<string, unknown> => typeof x === "object" && x !== null
      )
    : [];

export default function Features({
  content,
  dark,
}: {
  content: Record<string, unknown>;
  dark: boolean;
}) {
  const eyebrow = str(content.eyebrow);
  const title = str(content.title);
  const subtitle = str(content.subtitle);
  const items = asList(content.items);

  if (!title && items.length === 0) return null;

  return (
    <div className="py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          {eyebrow && (
            <p className="text-sm font-semibold uppercase tracking-wider text-[var(--color-primary)]">
              {eyebrow}
            </p>
          )}
          {title && (
            <h2
              className={`mt-2 text-3xl font-bold tracking-tight sm:text-4xl ${
                dark ? "text-white" : "text-slate-900"
              }`}
            >
              {title}
            </h2>
          )}
          {subtitle && (
            <p className={`mt-4 text-lg leading-8 ${dark ? "text-slate-300" : "text-slate-600"}`}>
              {subtitle}
            </p>
          )}
        </div>

        {items.length > 0 && (
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => {
              const icon = str(item.icon);
              const itemTitle = str(item.title);
              const description = str(item.description);
              if (!itemTitle && !description) return null;
              return (
                <div
                  key={i}
                  className={`rounded-2xl border p-8 transition hover:shadow-md ${
                    dark
                      ? "border-slate-800 bg-slate-900"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  {icon && (
                    <span className="text-4xl" aria-hidden>
                      {icon}
                    </span>
                  )}
                  {itemTitle && (
                    <h3
                      className={`mt-4 text-lg font-semibold ${
                        dark ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {itemTitle}
                    </h3>
                  )}
                  {description && (
                    <p
                      className={`mt-2 leading-7 ${
                        dark ? "text-slate-300" : "text-slate-600"
                      }`}
                    >
                      {description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
