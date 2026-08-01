const str = (v: unknown): string => (typeof v === "string" ? v : "");

const asList = (v: unknown): Record<string, unknown>[] =>
  Array.isArray(v)
    ? v.filter(
        (x): x is Record<string, unknown> => typeof x === "object" && x !== null
      )
    : [];

export default function Testimonials({
  content,
  dark,
}: {
  content: Record<string, unknown>;
  dark: boolean;
}) {
  const eyebrow = str(content.eyebrow);
  const title = str(content.title);
  const items = asList(content.items).filter((item) => str(item.quote));

  if (items.length === 0) return null;

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
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          {items.map((item, i) => {
            const quote = str(item.quote);
            const name = str(item.name);
            const role = str(item.role);
            const avatar = str(item.avatar);
            const initial = name.trim().charAt(0).toUpperCase();

            return (
              <figure
                key={i}
                className={`flex flex-col rounded-2xl border p-8 ${
                  dark ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"
                }`}
              >
                <span
                  aria-hidden
                  className="text-4xl leading-none text-[var(--color-primary)]"
                >
                  &ldquo;
                </span>
                <blockquote
                  className={`mt-2 flex-1 leading-7 ${
                    dark ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  {quote}
                </blockquote>
                {(name || role || avatar) && (
                  <figcaption className="mt-6 flex items-center gap-3">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt={name || "Avatar"}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : initial ? (
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary)] text-sm font-semibold text-white">
                        {initial}
                      </span>
                    ) : null}
                    <div>
                      {name && (
                        <p
                          className={`text-sm font-semibold ${
                            dark ? "text-white" : "text-slate-900"
                          }`}
                        >
                          {name}
                        </p>
                      )}
                      {role && (
                        <p className={`text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>
                          {role}
                        </p>
                      )}
                    </div>
                  </figcaption>
                )}
              </figure>
            );
          })}
        </div>
      </div>
    </div>
  );
}
