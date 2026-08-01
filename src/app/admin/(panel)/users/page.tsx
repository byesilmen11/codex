"use client";

// ---------------------------------------------------------------------------
// Kullanıcılar — kullanıcı listesi, oluşturma, düzenleme ve silme.
// ---------------------------------------------------------------------------

import React, { useEffect, useState } from "react";
import { api } from "@/lib/client-api";
import { ROLES, ROLE_LABELS, Role, User } from "@/lib/types";
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  Input,
  Modal,
  PageHeader,
  Select,
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

const ROLE_BADGE: Record<Role, "amber" | "blue" | "green" | "gray"> = {
  OWNER: "amber",
  ADMIN: "blue",
  EDITOR: "green",
  VIEWER: "gray",
};

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
  name: string;
  email: string;
  password: string;
  role: Role;
}

const EMPTY_CREATE: CreateForm = {
  name: "",
  email: "",
  password: "",
  role: "EDITOR",
};

interface EditForm {
  name: string;
  email: string;
  role: Role;
  active: boolean;
  password: string;
}

export default function UsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateForm>(EMPTY_CREATE);
  const [creating, setCreating] = useState(false);

  const [editUser, setEditUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    name: "",
    email: "",
    role: "EDITOR",
    active: true,
    password: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);

  const [deleteUser, setDeleteUser] = useState<User | null>(null);

  useEffect(() => {
    api
      .get<{ users: User[] }>("/api/admin/users")
      .then((res) => setUsers(res.users))
      .catch((e) => setLoadError(errMsg(e)))
      .finally(() => setLoading(false));
  }, []);

  async function submitCreate() {
    if (
      !createForm.name.trim() ||
      !createForm.email.trim() ||
      !createForm.password
    ) {
      toast("Ad, e-posta ve şifre alanları zorunludur", "error");
      return;
    }
    setCreating(true);
    try {
      const res = await api.post<{ user: User }>("/api/admin/users", {
        name: createForm.name.trim(),
        email: createForm.email.trim(),
        password: createForm.password,
        role: createForm.role,
      });
      setUsers((prev) => [...prev, res.user]);
      setCreateOpen(false);
      setCreateForm(EMPTY_CREATE);
      toast("Kullanıcı oluşturuldu");
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setCreating(false);
    }
  }

  function openEdit(user: User) {
    setEditUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      active: !!user.active,
      password: "",
    });
  }

  async function submitEdit() {
    if (!editUser) return;
    if (!editForm.name.trim() || !editForm.email.trim()) {
      toast("Ad ve e-posta alanları zorunludur", "error");
      return;
    }
    setSavingEdit(true);
    try {
      const payload: Record<string, unknown> = {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        role: editForm.role,
        active: editForm.active,
      };
      if (editForm.password.trim()) payload.password = editForm.password;
      const res = await api.patch<{ user: User }>(
        `/api/admin/users/${editUser.id}`,
        payload
      );
      setUsers((prev) =>
        prev.map((u) => (u.id === editUser.id ? res.user : u))
      );
      setEditUser(null);
      toast("Kullanıcı güncellendi");
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setSavingEdit(false);
    }
  }

  async function confirmDelete() {
    if (!deleteUser) return;
    const target = deleteUser;
    try {
      await api.del(`/api/admin/users/${target.id}`);
      setUsers((prev) => prev.filter((u) => u.id !== target.id));
      toast("Kullanıcı silindi");
    } catch (e) {
      toast(errMsg(e), "error");
    }
  }

  return (
    <div>
      <PageHeader
        title="Kullanıcılar"
        description="Yönetim paneline erişebilen kullanıcıları ve rollerini yönetin."
        actions={
          <Button onClick={() => setCreateOpen(true)}>Yeni Kullanıcı</Button>
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
      ) : users.length === 0 ? (
        <EmptyState
          title="Kullanıcı bulunamadı"
          action={
            <Button onClick={() => setCreateOpen(true)}>Yeni Kullanıcı</Button>
          }
        />
      ) : (
        <Card className="overflow-hidden" title="Tüm Kullanıcılar">
          <div className="-m-5 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3 font-medium">Ad</th>
                  <th className="px-5 py-3 font-medium">E-posta</th>
                  <th className="px-5 py-3 font-medium">Rol</th>
                  <th className="px-5 py-3 font-medium">Durum</th>
                  <th className="px-5 py-3 font-medium">Oluşturulma</th>
                  <th className="px-5 py-3 text-right font-medium">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60"
                  >
                    <td className="px-5 py-3 font-medium text-slate-900">
                      {user.name || "—"}
                    </td>
                    <td className="px-5 py-3 text-slate-600">{user.email}</td>
                    <td className="px-5 py-3">
                      <Badge color={ROLE_BADGE[user.role]}>
                        {ROLE_LABELS[user.role]}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      {user.active ? (
                        <Badge color="green">Aktif</Badge>
                      ) : (
                        <Badge color="red">Pasif</Badge>
                      )}
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => openEdit(user)}
                        >
                          Düzenle
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setDeleteUser(user)}
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

      {/* Yeni kullanıcı */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Yeni Kullanıcı"
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
          <Field label="Ad Soyad">
            <Input
              value={createForm.name}
              onChange={(e) =>
                setCreateForm((f) => ({ ...f, name: e.target.value }))
              }
            />
          </Field>
          <Field label="E-posta">
            <Input
              type="email"
              value={createForm.email}
              onChange={(e) =>
                setCreateForm((f) => ({ ...f, email: e.target.value }))
              }
            />
          </Field>
          <Field label="Şifre">
            <Input
              type="password"
              value={createForm.password}
              onChange={(e) =>
                setCreateForm((f) => ({ ...f, password: e.target.value }))
              }
            />
          </Field>
          <Field label="Rol">
            <Select
              value={createForm.role}
              onChange={(e) =>
                setCreateForm((f) => ({ ...f, role: e.target.value as Role }))
              }
            >
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {ROLE_LABELS[role]}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </Modal>

      {/* Düzenle */}
      <Modal
        open={editUser !== null}
        onClose={() => setEditUser(null)}
        title={editUser ? `Kullanıcıyı Düzenle: ${editUser.email}` : "Düzenle"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditUser(null)}>
              Vazgeç
            </Button>
            <Button onClick={submitEdit} loading={savingEdit}>
              Kaydet
            </Button>
          </>
        }
      >
        <div className="grid gap-4">
          <Field label="Ad Soyad">
            <Input
              value={editForm.name}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, name: e.target.value }))
              }
            />
          </Field>
          <Field label="E-posta">
            <Input
              type="email"
              value={editForm.email}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, email: e.target.value }))
              }
            />
          </Field>
          <Field label="Rol">
            <Select
              value={editForm.role}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, role: e.target.value as Role }))
              }
            >
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {ROLE_LABELS[role]}
                </option>
              ))}
            </Select>
          </Field>
          <Toggle
            checked={editForm.active}
            onChange={(v) => setEditForm((f) => ({ ...f, active: v }))}
            label="Hesap aktif"
          />
          <Field
            label="Yeni şifre"
            help="Boş bırakılırsa mevcut şifre değişmez."
          >
            <Input
              type="password"
              value={editForm.password}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, password: e.target.value }))
              }
              placeholder="••••••••"
            />
          </Field>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteUser !== null}
        onClose={() => setDeleteUser(null)}
        onConfirm={confirmDelete}
        title="Kullanıcıyı Sil"
        message={
          deleteUser
            ? `"${deleteUser.email}" kullanıcısı kalıcı olarak silinecek. Emin misiniz?`
            : ""
        }
      />
    </div>
  );
}
