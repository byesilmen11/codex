import type { ComponentType } from "react";
import type { PublicSection } from "@/lib/content";
import Hero from "./sections/Hero";
import Logos from "./sections/Logos";
import Features from "./sections/Features";
import Stats from "./sections/Stats";
import Pricing from "./sections/Pricing";
import Testimonials from "./sections/Testimonials";
import Faq from "./sections/Faq";
import Cta from "./sections/Cta";
import ContentBlock from "./sections/ContentBlock";

export interface SectionComponentProps {
  content: Record<string, unknown>;
  dark: boolean;
}

// type -> bileşen eşlemesi; bilinmeyen tipler sessizce atlanır.
const REGISTRY: Record<string, ComponentType<SectionComponentProps>> = {
  hero: Hero,
  logos: Logos,
  features: Features,
  stats: Stats,
  pricing: Pricing,
  testimonials: Testimonials,
  faq: Faq,
  cta: Cta,
  content: ContentBlock,
};

export default function SectionRenderer({
  sections,
  dark,
}: {
  sections: PublicSection[];
  dark: boolean;
}) {
  return (
    <>
      {sections.map((s) => {
        const Comp = REGISTRY[s.type];
        if (!Comp) return null;
        return (
          <section key={s.id} id={s.type} className="scroll-mt-20">
            <Comp content={s.content} dark={dark} />
          </section>
        );
      })}
    </>
  );
}
