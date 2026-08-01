"use client";

// ---------------------------------------------------------------------------
// Özellik Bayrakları — uygulama tarafının /api/v1/flags üzerinden okuduğu
// feature flag'lerin yönetimi.
// ---------------------------------------------------------------------------

import React, { useEffect, useState } from "react";
import { api } from "@/lib/client-api";
import { FeatureFlag } from "@/lib/types";
import {
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  Input,
  Modal,
  PageHeader,
  Spinner,
  Textarea,
  Toggle,
  useToast,
} from "@/components/admin/ui";

const errMsg = (e: unknown) =>
  e instanceof Error ? e.message : "İşlem başarısız";

function prettyJson(raw: string): string {
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
}

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

interface CreateForm {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  value: string;
}

const EMPTY_CREATE: CreateForm = {
  key: "",
  name: "",
  description: "",
  enabled: false,
  value: "{}",
};

interface EditForm {
  key: string;
  name: string;
  description: string;
}

export default function FlagsPage() {
  const { toast } = useToast();
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateForm>(EMPTY_CREATE);
  const [creating, setCreating] = useState(false);

  const [editFlag, setEditFlag] = useState<FeatureFlag | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    key: "",
    name: "",
    description: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);

  const [valueFlag, setValueFlag] = useState<FeatureFlag | null>(null);
  const [valueText, setValueText] = useState("{}");
  const [savingValue, setSavingValue] = useState(false);

  const [deleteFlag, setDeleteFlag] = useState<FeatureFlag | null>(null);

  useEffect(() => {
    api
      .get<{ flags: FeatureFlag[] }>("/api/admin/flags")
      .then((res) => setFlags(res.flags))
      .catch((e) => setLoadError(errMsg(e)))
      .finally(() => setLoading(false));
  }, []);

  async function toggleEnabled(flag: FeatureFlag, enabled: boolean) {
    setFlags((prev) =>
      prev.map((f) => (f.id === flag.id ? { ...f, enabled: enabled ? 1 : 0 } : f))
    );
    try {
      const res = await api.patch<{ flag: FeatureFlag }>(
        `/api/admin/flags/${flag.id}`,
        { enabled }
      );
      setFlags((prev) => prev.map((f) => (f.id === flag.id ? res.flag : f)));
      toast(enabled ? "Bayrak açıldı" : "Bayrak kapatıldı");
    } catch (e) {
      setFlags((prev) => prev.map((f) => (f.id === flag.id ? flag : f)));
      toast(errMsg(e), "error");
    }
  }

  async function submitCreate() {
    if (!createForm.key.trim() || !createForm.name.trim()) {
      toast("Anahtar (key) ve ad alanları zorunludur", "error");
      return;
    }
    let parsedValue: unknown;
    try {
      parsedValue = JSON.parse(createForm.value.trim() || "{}");
    } catch {
      toast("Değer alanı geçerli bir JSON değil", "error");
      return;
    }
    setCreating(true);
    try {
      const res = await api.post<{ flag: FeatureFlag }>("/api/admin/flags", {
        key: createForm.key.trim(),
        name: createForm.name.trim(),
        description: createForm.description,
        enabled: createForm.enabled,
        value: parsedValue,
      });
      setFlags((prev) =>
        [...prev, res.flag].sort((a, b) => a.key.localeCompare(b.key))
      );
      setCreateOpen(false);
      setCreateForm(EMPTY_CREATE);
      toast("Bayrak oluşturuldu");
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setCreating(false);
    }
  }

  function openEdit(flag: FeatureFlag) {
    setEditFlag(flag);
    setEditForm({
      key: flag.key,
      name: flag.name,
      description: flag.description,
    });
  }

  async function submitEdit() {
    if (!editFlag) return;
    if (!editForm.key.trim() || !editForm.name.trim()) {
      toast("Anahtar (key) ve ad alanları zorunludur", "error");
      return;
    }
    setSavingEdit(true);
    try {
      const res = await api.patch<{ flag: FeatureFlag }>(
        `/api/admin/flags/${editFlag.id}`,
        {
          key: editForm.key.trim(),
          name: editForm.name.trim(),
          description: editForm.description,
        }
      );
      setFlags((prev) =>
        prev.map((f) => (f.id === editFlag.id ? res.flag : f))
      );
      setEditFlag(null);
      toast("Bayrak güncellendi");
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setSavingEdit(false);
    }
  }

  function openValue(flag: FeatureFlag) {
    setValueFlag(flag);
    setValueText(prettyJson(flag.value));
  }

  async function submitValue() {
    if (!valueFlag) return;
    let parsed: unknown;
    try {
      parsed = JSON.parse(valueText.trim() || "{}");
    } catch {
      toast("Geçersiz JSON — kaydetmeden önce düzeltin", "error");
      return;
    }
    setSavingValue(true);
    try {
      const res = await api.patch<{ flag: FeatureFlag }>(
        `/api/admin/flags/${valueFlag.id}`,
        { value: parsed }
      );
      setFlags((prev) =>
        prev.map((f) => (f.id === valueFlag.id ? res.flag : f))
      );
      setValueFlag(null);
      toast("Değer kaydedildi");
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setSavingValue(false);
    }
  }

  async function confirmDelete() {
    if (!deleteFlag) return;
    const target = deleteFlag;
    try {
      await api.del(`/api/admin/flags/${target.id}`);
      setFlags((prev) => prev.filter((f) => f.id !== target.id));
      toast("Bayrak silindi");
    } catch (e) {
      toast(errMsg(e), "error");
    }
  }

  return (
    <div>
      <PageHeader
        title="Özellik Bayrakları"
        description="Bu bayraklar /api/v1/flags ucundan uygulamanız tarafından okunur."
        actions={
          <Button onClick={() => setCreateOpen(true)}>Yeni Bayrak</Button>
        }
      />

      {loading ? (
        <div className="flex justify-center py-20 text-slate-400">
          <Spinner className="h-8 w-8" />
        </div>
      ) : loadError ? (
        <Card>
          <p className="text-sm text-red-600">{loadError}</p>
        </Card>
      ) : flags.length === 0 ? (
        <EmptyState
          title="Henüz bayrak yok"
          description="Uygulamanızda açıp kapatmak istediğiniz özellikler için bayrak oluşturun."
          action={
            <Button onClick={() => setCreateOpen(true)}>Yeni Bayrak</Button>
          }
        />
      ) : (
        <div className="grid gap-3">
          {flags.map((flag) => (
            <Card key={flag.id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-800">
                      {flag.key}
                    </code>
                    <span className="text-sm font-semibold text-slate-900">
                      {flag.name}
                    </span>
                  </div>
                  {flag.description && (
                    <p className="mt-1 text-sm text-slate-500">
                      {flag.description}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <Toggle
                    checked={!!flag.enabled}
                    onChange={(v) => toggleEnabled(flag, v)}
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => openValue(flag)}
                  >
                    Değer (JSON)
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => openEdit(flag)}
                  >
                    Düzenle
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setDeleteFlag(flag)}
                  >
                    Sil
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Yeni bayrak */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Yeni Bayrak"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>
              Vazgeç
            </Button>
            <Button onClick={submitCreate} loading={creating}>
              Oluştur
            </Button>
          </>
        }
      >
        <div className="grid gap-4">
          <Field
            label="Anahtar (key)"
            help="Uygulama kodunuzda kullanacağınız benzersiz kimlik. Örn: new_onboarding"
          >
            <Input
              value={createForm.key}
              onChange={(e) =>
                setCreateForm((f) => ({ ...f, key: e.target.value }))
              }
              placeholder="new_onboarding"
              className="font-mono"
            />
          </Field>
          <Field label="Ad">
            <Input
              value={createForm.name}
              onChange={(e) =>
                setCreateForm((f) => ({ ...f, name: e.target.value }))
              }
              placeholder="Yeni Onboarding Akışı"
            />
          </Field>
          <Field label="Açıklama">
            <Textarea
              rows={2}
              value={createForm.description}
              onChange={(e) =>
                setCreateForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </Field>
          <Toggle
            checked={createForm.enabled}
            onChange={(v) => setCreateForm((f) => ({ ...f, enabled: v }))}
            label="Bayrak açık olarak başlasın"
          />
          <Field
            label="Değer (JSON)"
            help="Bayrağa bağlı opsiyonel konfigürasyon. Geçerli bir JSON olmalıdır."
          >
            <Textarea
              rows={4}
              className="font-mono text-xs"
              value={createForm.value}
              onChange={(e) =>
                setCreateForm((f) => ({ ...f, value: e.target.value }))
              }
            />
          </Field>
        </div>
      </Modal>

      {/* Düzenle */}
      <Modal
        open={editFlag !== null}
        onClose={() => setEditFlag(null)}
        title="Bayrağı Düzenle"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditFlag(null)}>
              Vazgeç
            </Button>
            <Button onClick={submitEdit} loading={savingEdit}>
              Kaydet
            </Button>
          </>
        }
      >
        <div className="grid gap-4">
          <Field label="Anahtar (key)">
            <Input
              value={editForm.key}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, key: e.target.value }))
              }
              className="font-mono"
            />
          </Field>
          <Field label="Ad">
            <Input
              value={editForm.name}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, name: e.target.value }))
              }
            />
          </Field>
          <Field label="Açıklama">
            <Textarea
              rows={2}
              value={editForm.description}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </Field>
        </div>
      </Modal>

      {/* Değer (JSON) */}
      <Modal
        open={valueFlag !== null}
        onClose={() => setValueFlag(null)}
        title={
          valueFlag ? `Değer düzenle: ${valueFlag.key}` : "Değer düzenle"
        }
        footer={
          <>
            <Button variant="secondary" onClick={() => setValueFlag(null)}>
              Vazgeç
            </Button>
            <Button onClick={submitValue} loading={savingValue}>
              Kaydet
            </Button>
          </>
        }
      >
        <Field
          label="Değer (JSON)"
          help="Uygulamanıza flag ile birlikte iletilecek konfigürasyon."
        >
          <Textarea
            rows={8}
            className="font-mono text-xs"
            value={valueText}
            onChange={(e) => setValueText(e.target.value)}
          />
        </Field>
      </Modal>

      <ConfirmDialog
        open={deleteFlag !== null}
        onClose={() => setDeleteFlag(null)}
        onConfirm={confirmDelete}
        title="Bayrağı Sil"
        message={
          deleteFlag
            ? `"${deleteFlag.key}" bayrağı silinecek. Uygulamanız bu bayrağı okuyorsa davranışı etkilenebilir. Emin misiniz?`
            : ""
        }
      />
    </div>
  );
}
