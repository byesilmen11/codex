"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "@/lib/client-api";
import { SECTION_DEFINITIONS } from "@/lib/types";
import type { Page, Section, SectionType } from "@/lib/types";
import {
  Badge,
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
import SectionForm from "@/components/admin/SectionForm";

function errMsg(err: unknown): string {
  return err instanceof Error ? err.message : "İşlem başarısız";
}

export default function PageEditorPage() {
  const params = useParams<{ id: string }>();
  const pageId = Number(params?.id);
  const { toast } = useToast();

  const [page, setPage] = useState<Page | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Sayfa meta formu
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [savingMeta, setSavingMeta] = useState(false);

  // Bölüm işlemleri
  const [addOpen, setAddOpen] = useState(false);
  const [addingType, setAddingType] = useState<SectionType | null>(null);
  const [editing, setEditing] = useState<Section | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Section | null>(null);

  const load = useCallback(async () => {
    if (!Number.isFinite(pageId)) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    try {
      const res = await api.get<{ page: Page; sections: Section[] }>(
        `/api/admin/pages/${pageId}`
      );
      setPage(res.page);
      setSections(res.sections);
      setTitle(res.page.title);
      setSlug(res.page.slug);
      setDescription(res.page.description);
    } catch (err) {
      setNotFound(true);
      toast(errMsg(err), "error");
    } finally {
      setLoading(false);
    }
  }, [pageId, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveMeta() {
    setSavingMeta(true);
    try {
      const res = await api.patch<{ page: Page }>(`/api/admin/pages/${pageId}`, {
        title,
        slug,
        description,
      });
      setPage(res.page);
      setTitle(res.page.title);
      setSlug(res.page.slug);
      setDescription(res.page.description);
      toast("Sayfa bilgileri kaydedildi");
    } catch (err) {
      toast(errMsg(err), "error");
    } finally {
      setSavingMeta(false);
    }
  }

  async function togglePublished(published: boolean) {
    try {
      const res = await api.patch<{ page: Page }>(`/api/admin/pages/${pageId}`, {
        published,
      });
      setPage(res.page);
      toast(published ? "Sayfa yayınlandı" : "Sayfa yayından kaldırıldı");
    } catch (err) {
      toast(errMsg(err), "error");
    }
  }

  async function addSection(type: SectionType) {
    setAddingType(type);
    try {
      const res = await api.post<{ section: Section }>("/api/admin/sections", {
        page_id: pageId,
        type,
      });
      setSections((prev) => [...prev, res.section]);
      setAddOpen(false);
      toast("Bölüm eklendi");
    } catch (err) {
      toast(errMsg(err), "error");
    } finally {
      setAddingType(null);
    }
  }

  async function toggleSection(section: Section, enabled: boolean) {
    try {
      const res = await api.patch<{ section: Section }>(
        `/api/admin/sections/${section.id}`,
        { enabled }
      );
      setSections((prev) =>
        prev.map((s) => (s.id === res.section.id ? res.section : s))
      );
      toast(enabled ? "Bölüm etkinleştirildi" : "Bölüm devre dışı bırakıldı");
    } catch (err) {
      toast(errMsg(err), "error");
    }
  }

  async function moveSection(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= sections.length) return;
    const next = [...sections];
    [next[index], next[target]] = [next[target], next[index]];
    setSections(next);
    try {
      await api.post("/api/admin/sections/reorder", {
        page_id: pageId,
        ordered_ids: next.map((s) => s.id),
      });
    } catch (err) {
      toast(errMsg(err), "error");
      void load();
    }
  }

  async function deleteSection(section: Section) {
    try {
      await api.del(`/api/admin/sections/${section.id}`);
      setSections((prev) => prev.filter((s) => s.id !== section.id));
      toast("Bölüm silindi");
    } catch (err) {
      toast(errMsg(err), "error");
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="h-6 w-6 text-slate-400" />
      </div>
    );
  }

  if (notFound || !page) {
    return (
      <EmptyState
        title="Sayfa bulunamadı"
        description="Aradığınız sayfa silinmiş veya hiç var olmamış olabilir."
        action={
          <Link href="/admin/pages">
            <Button variant="secondary">Sayfalara Dön</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div>
      <PageHeader
        title={
          <span className="flex items-center gap-3">
            {page.title}
            <Badge color={page.published ? "green" : "gray"}>
              {page.published ? "Yayında" : "Taslak"}
            </Badge>
          </span>
        }
        description={`/${page.slug} adresindeki sayfayı düzenliyorsunuz.`}
        actions={
          <>
            <Toggle
              checked={!!page.published}
              onChange={(c) => void togglePublished(c)}
              label={page.published ? "Yayında" : "Taslak"}
            />
            <Link href="/admin/pages">
              <Button variant="secondary" size="sm">
                Geri
              </Button>
            </Link>
          </>
        }
      />

      <div className="space-y-6">
        <Card title="Sayfa Bilgileri">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Başlık
              </label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Slug
              </label>
              <Input
                value={slug}
                disabled={page.slug === "home"}
                onChange={(e) => setSlug(e.target.value)}
              />
              {page.slug === "home" && (
                <p className="mt-1 text-xs text-slate-400">
                  Ana sayfanın slug değeri değiştirilemez.
                </p>
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Açıklama
              </label>
              <Textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button loading={savingMeta} onClick={() => void saveMeta()}>
              Kaydet
            </Button>
          </div>
        </Card>

        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">
            Bölümler
            <span className="ml-2 text-sm font-normal text-slate-400">
              ({sections.length})
            </span>
          </h2>
          <Button onClick={() => setAddOpen(true)}>Bölüm Ekle</Button>
        </div>

        {sections.length === 0 ? (
          <EmptyState
            title="Bu sayfada henüz bölüm yok"
            description="Hero, özellikler, fiyatlandırma gibi hazır bölümler ekleyerek sayfanızı oluşturun."
            action={<Button onClick={() => setAddOpen(true)}>Bölüm Ekle</Button>}
          />
        ) : (
          <div className="space-y-3">
            {sections.map((s, i) => {
              const def = SECTION_DEFINITIONS[s.type];
              return (
                <Card key={s.id}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900">
                          {def ? def.name : s.type}
                        </span>
                        {!s.enabled && <Badge color="amber">Pasif</Badge>}
                      </div>
                      <p className="mt-0.5 truncate text-sm text-slate-500">
                        {s.label || (def ? def.description : "")}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <Toggle
                        checked={!!s.enabled}
                        onChange={(c) => void toggleSection(s, c)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label="Yukarı taşı"
                        disabled={i === 0}
                        onClick={() => void moveSection(i, -1)}
                      >
                        ↑
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label="Aşağı taşı"
                        disabled={i === sections.length - 1}
                        onClick={() => void moveSection(i, 1)}
                      >
                        ↓
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setEditing(s)}
                      >
                        Düzenle
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setDeleteTarget(s)}
                      >
                        Sil
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Bölüm ekleme modalı */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Bölüm Ekle"
      >
        <div className="space-y-2">
          {Object.values(SECTION_DEFINITIONS).map((def) => (
            <button
              key={def.type}
              type="button"
              disabled={addingType !== null}
              onClick={() => void addSection(def.type)}
              className="flex w-full items-center justify-between gap-3 rounded-lg border border-slate-200 px-4 py-3 text-left transition-colors hover:border-indigo-300 hover:bg-indigo-50/50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span>
                <span className="block text-sm font-medium text-slate-900">
                  {def.name}
                </span>
                <span className="mt-0.5 block text-xs text-slate-500">
                  {def.description}
                </span>
              </span>
              {addingType === def.type && (
                <Spinner className="h-4 w-4 text-indigo-600" />
              )}
            </button>
          ))}
        </div>
      </Modal>

      {/* Bölüm düzenleme modalı */}
      {editing && (
        <Modal
          open={true}
          onClose={() => setEditing(null)}
          title={`Bölümü Düzenle — ${
            SECTION_DEFINITIONS[editing.type]?.name ?? editing.type
          }`}
        >
          <SectionForm
            section={editing}
            onSaved={(updated) => {
              setSections((prev) =>
                prev.map((s) => (s.id === updated.id ? updated : s))
              );
              setEditing(null);
            }}
            onClose={() => setEditing(null)}
          />
        </Modal>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) void deleteSection(deleteTarget);
        }}
        title="Bölümü Sil"
        message={
          deleteTarget
            ? `"${
                deleteTarget.label ||
                SECTION_DEFINITIONS[deleteTarget.type]?.name ||
                deleteTarget.type
              }" bölümü kalıcı olarak silinecek. Bu işlem geri alınamaz.`
            : ""
        }
      />
    </div>
  );
}
