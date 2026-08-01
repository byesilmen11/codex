"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/client-api";
import type { MediaItem } from "@/lib/types";
import {
  Button,
  EmptyState,
  Modal,
  Spinner,
  useToast,
} from "@/components/admin/ui";

function errMsg(err: unknown): string {
  return err instanceof Error ? err.message : "İşlem başarısız";
}

function isImage(item: MediaItem): boolean {
  return item.mime.startsWith("image/");
}

export default function MediaPicker({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}) {
  const { toast } = useToast();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    api
      .get<{ items: MediaItem[] }>("/api/admin/media")
      .then((res) => {
        if (!cancelled) setItems(res.items);
      })
      .catch((err: unknown) => {
        if (!cancelled) toast(errMsg(err), "error");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, toast]);

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

  return (
    <Modal open={open} onClose={onClose} title="Medya Seç">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-xs text-slate-500">
          Bir dosyaya tıklayarak seçin veya yeni dosya yükleyin.
        </p>
        <Button
          variant="secondary"
          size="sm"
          loading={uploading}
          onClick={() => fileRef.current?.click()}
        >
          Dosya Yükle
        </Button>
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
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner className="h-6 w-6 text-slate-400" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="Medya kütüphanesi boş"
          description="Henüz yüklenmiş bir dosya yok. Yukarıdaki butonla dosya yükleyebilirsiniz."
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onSelect(item.path);
                onClose();
              }}
              className="group overflow-hidden rounded-lg border border-slate-200 text-left transition-colors hover:border-indigo-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <div className="flex h-24 items-center justify-center bg-slate-50">
                {isImage(item) ? (
                  <img
                    src={item.path}
                    alt={item.alt || item.original_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <svg
                    className="h-8 w-8 text-slate-300"
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
                )}
              </div>
              <div className="border-t border-slate-100 px-2 py-1.5">
                <p className="truncate text-xs text-slate-600 group-hover:text-slate-900">
                  {item.original_name || item.filename}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </Modal>
  );
}
