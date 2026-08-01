"use client";

// ---------------------------------------------------------------------------
// Bir bölümün içeriğini SECTION_DEFINITIONS[type].fields meta verisinden
// otomatik üretilen formla düzenler. Modal içinde veya sayfada panel olarak
// kullanılabilir.
// ---------------------------------------------------------------------------

import { useState } from "react";
import { api } from "@/lib/client-api";
import { SECTION_DEFINITIONS } from "@/lib/types";
import type { FieldDef, Section } from "@/lib/types";
import {
  Button,
  Input,
  Select,
  Textarea,
  Toggle,
  useToast,
} from "@/components/admin/ui";
import MediaPicker from "@/components/admin/MediaPicker";

type ContentObj = Record<string, unknown>;

function errMsg(err: unknown): string {
  return err instanceof Error ? err.message : "İşlem başarısız";
}

function str(value: unknown): string {
  return typeof value === "string" ? value : value == null ? "" : String(value);
}

function parseInitialContent(section: Section): ContentObj {
  const def = SECTION_DEFINITIONS[section.type];
  let parsed: ContentObj = {};
  try {
    const raw: unknown = JSON.parse(section.content);
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      parsed = raw as ContentObj;
    }
  } catch {
    // bozuk içerik — varsayılanlar kullanılır
  }
  return { ...(def?.defaultContent ?? {}), ...parsed };
}

function emptyListItem(itemFields: FieldDef[]): ContentObj {
  const obj: ContentObj = {};
  for (const f of itemFields) {
    obj[f.key] = f.kind === "boolean" ? false : f.kind === "number" ? 0 : "";
  }
  return obj;
}

// --- Alan sarmalayıcı --------------------------------------------------------

function FieldWrap({
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
      <label className="mb-1 block text-xs font-medium text-slate-600">
        {label}
      </label>
      {children}
      {help && <p className="mt-1 text-xs text-slate-400">{help}</p>}
    </div>
  );
}

// --- Görsel alanı ------------------------------------------------------------

function ImageField({
  value,
  onChange,
}: {
  value: unknown;
  onChange: (v: string) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const url = str(value);
  return (
    <div className="flex items-center gap-2">
      {url && (
        <img
          src={url}
          alt=""
          className="h-9 w-9 shrink-0 rounded border border-slate-200 object-cover"
        />
      )}
      <Input
        value={url}
        placeholder="/uploads/... veya https://..."
        onChange={(e) => onChange(e.target.value)}
      />
      <Button
        variant="secondary"
        size="sm"
        className="shrink-0"
        onClick={() => setPickerOpen(true)}
      >
        Medya Seç
      </Button>
      {url && (
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0"
          onClick={() => onChange("")}
        >
          Kaldır
        </Button>
      )}
      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(u) => onChange(u)}
      />
    </div>
  );
}

// --- Renk alanı --------------------------------------------------------------

