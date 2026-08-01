const str = (v: unknown): string => (typeof v === "string" ? v : "");

const asList = (v: unknown): Record<string, unknown>[] =>
  Array.isArray(v)
    ? v.filter(
        (x): x is Record<string, unknown> => typeof x === "object" && x !== null
      )
    : [];

export default function Pricing({
  content,
  dark,
}: {
  content: Record<string, unknown>;
  dark: boolean;
}) {
  const eyebrow = str(content.eyebrow);
  const title = str(content.title);
  const subtitle = str(content.subtitle);
  const plans = asList(content.plans);

  if (plans.length === 0 && !title) return null;

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

        {plans.length > 0 && (
          <div className="mt-16 grid grid-cols-1 items-stretch gap-8 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan, i) => {
              const name = str(plan.name);
              const price = str(plan.price);
              const period = str(plan.period);
              const description = str(plan.description);
              const features = str(plan.features)
                .split("\n")
                .map((l) => l.trim())
                .filter(Boolean);
              const ctaText = str(plan.ctaText);
              const ctaUrl = str(plan.ctaUrl);
              const highlighted = plan.highlighted === true;

              if (!name && !price) return null;

              return (
                <div
                  key={i}
                  className={`relative flex flex-col rounded-2xl p-8 ${
                    highlighted
                      ? `z-10 border-2 border-[var(--color-primary)] shadow-xl lg:scale-105 ${
                          dark ? "bg-slate-900" : "bg-white"
                        }`
                      : `border ${
                          dark
                            ? "border-slate-800 bg-slate-900"
                            : "border-slate-200 bg-white"
                        }`
                  }`}
                >
                  {highlighted && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[var(--color-primary)] px-4 py-1 text-xs font-semibold text-white">
                      En Popüler
                    </span>
                  )}

                  {name && (
                    <h3
                      className={`text-lg font-semibold ${
                        dark ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {name}
                    </h3>
                  )}

                  {(price || period) && (
                    <p className="mt-4 flex items-baseline gap-1">
                      <span
                        className={`text-4xl font-extrabold tracking-tight ${
                          dark ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {price}
                      </span>
                      {period && (
                        <span className={dark ? "text-slate-400" : "text-slate-500"}>
                          {period}
                        </span>
                      )}
                    </p>
                  )}

                  {description && (
                    <p
                      className={`mt-3 text-sm leading-6 ${
                        dark ? "text-slate-300" : "text-slate-600"
                      }`}
                    >
                      {description}
                    </p>
                  )}

                  {features.length > 0 && (
                    <ul className="mt-6 flex-1 space-y-3">
                      {features.map((feature, fi) => (
                        <li key={fi} className="flex items-start gap-3">
                          <svg
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="mt-0.5 h-5 w-5 flex-none text-[var(--color-accent)]"
                            aria-hidden
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span
                            className={`text-sm leading-6 ${
                              dark ? "text-slate-300" : "text-slate-600"
                            }`}
                          >
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {ctaText && (
                    <a
                      href={ctaUrl || "#"}
                      className={`mt-8 block rounded-xl px-4 py-2.5 text-center text-sm font-semibold transition ${
                        highlighted
                          ? "bg-[var(--color-primary)] text-white shadow-sm hover:opacity-90"
                          : "border border-[var(--color-primary)]/40 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5"
                      }`}
                    >
                      {ctaText}
                    </a>
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
