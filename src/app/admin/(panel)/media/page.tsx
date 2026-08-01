"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/client-api";
import type { MediaItem } from "@/lib/types";
import {
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  Input,
  PageHeader,
  Spinner,
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

function formatSize(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function isImage(item: MediaItem): boolean {
  return item.mime.startsWith("image/");
}

function MediaCard({
  item,
  onDelete,
  onUpdated,
}: {
  item: MediaItem;
  onDelete: (item: MediaItem) => void;
  onUpdated: (item: MediaItem) => void;
}) {
  const { toast } = useToast();
  const [alt, setAlt] = useState(item.alt);
  const [savingAlt, setSavingAlt] = useState(false);

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(window.location.origin + item.path);
      toast("URL kopyalandı");
    } catch {
      toast("Kopyalama başarısız", "error");
    }
  }

  async function saveAlt() {
    setSavingAlt(true);
    try {
      const res = await api.patch<{ item: MediaItem }>(
        `/api/admin/media/${item.id}`,
        { alt }
      );
      onUpdated(res.item);
      toast("Alt metin kaydedildi");
    } catch (err) {
      toast(errMsg(err), "error");
    } finally {
      setSavingAlt(false);
    }
  }

  return (
    <Card className="overflow-hidden !p-0">
      <div className="-m-5">
        <div className="flex h-36 items-center justify-center border-b border-slate-200 bg-slate-50">
          {isImage(item) ? (
            <img
              src={item.path}
              alt={item.alt || item.original_name}
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="flex flex-col items-center gap-1 text-slate-400">
              <svg
                className="h-10 w-10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>
              <span className="text-xs uppercase">
                {item.filename.split(".").pop()}
              </span>
            </div>
          )}
        </div>
        <div className="space-y-3 p-4">
          <div>
            <p
              className="truncate text-sm font-medium text-slate-900"
              title={item.original_name || item.filename}
            >
              {item.original_name || item.filename}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              {formatSize(item.size)} · {formatDate(item.created_at)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Input
              value={alt}
              placeholder="Alt metin"
              className="!py-1.5 !text-xs"
              onChange={(e) => setAlt(e.target.value)}
            />
            <Button
              variant="secondary"
              size="sm"
              className="shrink-0"
              loading={savingAlt}
              disabled={alt === item.alt}
              onClick={() => void saveAlt()}
            >
              Kaydet
            </Button>
          </div>
          <div className="flex items-center justify-between gap-2">
            <Button variant="ghost" size="sm" onClick={() => void copyUrl()}>
              URL Kopyala
            </Button>
            <Button variant="danger" size="sm" onClick={() => onDelete(item)}>
              Sil
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function MediaPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await api.get<{ items: MediaItem[] }>("/api/admin/media");
      setItems(res.items);
    } catch (err) {
      toast(errMsg(err), "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await api.upload<{ item: MediaItem }>("/api/admin/media", fd);
      setItems((prev) => [res.item, ...prev]);
      toast("Dosya yüklendi");
    } catch (err) {
      toast(errMsg(err), "error");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function deleteItem(item: MediaItem) {
    try {
      await api.del(`/api/admin/media/${item.id}`);
      setItems((prev) => prev.filter((it) => it.id !== item.id));
      toast("Dosya silindi");
    } catch (err) {
      toast(errMsg(err), "error");
    }
  }

  return (
    <div>
      <PageHeader
        title="Medya Kütüphanesi"
        description="Görselleri ve dosyaları yükleyin, yönetin."
        actions={
          <Button loading={uploading} onClick={() => fileRef.current?.click()}>
            Dosya Yükle
          </Button>
        }
      />
      <input
        ref={fileRef}
        type="file"
        className="hidden"
        accept=".png,.jpg,.jpeg,.webp,.gif,.svg,.ico,.pdf"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleUpload(file);
        }}
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-6 w-6 text-slate-400" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="Medya kütüphanesi boş"
          description="Henüz yüklenmiş bir dosya yok. PNG, JPG, WEBP, GIF, SVG, ICO ve PDF dosyaları yükleyebilirsiniz (en fazla 10 MB)."
          action={
            <Button
              loading={uploading}
              onClick={() => fileRef.current?.click()}
            >
              Dosya Yükle
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <MediaCard
              key={item.id}
              item={item}
              onDelete={(it) => setDeleteTarget(it)}
              onUpdated={(updated) =>
                setItems((prev) =>
                  prev.map((it) => (it.id === updated.id ? updated : it))
                )
              }
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) void deleteItem(deleteTarget);
        }}
        title="Dosyayı Sil"
        message={
          deleteTarget
            ? `"${
                deleteTarget.original_name || deleteTarget.filename
              }" dosyası kalıcı olarak silinecek. İçerikte kullanılıyorsa görüntülenemez hale gelir.`
            : ""
        }
      />
    </div>
  );
}
