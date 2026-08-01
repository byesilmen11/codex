"use client";

// ---------------------------------------------------------------------------
// Denetim Kaydı — panelde yapılan tüm işlemlerin dökümü; offset tabanlı
// "daha fazla yükle" sayfalaması.
// ---------------------------------------------------------------------------

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/client-api";
import { AuditEntry } from "@/lib/types";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Modal,
  PageHeader,
  Spinner,
  useToast,
} from "@/components/admin/ui";

const LIMIT = 50;

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
    second: "2-digit",
  });
}

function actionColor(action: string): "green" | "blue" | "red" | "gray" {
  switch (action) {
    case "create":
      return "green";
    case "update":
      return "blue";
    case "delete":
      return "red";
    default:
      return "gray";
  }
}

function actionLabel(action: string): string {
  switch (action) {
    case "create":
      return "Oluşturma";
    case "update":
      return "Güncelleme";
    case "delete":
      return "Silme";
    case "login":
      return "Giriş";
    default:
      return action;
  }
}

function truncate(text: string, max = 60): string {
  return text.length > max ? text.slice(0, max) + "…" : text;
}

function prettyDetails(details: string): string {
  try {
    const parsed: unknown = JSON.parse(details);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return details;
  }
}

export default function AuditPage() {
  const { toast } = useToast();
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [detailEntry, setDetailEntry] = useState<AuditEntry | null>(null);

  const loadPage = useCallback(
    async (offset: number) => {
      const res = await api.get<{ entries: AuditEntry[] }>(
        `/api/admin/audit?limit=${LIMIT}&offset=${offset}`
      );
      setEntries((prev) =>
        offset === 0 ? res.entries : [...prev, ...res.entries]
      );
      setHasMore(res.entries.length === LIMIT);
    },
    []
  );

  useEffect(() => {
    loadPage(0)
      .catch((e) => setLoadError(errMsg(e)))
      .finally(() => setLoading(false));
  }, [loadPage]);

  async function loadMore() {
    setLoadingMore(true);
    try {
      await loadPage(entries.length);
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Denetim Kaydı"
        description="Panelde yapılan tüm işlemlerin zaman damgalı dökümü."
      />

      {loading ? (
        <div className="flex justify-center py-20 text-slate-400">
          <Spinner className="h-8 w-8" />
        </div>
      ) : loadError ? (
        <Card>
          <p className="text-sm text-red-600">{loadError}</p>
        </Card>
      ) : entries.length === 0 ? (
        <EmptyState
          title="Henüz kayıt yok"
          description="Panelde işlem yapıldıkça kayıtlar burada listelenir."
        />
      ) : (
        <>
          <Card className="overflow-hidden">
            <div className="-m-5 overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-3 font-medium">Tarih</th>
                    <th className="px-5 py-3 font-medium">Kullanıcı</th>
                    <th className="px-5 py-3 font-medium">İşlem</th>
                    <th className="px-5 py-3 font-medium">Varlık</th>
                    <th className="px-5 py-3 font-medium">Detay</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr
                      key={entry.id}
                      className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60"
                    >
                      <td className="whitespace-nowrap px-5 py-3 text-slate-500">
                        {formatDate(entry.created_at)}
                      </td>
                      <td className="px-5 py-3 text-slate-700">
                        {entry.user_email || "—"}
                      </td>
                      <td className="px-5 py-3">
                        <Badge color={actionColor(entry.action)}>
                          {actionLabel(entry.action)}
                        </Badge>
                      </td>
                      <td className="px-5 py-3">
                        {entry.entity ? (
                          <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-800">
                            {entry.entity}
                            {entry.entity_id ? ` #${entry.entity_id}` : ""}
                          </code>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {entry.details ? (
                          <button
                            type="button"
                            onClick={() => setDetailEntry(entry)}
                            className="max-w-xs truncate text-left font-mono text-xs text-indigo-600 hover:text-indigo-800 hover:underline"
                            title="Tam detayı görüntüle"
                          >
                            {truncate(entry.details)}
                          </button>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {hasMore && (
            <div className="mt-4 flex justify-center">
              <Button
                variant="secondary"
                onClick={loadMore}
                loading={loadingMore}
              >
                Daha fazla yükle
              </Button>
            </div>
          )}
        </>
      )}

      <Modal
        open={detailEntry !== null}
        onClose={() => setDetailEntry(null)}
        title={
          detailEntry
            ? `Kayıt Detayı #${detailEntry.id}`
            : "Kayıt Detayı"
        }
        footer={
          <Button variant="secondary" onClick={() => setDetailEntry(null)}>
            Kapat
          </Button>
        }
      >
        {detailEntry && (
          <div>
            <dl className="mb-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
              <dt className="text-slate-500">Tarih</dt>
              <dd className="text-slate-900">
                {formatDate(detailEntry.created_at)}
              </dd>
              <dt className="text-slate-500">Kullanıcı</dt>
              <dd className="text-slate-900">
                {detailEntry.user_email || "—"}
              </dd>
              <dt className="text-slate-500">İşlem</dt>
              <dd>
                <Badge color={actionColor(detailEntry.action)}>
                  {actionLabel(detailEntry.action)}
                </Badge>
              </dd>
              <dt className="text-slate-500">Varlık</dt>
              <dd className="text-slate-900">
                {detailEntry.entity
                  ? `${detailEntry.entity}${
                      detailEntry.entity_id ? ` #${detailEntry.entity_id}` : ""
                    }`
                  : "—"}
              </dd>
            </dl>
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              Detay
            </span>
            <pre className="max-h-80 overflow-auto rounded-lg bg-slate-900 p-4 text-xs leading-relaxed text-slate-100">
              <code>{prettyDetails(detailEntry.details) || "—"}</code>
            </pre>
          </div>
        )}
      </Modal>
    </div>
  );
}