function ColorField({
  value,
  onChange,
}: {
  value: unknown;
  onChange: (v: string) => void;
}) {
  const hex = str(value);
  const valid = /^#[0-9a-fA-F]{6}$/.test(hex);
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={valid ? hex : "#000000"}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-12 shrink-0 cursor-pointer rounded-lg border border-slate-200 bg-white p-1"
        aria-label="Renk seç"
      />
      <Input
        value={hex}
        placeholder="#4f46e5"
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

// --- Liste alanı -------------------------------------------------------------

function ListField({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: unknown;
  onChange: (v: ContentObj[]) => void;
}) {
  const items: ContentObj[] = Array.isArray(value)
    ? (value as ContentObj[])
    : [];
  const itemFields = field.itemFields ?? [];
  const itemLabel = field.itemLabel ?? "Öğe";

  function updateItem(index: number, key: string, v: unknown) {
    const next = items.map((it, i) => (i === index ? { ...it, [key]: v } : it));
    onChange(next);
  }

  function addItem() {
    onChange([...items, emptyListItem(itemFields)]);
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function moveItem(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div className="space-y-3">
      {items.length === 0 && (
        <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50/60 px-4 py-3 text-center text-xs text-slate-500">
          Henüz öğe yok. Aşağıdaki butonla ekleyin.
        </p>
      )}
      {items.map((item, i) => (
        <div
          key={i}
          className="rounded-lg border border-slate-200 bg-slate-50/40 p-3"
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">
              {itemLabel} {i + 1}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                aria-label="Yukarı taşı"
                disabled={i === 0}
                onClick={() => moveItem(i, -1)}
              >
                ↑
              </Button>
              <Button
                variant="ghost"
                size="sm"
                aria-label="Aşağı taşı"
                disabled={i === items.length - 1}
                onClick={() => moveItem(i, 1)}
              >
                ↓
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => removeItem(i)}
              >
                Sil
              </Button>
            </div>
          </div>
          <div className="space-y-3">
            {itemFields.map((f) =>
              f.kind === "list" ? null : (
                <FieldWrap key={f.key} label={f.label} help={f.help}>
                  <FieldEditor
                    field={f}
                    value={item[f.key]}
                    onChange={(v) => updateItem(i, f.key, v)}
                  />
                </FieldWrap>
              )
            )}
          </div>
        </div>
      ))}
      <Button variant="secondary" size="sm" onClick={addItem}>
        {itemLabel} Ekle
      </Button>
    </div>
  );
}

// --- Genel alan editörü ------------------------------------------------------

function FieldEditor({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  switch (field.kind) {
    case "text":
    case "url":
      return (
        <Input
          value={str(value)}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "textarea":
      return (
        <Textarea
          rows={3}
          value={str(value)}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "number":
      return (
        <Input
          type="number"
          value={
            value === "" || value === null || value === undefined
              ? ""
              : String(value)
          }
          placeholder={field.placeholder}
          onChange={(e) => {
            const v = e.target.value;
            onChange(v === "" ? "" : Number(v));
          }}
        />
      );
    case "boolean":
      return (
        <Toggle
          checked={Boolean(value)}
          onChange={(c) => onChange(c)}
          label={Boolean(value) ? "Açık" : "Kapalı"}
        />
      );
    case "select":
      return (
        <Select value={str(value)} onChange={(e) => onChange(e.target.value)}>
          {(field.options ?? []).map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      );
    case "color":
      return <ColorField value={value} onChange={onChange} />;
    case "image":
      return <ImageField value={value} onChange={onChange} />;
    case "list":
      return <ListField field={field} value={value} onChange={onChange} />;
    default:
      return null;
  }
}

// --- SectionForm -------------------------------------------------------------

export default function SectionForm({
  section,
  onSaved,
  onClose,
}: {
  section: Section;
  onSaved: (section: Section) => void;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const def = SECTION_DEFINITIONS[section.type];
  const [label, setLabel] = useState(section.label);
  const [content, setContent] = useState<ContentObj>(() =>
    parseInitialContent(section)
  );
  const [saving, setSaving] = useState(false);

  function setValue(key: string, v: unknown) {
    setContent((prev) => ({ ...prev, [key]: v }));
  }

  async function save() {
    setSaving(true);
    try {
      const res = await api.patch<{ section: Section }>(
        `/api/admin/sections/${section.id}`,
        { label, content }
      );
      toast("Bölüm kaydedildi");
      onSaved(res.section);
    } catch (err) {
      toast(errMsg(err), "error");
    } finally {
      setSaving(false);
    }
  }

  if (!def) {
    return (
      <p className="text-sm text-red-600">
        Bilinmeyen bölüm tipi: {section.type}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <FieldWrap
        label="Bölüm etiketi"
        help="Yalnızca yönetim panelinde görünür; içerikte kullanılmaz."
      >
        <Input
          value={label}
          placeholder={def.name}
          onChange={(e) => setLabel(e.target.value)}
        />
      </FieldWrap>

      <div className="border-t border-slate-200 pt-4">
        <div className="space-y-4">
          {def.fields.map((field) => (
            <FieldWrap key={field.key} label={field.label} help={field.help}>
              <FieldEditor
                field={field}
                value={content[field.key]}
                onChange={(v) => setValue(field.key, v)}
              />
            </FieldWrap>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
        <Button variant="secondary" onClick={onClose}>
          Vazgeç
        </Button>
        <Button loading={saving} onClick={() => void save()}>
          Kaydet
        </Button>
      </div>
    </div>
  );
}
