"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/client-api";
import type { NavigationItem } from "@/lib/types";
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  Input,
  PageHeader,
  Spinner,
  Toggle,
  useToast,
} from "@/components/admin/ui";

type Menu = "header" | "footer";

function errMsg(err: unknown): string {
  return err instanceof Error ? err.message : "İşlem başarısız";
}

const MENUS: { key: Menu; title: string; description: string }[] = [
  {
    key: "header",
    title: "Üst Menü",
    description: "Sitenin üst kısmında (header) görünen bağlantılar.",
  },
  {
    key: "footer",
    title: "Alt Menü",
    description: "Sitenin alt kısmında (footer) görünen bağlantılar.",
  },
];

function AddItemForm({
  menu,
  onAdded,
}: {
  menu: Menu;
  onAdded: (item: NavigationItem) => void;
}) {
  const { toast } = useToast();
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [external, setExternal] = useState(false);
  const [saving, setSaving] = useState(false);

  async function add() {
    if (!label.trim() || !url.trim()) {
      toast("Etiket ve URL zorunludur", "error");
      return;
    }
    setSaving(true);
    try {
      const res = await api.post<{ item: NavigationItem }>(
        "/api/admin/navigation",
        { menu, label: label.trim(), url: url.trim(), external }
      );
      onAdded(res.item);
      setLabel("");
      setUrl("");
      setExternal(false);
      toast("Menü öğesi eklendi");
    } catch (err) {
      toast(errMsg(err), "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50/60 p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Yeni Öğe Ekle
      </p>
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-40 flex-1">
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Etiket
          </label>
          <Input
            value={label}
            placeholder="Örn. Hakkımızda"
            onChange={(e) => setLabel(e.target.value)}
          />
        </div>
        <div className="min-w-40 flex-1">
          <label className="mb-1 block text-xs font-medium text-slate-600">
            URL
          </label>
          <Input
            value={url}
            placeholder="/hakkimizda veya https://..."
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>
        <label className="flex h-9 cursor-pointer items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={external}
            onChange={(e) => setExternal(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          Harici bağlantı
        </label>
        <Button loading={saving} onClick={() => void add()}>
          Ekle
        </Button>
      </div>
    </div>
  );
}

export default function NavigationPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<NavigationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<NavigationItem | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await api.get<{ items: NavigationItem[] }>(
        "/api/admin/navigation"
      );
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

  function itemsFor(menu: Menu): NavigationItem[] {
    return items
      .filter((it) => it.menu === menu)
      .sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);
  }

  async function toggleEnabled(item: NavigationItem, enabled: boolean) {
    try {
      const res = await api.patch<{ item: NavigationItem }>(
        `/api/admin/navigation/${item.id}`,
        { enabled }
      );
      setItems((prev) =>
        prev.map((it) => (it.id === res.item.id ? res.item : it))
      );
      toast(enabled ? "Öğe etkinleştirildi" : "Öğe devre dışı bırakıldı");
    } catch (err) {
      toast(errMsg(err), "error");
    }
  }

  async function move(menu: Menu, index: number, dir: -1 | 1) {
    const list = itemsFor(menu);
    const target = index + dir;
    if (target < 0 || target >= list.length) return;

    // Öğeyi taşı ve tüm menüyü 0..n-1 olacak şekilde yeniden numaralandır;
    // böylece kayıtlı sort_order değerleri boşluklu/tekrarlı olsa bile sıra
    // her zaman tutarlı kalır.
    const reordered = [...list];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(target, 0, moved);

    const changed = reordered
      .map((it, i) => ({ it, i }))
      .filter(({ it, i }) => it.sort_order !== i);
    if (changed.length === 0) return;

    // İyimser güncelleme: yerel sırayı hemen yansıt.
    const newOrder = new Map(reordered.map((it, i) => [it.id, i]));
    setItems((prev) =>
      prev.map((it) =>
        newOrder.has(it.id) ? { ...it, sort_order: newOrder.get(it.id)! } : it
      )
    );

    try {
      await Promise.all(
        changed.map(({ it, i }) =>
          api.patch<{ item: NavigationItem }>(`/api/admin/navigation/${it.id}`, {
            sort_order: i,
          })
        )
      );
    } catch (err) {
      toast(errMsg(err), "error");
      void load();
    }
  }

  async function deleteItem(item: NavigationItem) {
    try {
      await api.del(`/api/admin/navigation/${item.id}`);
      setItems((prev) => prev.filter((it) => it.id !== item.id));
      toast("Menü öğesi silindi");
    } catch (err) {
      toast(errMsg(err), "error");
    }
  }

  return (
    <div>
      <PageHeader
        title="Navigasyon"
        description="Sitenin üst ve alt menülerindeki bağlantıları yönetin."
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-6 w-6 text-slate-400" />
        </div>
      ) : (
        <div className="space-y-6">
          {MENUS.map((menu) => {
            const list = itemsFor(menu.key);
            return (
              <Card key={menu.key} title={menu.title}>
                <p className="mb-4 text-xs text-slate-500">{menu.description}</p>
                {list.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50/60 px-4 py-6 text-center text-sm text-slate-500">
                    Bu menüde henüz öğe yok.
                  </p>
                ) : (
                  <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
                    {list.map((item, i) => (
                      <li
                        key={item.id}
                        className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-900">
                              {item.label}
                            </span>
                            {!!item.external && (
                              <Badge color="blue">Harici</Badge>
                            )}
                            {!item.enabled && (
                              <Badge color="amber">Pasif</Badge>
                            )}
                          </div>
                          <p className="mt-0.5 truncate text-xs text-slate-500">
                            {item.url}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1.5">
                          <Toggle
                            checked={!!item.enabled}
                            onChange={(c) => void toggleEnabled(item, c)}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            aria-label="Yukarı taşı"
                            disabled={i === 0}
                            onClick={() => void move(menu.key, i, -1)}
                          >
                            ↑
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            aria-label="Aşağı taşı"
                            disabled={i === list.length - 1}
                            onClick={() => void move(menu.key, i, 1)}
                          >
                            ↓
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setDeleteTarget(item)}
                          >
                            Sil
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                <AddItemForm
                  menu={menu.key}
                  onAdded={(item) => setItems((prev) => [...prev, item])}
                />
              </Card>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) void deleteItem(deleteTarget);
        }}
        title="Menü Öğesini Sil"
        message={
          deleteTarget
            ? `"${deleteTarget.label}" öğesi menüden kalıcı olarak silinecek.`
            : ""
        }
      />
    </div>
  );
}
