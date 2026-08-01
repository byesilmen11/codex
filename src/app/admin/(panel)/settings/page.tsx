"use client";

// ---------------------------------------------------------------------------
// Site Ayarları — sekmeli ayar formu (Site / SEO / Marka / Sosyal / Kodlar).
// ---------------------------------------------------------------------------

import React, { useEffect, useState } from "react";
import { api } from "@/lib/client-api";
import { AllSettings } from "@/lib/types";
import {
  Button,
  Card,
  Input,
  PageHeader,
  Select,
  Spinner,
  Textarea,
  Toggle,
  useToast,
} from "@/components/admin/ui";

type TabKey = "site" | "seo" | "branding" | "social" | "scripts";

const TABS: { key: TabKey; label: string }[] = [
  { key: "site", label: "Site" },
  { key: "seo", label: "SEO" },
  { key: "branding", label: "Marka" },
  { key: "social", label: "Sosyal Medya" },
  { key: "scripts", label: "Özel Kodlar" },
];

const errMsg = (e: unknown) =>
  e instanceof Error ? e.message : "İşlem başarısız";

function Field({
  label,
  help,
  children,
}: {
  label: string;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </span>
      {children}
      {help && <p className="mt-1 text-xs text-slate-500">{help}</p>}
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const safe = /^#[0-9a-fA-F]{6}$/.test(value) ? value : "#000000";
  return (
    <Field label={label}>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={safe}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
          className="h-9 w-12 shrink-0 cursor-pointer rounded-lg border border-slate-200 bg-white p-1"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#4f46e5"
          className="max-w-[160px] font-mono"
        />
      </div>
    </Field>
  );
}

export default function SettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<AllSettings | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>("site");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get<{ settings: AllSettings }>("/api/admin/settings")
      .then((res) => setSettings(res.settings))
      .catch((e) => setLoadError(errMsg(e)));
  }, []);

  const update = <K extends keyof AllSettings>(
    group: K,
    patch: Partial<AllSettings[K]>
  ) => {
    setSettings((s) =>
      s ? ({ ...s, [group]: { ...s[group], ...patch } } as AllSettings) : s
    );
  };

  async function save() {
    if (!settings) return;
    setSaving(true);
    try {
      const res = await api.put<{ settings: AllSettings }>(
        "/api/admin/settings",
        settings
      );
      setSettings(res.settings);
      toast("Ayarlar kaydedildi");
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setSaving(false);
    }
  }

  if (loadError) {
    return (
      <div>
        <PageHeader title="Site Ayarları" />
        <Card>
          <p className="text-sm text-red-600">{loadError}</p>
        </Card>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex justify-center py-20 text-slate-400">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Site Ayarları"
        description="Sitenin genel görünümünü, SEO bilgilerini ve entegrasyon kodlarını yönetin."
        actions={
          <Button onClick={save} loading={saving}>
            Kaydet
          </Button>
        }
      />

      <div className="mb-6 inline-flex flex-wrap gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors " +
              (tab === t.key
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900")
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "site" && (
        <Card title="Site Bilgileri">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Site başlığı">
              <Input
                value={settings.site.title}
                onChange={(e) => update("site", { title: e.target.value })}
              />
            </Field>
            <Field label="Slogan (tagline)">
              <Input
                value={settings.site.tagline}
                onChange={(e) => update("site", { tagline: e.target.value })}
              />
            </Field>
            <div className="md:col-span-2">
              <Field label="Site açıklaması">
                <Textarea
                  rows={3}
                  value={settings.site.description}
                  onChange={(e) =>
                    update("site", { description: e.target.value })
                  }
                />
              </Field>
            </div>
            <Field label="Logo metni">
              <Input
                value={settings.site.logoText}
                onChange={(e) => update("site", { logoText: e.target.value })}
              />
            </Field>
            <Field
              label="Logo görseli"
              help="Boş bırakılırsa logo metni gösterilir. Örn: /uploads/logo.png"
            >
              <Input
                value={settings.site.logoImage}
                onChange={(e) => update("site", { logoImage: e.target.value })}
                placeholder="/uploads/logo.png"
              />
            </Field>
            <Field label="Favicon">
              <Input
                value={settings.site.favicon}
                onChange={(e) => update("site", { favicon: e.target.value })}
                placeholder="/uploads/favicon.ico"
              />
            </Field>
            <Field label="İletişim e-postası">
              <Input
                type="email"
                value={settings.site.contactEmail}
                onChange={(e) =>
                  update("site", { contactEmail: e.target.value })
                }
              />
            </Field>
            <div className="md:col-span-2">
              <Field
                label="Alt bilgi (footer) metni"
                help={
                  "İpucu: metin içindeki {year} ifadesi otomatik olarak güncel yıla dönüştürülür."
                }
              >
                <Input
                  value={settings.site.footerText}
                  onChange={(e) =>
                    update("site", { footerText: e.target.value })
                  }
                />
              </Field>
            </div>
            <div className="md:col-span-2 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <div className="mb-3">
                <Toggle
                  checked={settings.site.maintenanceMode}
                  onChange={(v) => update("site", { maintenanceMode: v })}
                  label="Bakım modu"
                />
              </div>
              <Field
                label="Bakım mesajı"
                help="Bakım modu açıkken ziyaretçilere gösterilecek mesaj."
              >
                <Textarea
                  rows={2}
                  value={settings.site.maintenanceMessage}
                  onChange={(e) =>
                    update("site", { maintenanceMessage: e.target.value })
                  }
                />
              </Field>
            </div>
          </div>
        </Card>
      )}

      {tab === "seo" && (
        <Card title="SEO Ayarları">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <Field label="Meta başlık">
                <Input
                  value={settings.seo.metaTitle}
                  onChange={(e) => update("seo", { metaTitle: e.target.value })}
                />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="Meta açıklama">
                <Textarea
                  rows={3}
                  value={settings.seo.metaDescription}
                  onChange={(e) =>
                    update("seo", { metaDescription: e.target.value })
                  }
                />
              </Field>
            </div>
            <Field
              label="Anahtar kelimeler"
              help="Virgülle ayırarak yazın."
            >
              <Input
                value={settings.seo.keywords}
                onChange={(e) => update("seo", { keywords: e.target.value })}
              />
            </Field>
            <Field label="Open Graph görseli (og:image)">
              <Input
                value={settings.seo.ogImage}
                onChange={(e) => update("seo", { ogImage: e.target.value })}
                placeholder="/uploads/og.png"
              />
            </Field>
            <Field label="Canonical URL">
              <Input
                value={settings.seo.canonicalUrl}
                onChange={(e) =>
                  update("seo", { canonicalUrl: e.target.value })
                }
                placeholder="https://siteniz.com"
              />
            </Field>
            <div className="flex items-end pb-2">
              <Toggle
                checked={settings.seo.robotsIndex}
                onChange={(v) => update("seo", { robotsIndex: v })}
                label="Arama motorları siteyi indekslesin"
              />
            </div>
          </div>
        </Card>
      )}

      {tab === "branding" && (
        <Card title="Marka Ayarları">
          <div className="grid gap-5 md:grid-cols-2">
            <ColorField
              label="Ana renk (primary)"
              value={settings.branding.primaryColor}
              onChange={(v) => update("branding", { primaryColor: v })}
            />
            <ColorField
              label="Vurgu rengi (accent)"
              value={settings.branding.accentColor}
              onChange={(v) => update("branding", { accentColor: v })}
            />
            <Field label="Arka plan stili">
              <Select
                value={settings.branding.backgroundStyle}
                onChange={(e) =>
                  update("branding", {
                    backgroundStyle: e.target.value as "light" | "dark",
                  })
                }
              >
                <option value="light">Açık</option>
                <option value="dark">Koyu</option>
              </Select>
            </Field>
            <div className="flex items-end gap-3 pb-1">
              <span className="text-sm text-slate-500">Önizleme:</span>
              <span
                className="inline-block h-8 w-8 rounded-full border border-slate-200"
                style={{ backgroundColor: settings.branding.primaryColor }}
                title="Ana renk"
              />
              <span
                className="inline-block h-8 w-8 rounded-full border border-slate-200"
                style={{ backgroundColor: settings.branding.accentColor }}
                title="Vurgu rengi"
              />
            </div>
          </div>
        </Card>
      )}

      {tab === "social" && (
        <Card title="Sosyal Medya Bağlantıları">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Twitter / X">
              <Input
                value={settings.social.twitter}
                onChange={(e) => update("social", { twitter: e.target.value })}
                placeholder="https://x.com/hesabiniz"
              />
            </Field>
            <Field label="LinkedIn">
              <Input
                value={settings.social.linkedin}
                onChange={(e) => update("social", { linkedin: e.target.value })}
                placeholder="https://linkedin.com/company/hesabiniz"
              />
            </Field>
            <Field label="Instagram">
              <Input
                value={settings.social.instagram}
                onChange={(e) =>
                  update("social", { instagram: e.target.value })
                }
                placeholder="https://instagram.com/hesabiniz"
              />
            </Field>
            <Field label="GitHub">
              <Input
                value={settings.social.github}
                onChange={(e) => update("social", { github: e.target.value })}
                placeholder="https://github.com/hesabiniz"
              />
            </Field>
            <Field label="YouTube">
              <Input
                value={settings.social.youtube}
                onChange={(e) => update("social", { youtube: e.target.value })}
                placeholder="https://youtube.com/@hesabiniz"
              />
            </Field>
          </div>
        </Card>
      )}

      {tab === "scripts" && (
        <Card title="Özel Kodlar">
          <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Buraya eklenen HTML/script kodları sitenin head/body kısmına aynen
            eklenir. Yalnızca güvendiğiniz kodları ekleyin.
          </div>
          <div className="grid gap-5">
            <Field
              label="Head kodları"
              help="&lt;head&gt; etiketi içine eklenir (analitik, meta vb.)."
            >
              <Textarea
                rows={6}
                className="font-mono text-xs"
                value={settings.scripts.headScripts}
                onChange={(e) =>
                  update("scripts", { headScripts: e.target.value })
                }
                placeholder={'<script>/* örn. analytics */</script>'}
              />
            </Field>
            <Field
              label="Body kodları"
              help="&lt;body&gt; kapanışından hemen önce eklenir (chat widget vb.)."
            >
              <Textarea
                rows={6}
                className="font-mono text-xs"
                value={settings.scripts.bodyScripts}
                onChange={(e) =>
                  update("scripts", { bodyScripts: e.target.value })
                }
                placeholder={'<script>/* örn. canlı destek */</script>'}
              />
            </Field>
          </div>
        </Card>
      )}
    </div>
  );
}
