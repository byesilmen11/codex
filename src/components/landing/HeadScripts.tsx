"use client";

import { useEffect } from "react";

// Yöneticinin "Head kodları" ayarını gerçek <head> içine enjekte eder.
// Meta/link/script gibi karışık HTML güvenle head'e taşınır (React head'i
// yönettiğinden bu içerik istemci tarafında document.head'e eklenir).
export default function HeadScripts({ html }: { html: string }) {
  useEffect(() => {
    if (!html.trim()) return;
    const template = document.createElement("template");
    template.innerHTML = html;

    const appended: Node[] = [];
    // <script> etiketleri innerHTML ile eklendiğinde çalışmaz; yeniden oluştur.
    template.content.childNodes.forEach((node) => {
      if (node.nodeName === "SCRIPT") {
        const orig = node as HTMLScriptElement;
        const script = document.createElement("script");
        for (const attr of Array.from(orig.attributes)) {
          script.setAttribute(attr.name, attr.value);
        }
        script.textContent = orig.textContent;
        document.head.appendChild(script);
        appended.push(script);
      } else {
        const clone = node.cloneNode(true);
        document.head.appendChild(clone);
        appended.push(clone);
      }
    });

    return () => {
      appended.forEach((n) => {
        if (n.parentNode) n.parentNode.removeChild(n);
      });
    };
  }, [html]);

  return null;
}
