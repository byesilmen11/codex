const str = (v: unknown): string => (typeof v === "string" ? v : "");

export default function ContentBlock({
  content,
  dark,
}: {
  content: Record<string, unknown>;
  dark: boolean;
}) {
  const title = str(content.title);
  const body = str(content.body);
  const image = str(content.image);
  const align = str(content.align) === "center" ? "center" : "left";

  if (!title && !body && !image) return null;

  const headingClass = `text-3xl font-bold tracking-tight sm:text-4xl ${
    dark ? "text-white" : "text-slate-900"
  }`;
  const bodyClass = `mt-6 whitespace-pre-line text-lg leading-8 ${
    dark ? "text-slate-300" : "text-slate-600"
  }`;
  const imageClass = `w-full rounded-2xl border shadow-lg ${
    dark ? "border-slate-800" : "border-slate-200"
  }`;

  if (align === "center") {
    return (
      <div className="py-24">
        <div className="mx-auto max-w-3xl px-4 text-center">
          {title && <h2 className={headingClass}>{title}</h2>}
          {body && <p className={bodyClass}>{body}</p>}
          {image && (
            <img
              src={image}
              alt={title || "İçerik görseli"}
              className={`mt-10 ${imageClass}`}
            />
          )}
        </div>
      </div>
    );
  }

  if (image) {
    return (
      <div className="py-24">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 md:grid-cols-2">
          <div>
            {title && <h2 className={headingClass}>{title}</h2>}
            {body && <p className={bodyClass}>{body}</p>}
          </div>
          <img src={image} alt={title || "İçerik görseli"} className={imageClass} />
        </div>
      </div>
    );
  }

  return (
    <div className="py-24">
      <div className="mx-auto max-w-3xl px-4">
        {title && <h2 className={headingClass}>{title}</h2>}
        {body && <p className={bodyClass}>{body}</p>}
      </div>
    </div>
  );
}
