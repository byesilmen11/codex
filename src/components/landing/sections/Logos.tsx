const str = (v: unknown): string => (typeof v === "string" ? v : "");

const asList = (v: unknown): Record<string, unknown>[] =>
  Array.isArray(v)
    ? v.filter(
        (x): x is Record<string, unknown> => typeof x === "object" && x !== null
      )
    : [];

export default function Logos({
  content,
  dark,
}: {
  content: Record<string, unknown>;
  dark: boolean;
}) {
  const title = str(content.title);
  const items = asList(content.items);

  if (items.length === 0) return null;

  return (
    <div className="py-16">
      <div className="mx-auto max-w-7xl px-4">
        {title && (
          <p
            className={`text-center text-sm font-medium uppercase tracking-wider ${
              dark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            {title}
          </p>
        )}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
          {items.map((item, i) => {
            const name = str(item.name);
            const image = str(item.image);
            if (image) {
              return (
                <img
                  key={i}
                  src={image}
                  alt={name || "Logo"}
                  className="h-8 w-auto opacity-70 grayscale"
                />
              );
            }
            if (name) {
              return (
                <span
                  key={i}
                  className={`text-xl font-semibold ${
                    dark ? "text-slate-500" : "text-slate-400"
                  }`}
                >
                  {name}
                </span>
              );
            }
            return null;
          })}
        </div>
      </div>
    </div>
  );
}
