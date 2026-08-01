"use client";

import { useState } from "react";

const str = (v: unknown): string => (typeof v === "string" ? v : "");

const asList = (v: unknown): Record<string, unknown>[] =>
  Array.isArray(v)
    ? v.filter(
        (x): x is Record<string, unknown> => typeof x === "object" && x !== null
      )
    : [];

export default function Faq({
  content,
  dark,
}: {
  content: Record<string, unknown>;
  dark: boolean;
}) {
  const [openItems, setOpenItems] = useState<Record<number, boolean>>({});

  const eyebrow = str(content.eyebrow);
  const title = str(content.title);
  const items = asList(content.items).filter((item) => str(item.question));

  if (items.length === 0) return null;

  const toggle = (i: number) =>
    setOpenItems((prev) => ({ ...prev, [i]: !prev[i] }));

  return (
    <div className="py-24">
      <div className="mx-auto max-w-3xl px-4">
        <div className="text-center">
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

        <div
          className={`mt-12 divide-y border-y ${
            dark ? "divide-slate-800 border-slate-800" : "divide-slate-200 border-slate-200"
          }`}
        >
          {items.map((item, i) => {
            const question = str(item.question);
            const answer = str(item.answer);
            const isOpen = !!openItems[i];

            return (
              <div key={i}>
                <button
                  type="button"
                  onClick={() => toggle(i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                >
                  <span
                    className={`font-medium ${dark ? "text-white" : "text-slate-900"}`}
                  >
                    {question}
                  </span>
                  <span
                    aria-hidden
                    className="text-xl font-semibold text-[var(--color-primary)]"
                  >
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                {isOpen && answer && (
                  <p
                    className={`whitespace-pre-line pb-5 leading-7 ${
                      dark ? "text-slate-300" : "text-slate-600"
                    }`}
                  >
                    {answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
