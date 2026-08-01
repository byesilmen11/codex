const str = (v: unknown): string => (typeof v === "string" ? v : "");

const asList = (v: unknown): Record<string, unknown>[] =>
  Array.isArray(v)
    ? v.filter(
        (x): x is Record<string, unknown> => typeof x === "object" && x !== null
      )
    : [];

export default function Stats({
  content,
}: {
  content: Record<string, unknown>;
  dark: boolean;
}) {
  const items = asList(content.items).filter(
    (item) => str(item.value) || str(item.label)
  );

  if (items.length === 0) return null;

  return (
    <div className="bg-[var(--color-primary)] py-16">
      <div className="mx-auto flex max-w-7xl flex-wrap items-start justify-center gap-x-16 gap-y-10 px-4">
        {items.map((item, i) => (
          <div key={i} className="text-center">
            <p className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              {str(item.value)}
            </p>
            {str(item.label) && (
              <p className="mt-2 text-sm font-medium text-white/80">
                {str(item.label)}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
