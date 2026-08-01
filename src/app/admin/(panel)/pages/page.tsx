"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/client-api";
import type { Page } from "@/lib/types";
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

function errMsg(err: unknown): string {
  return err instanceof Error ? err.message : "İşlem başarısız";
}

function formatDate(value: string): string {
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
  if (!m) return value;
  return `${m[3]}.${m[2]}.${m[1]} ${m[4]}:${m[5]}`;
}

function slugify(input: string): string {
  const map: Record<string, string> = {
    ç: "c",
    Ç: "c",
    ğ: "g",
    Ğ: "g",
    ı: "i",
    I: "i",
    İ: "i",
    ö: "o",
    Ö: "o",
    ş: "s",
    Ş: "s",
    ü: "u",
    Ü: "u",
  };
  return input
    .replace(/[çÇğĞıIİöÖşŞüÜ]/g, (ch) => map[ch] ?? ch)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function PagesPage() {
  const { toast } = useToast();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);

  // Yeni sayfa modalı
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [newDescription, setNewDescription] = useState("");
  const [creating, setCreating] = useState(false);

  // Silme onayı
  const [deleteTarget, setDeleteTarget] = useState<Page | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await api.get<{ pages: Page[] }>("/api/admin/pages");
      setPages(res.pages);
    } catch (err) {
      toast(errMsg(err), "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void load();
  }, [load]);

  async function togglePublished(page: Page, published: boolean) {
    try {
      const res = await api.patch<{ page: Page }>(`/api/admin/pages/${page.id}`, {
        published,
      });
      setPages((prev) => prev.map((p) => (p.id === res.page.id ? res.page : p)));
      toast(published ? "Sayfa yayınlandı" : "Sayfa yayından kaldırıldı");
    } catch (err) {
      toast(errMsg(err), "error");
    }
  }

  async function createPage() {
    if (!newTitle.trim() || !newSlug.trim()) {
      toast("Başlık ve slug zorunludur", "error");
      return;
    }
    setCreating(true);
    try {
      const res = await api.post<{ page: Page }>("/api/admin/pages", {
        slug: newSlug.trim(),
        title: newTitle.trim(),
        description: newDescription.trim(),
      });
      setPages((prev) => [...prev, res.page]);
      setCreateOpen(false);
      setNewTitle("");
      setNewSlug("");
      setNewDescription("");
      setSlugTouched(false);
      toast("Sayfa oluşturuldu");
    } catch (err) {
      toast(errMsg(err), "error");
    } finally {
      setCreating(false);
    }
  }

  async function deletePage(page: Page) {
    try {
      await api.del(`/api/admin/pages/${page.id}`);
      setPages((prev) => prev.filter((p) => p.id !== page.id));
      toast("Sayfa silindi");
    } catch (err) {
      toast(errMsg(err), "error");
    }
  }

  return (
    <div>
      <PageHeader
        title="Sayfalar"
        description="Sitenizdeki sayfaları oluşturun, düzenleyin ve yayınlayın."
        actions={
          <Button onClick={() => setCreateOpen(true)}>Yeni Sayfa</Button>
        }
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-6 w-6 text-slate-400" />
        </div>
      ) : pages.length === 0 ? (
        <EmptyState
          title="Henüz sayfa yok"
          description="İlk sayfanızı oluşturarak başlayın."
          action={<Button onClick={() => setCreateOpen(true)}>Yeni Sayfa</Button>}
        />
      ) : (
        <Card className="overflow-hidden !p-0">
          <div className="-m-5 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3 font-medium">Başlık</th>
                  <th className="px-5 py-3 font-medium">Slug</th>
                  <th className="px-5 py-3 font-medium">Durum</th>
                  <th className="px-5 py-3 font-medium">Güncelleme</th>
                  <th className="px-5 py-3 text-right font-medium">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {pages.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60"
                  >
                    <td className="px-5 py-3 font-medium text-slate-900">
                      {p.title}
                    </td>
                    <td className="px-5 py-3 text-slate-500">/{p.slug}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Badge color={p.published ? "green" : "gray"}>
                          {p.published ? "Yayında" : "Taslak"}
                        </Badge>
                        <Toggle
                          checked={!!p.published}
                          onChange={(c) => void togglePublished(p, c)}
                        />
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      {formatDate(p.updated_at)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/pages/${p.id}`}>
                          <Button variant="secondary" size="sm">
                            Düzenle
                          </Button>
                        </Link>
                        {p.slug !== "home" && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setDeleteTarget(p)}
                          >
                            Sil
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Yeni Sayfa"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>
              Vazgeç
            </Button>
            <Button loading={creating} onClick={() => void createPage()}>
              Oluştur
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Başlık
            </label>
            <Input
              value={newTitle}
              placeholder="Örn. Hakkımızda"
              onChange={(e) => {
                setNewTitle(e.target.value);
                if (!slugTouched) setNewSlug(slugify(e.target.value));
              }}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Slug
            </label>
            <Input
              value={newSlug}
              placeholder="hakkimizda"
              onChange={(e) => {
                setSlugTouched(true);
                setNewSlug(slugify(e.target.value));
              }}
            />
            <p className="mt-1 text-xs text-slate-400">
              Sayfanın adresi: /{newSlug || "..."}
            </p>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Açıklama
            </label>
            <Textarea
              rows={3}
              value={newDescription}
              placeholder="Sayfanın kısa açıklaması (opsiyonel)"
              onChange={(e) => setNewDescription(e.target.value)}
            />
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) void deletePage(deleteTarget);
        }}
        title="Sayfayı Sil"
        message={
          deleteTarget
            ? `"${deleteTarget.title}" sayfası ve tüm bölümleri kalıcı olarak silinecek. Bu işlem geri alınamaz.`
            : ""
        }
      />
    </div>
  );
}
