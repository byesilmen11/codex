"use client";

// ---------------------------------------------------------------------------
// API Anahtarları — /api/v1/* uçlarını kullanan uygulama entegrasyonları için
// anahtar üretimi ve yönetimi.
// ---------------------------------------------------------------------------

import { useEffect, useState } from "react";
import { api } from "@/lib/client-api";
import { ApiKey } from "@/lib/types";
import {
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  Input,
  Modal,
  PageHeader,
  Spinner,
  Toggle,
  useToast,
} from "@/components/admin/ui";

const errMsg = (e: unknown) =>
  e instanceof Error ? e.message : "İşlem başarısız";

function formatDate(value: string | null): string {
  if (!value) return "—";
  const d = new Date(
    value.includes("T") ? value : value.replace(" ", "T") + "Z"
  );
  if (isNaN(d.getTime())) return value;
  return d.toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ApiKeysPage() {
  const { toast } = useToast();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [origin, setOrigin] = useState("https://siteniz.com");

  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [creating, setCreating] = useState(false);

  const [createdKey, setCreatedKey] = useState<{
    key: string;
    record: ApiKey;
  } | null>(null);

  const [deleteKey, setDeleteKey] = useState<ApiKey | null>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
    api
      .get<{ keys: ApiKey[] }>("/api/admin/api-keys")
      .then((res) => setKeys(res.keys))
      .catch((e) => setLoadError(errMsg(e)))
      .finally(() => setLoading(false));
  }, []);

  const firstActive = keys.find((k) => k.active);
  const sampleKey = firstActive ? `${firstActive.prefix}…` : "cms_XXXXXXXX…";
  const curlExample = `curl -H "x-api-key: ${sampleKey}" \\
  "${origin}/api/v1/content?page=home"

curl -H "x-api-key: ${sampleKey}" \\
  "${origin}/api/v1/flags"`;

  async function submitCreate() {
    if (!createName.trim()) {
      toast("Anahtar için bir ad girin", "error");
      return;
    }
    setCreating(true);
    try {
      const res = await api.post<{ key: string; record: ApiKey }>(
        "/api/admin/api-keys",
        { name: createName.trim() }
      );
      setKeys((prev) => [...prev, res.record]);
      setCreateOpen(false);
      setCreateName("");
      setCreatedKey(res);
      toast("Anahtar oluşturuldu");
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setCreating(false);
    }
  }

  async function toggleActive(key: ApiKey, active: boolean) {
    setKeys((prev) =>
      prev.map((k) => (k.id === key.id ? { ...k, active: active ? 1 : 0 } : k))
    );
    try {
      await api.patch(`/api/admin/api-keys/${key.id}`, { active });
      toast(active ? "Anahtar etkinleştirildi" : "Anahtar devre dışı bırakıldı");
    } catch (e) {
      setKeys((prev) => prev.map((k) => (k.id === key.id ? key : k)));
      toast(errMsg(e), "error");
    }
  }

  async function confirmDelete() {
    if (!deleteKey) return;
    const target = deleteKey;
    try {
      await api.del(`/api/admin/api-keys/${target.id}`);
      setKeys((prev) => prev.filter((k) => k.id !== target.id));
      toast("Anahtar silindi");
    } catch (e) {
      toast(errMsg(e), "error");
    }
  }

  async function copyCreatedKey() {
    if (!createdKey) return;
    try {
      await navigator.clipboard.writeText(createdKey.key);
      toast("Anahtar panoya kopyalandı");
    } catch {
      toast("Kopyalama başarısız — anahtarı elle seçip kopyalayın", "error");
    }
  }

  return (
    <div>
      <PageHeader
        title="API Anahtarları"
        description="Uygulamanızın CMS içeriğine ve özellik bayraklarına erişmesi için anahtarlar oluşturun."
        actions={
          <Button onClick={() => setCreateOpen(true)}>Yeni Anahtar</Button>
        }
      />

      <Card title="Nasıl kullanılır?" className="mb-6">
        <p className="mb-3 text-sm text-slate-600">
          <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-800">
            /api/v1/content?page=home
          </code>{" "}
          ve{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-800">
            /api/v1/flags
          </code>{" "}
          uçları{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-800">
            x-api-key
          </code>{" "}
          başlığı ile çağrılır:
        </p>
        <pre className="overflow-x-auto rounded-lg bg-slate-900 p-4 text-xs leading-relaxed text-slate-100">
          <code>{curlExample}</code>
        </pre>
      </Card>

      {loading ? (
        <div className="flex justify-center py-20 text-slate-400">
          <Spinner className="h-8 w-8" />
        </div>
      ) : loadError ? (
        <Card>
          <p className="text-sm text-red-600">{loadError}</p>
        </Card>
      ) : keys.length === 0 ? (
        <EmptyState
          title="Henüz API anahtarı yok"
          description="Uygulamanızı bağlamak için bir anahtar oluşturun."
          action={
            <Button onClick={() => setCreateOpen(true)}>Yeni Anahtar</Button>
          }
        />
      ) : (
        <Card className="overflow-hidden" title="Anahtarlar">
          <div className="-m-5 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3 font-medium">Ad</th>
                  <th className="px-5 py-3 font-medium">Anahtar</th>
                  <th className="px-5 py-3 font-medium">Durum</th>
                  <th className="px-5 py-3 font-medium">Oluşturulma</th>
                  <th className="px-5 py-3 font-medium">Son Kullanım</th>
                  <th className="px-5 py-3 text-right font-medium">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {keys.map((key) => (
                  <tr
                    key={key.id}
                    className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60"
                  >
                    <td className="px-5 py-3 font-medium text-slate-900">
                      {key.name}
                    </td>
                    <td className="px-5 py-3">
                      <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-800">
                        {key.prefix}…
                      </code>
                    </td>
                    <td className="px-5 py-3">
                      <Toggle
                        checked={!!key.active}
                        onChange={(v) => toggleActive(key, v)}
                      />
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      {formatDate(key.created_at)}
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      {formatDate(key.last_used_at)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setDeleteKey(key)}
                        >
                          Sil
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Yeni anahtar */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Yeni API Anahtarı"
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
        <div>
          <span className="mb-1.5 block text-sm font-medium text-slate-700">
            Anahtar adı
          </span>
          <Input
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            placeholder="Örn: Mobil Uygulama"
          />
          <p className="mt-1 text-xs text-slate-500">
            Anahtarı hangi uygulamanın kullanacağını hatırlatan bir ad verin.
          </p>
        </div>
      </Modal>

      {/* Ham anahtar — tek seferlik gösterim */}
      <Modal
        open={createdKey !== null}
        onClose={() => setCreatedKey(null)}
        title="Anahtarınız Hazır"
        footer={
          <Button variant="secondary" onClick={() => setCreatedKey(null)}>
            Kapat
          </Button>
        }
      >
        {createdKey && (
          <div>
            <p className="mb-3 text-sm text-slate-600">
              <span className="font-medium text-slate-900">
                {createdKey.record.name}
              </span>{" "}
              için oluşturulan anahtar:
            </p>
            <div className="flex items-center gap-2">
              <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap rounded-lg bg-slate-900 px-3 py-2.5 font-mono text-xs text-emerald-300">
                {createdKey.key}
              </code>
              <Button variant="secondary" size="sm" onClick={copyCreatedKey}>
                Kopyala
              </Button>
            </div>
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Bu anahtar bir daha gösterilmeyecek, güvenli bir yere kaydedin.
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={deleteKey !== null}
        onClose={() => setDeleteKey(null)}
        onConfirm={confirmDelete}
        title="Anahtarı Sil"
        message={
          deleteKey
            ? `"${deleteKey.name}" anahtarı kalıcı olarak silinecek. Bu anahtarı kullanan uygulamalar API'ye erişemez. Emin misiniz?`
            : ""
        }
      />
    </div>
  );
}
