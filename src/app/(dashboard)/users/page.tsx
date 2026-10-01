'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  X,
  Shield,
  Save,
} from 'lucide-react';
import { formatDateShort } from '@/lib/utils';

interface UserItem {
  id: string;
  username: string;
  name: string;
  role: string;
  createdAt: string;
  archiveCount: number;
}

export default function UsersPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<UserItem | null>(null);
  const [deleteUser, setDeleteUser] = useState<UserItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    username: '',
    password: '',
    name: '',
    role: 'STAFF',
  });

  // Redirect non-admin
  useEffect(() => {
    if (session && (session.user as any)?.role !== 'ADMIN') {
      router.push('/');
    }
  }, [session, router]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        setUsers(await res.json());
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditUser(null);
    setForm({ username: '', password: '', name: '', role: 'STAFF' });
    setError('');
    setShowModal(true);
  };

  const handleOpenEdit = (user: UserItem) => {
    setEditUser(user);
    setForm({
      username: user.username,
      password: '',
      name: user.name,
      role: user.role,
    });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      if (editUser) {
        // Update
        const body: any = { name: form.name, role: form.role };
        if (form.password) body.password = form.password;

        const res = await fetch(`/api/users/${editUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error);
        }
      } else {
        // Create
        if (!form.username || !form.password || !form.name) {
          throw new Error('Semua field wajib diisi');
        }

        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error);
        }
      }

      setShowModal(false);
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteUser) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${deleteUser.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      setDeleteUser(null);
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };



  if (loading) {
    return (
      <div className="loading-page">
        <div className="loading-spinner" />
        <span>Memuat data user...</span>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1 className="page-title">Kelola User</h1>
          <p className="page-subtitle">{users.length} user terdaftar</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={18} />
          Tambah User
        </button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Nama</th>
              <th>Username</th>
              <th>Role</th>
              <th>Arsip</th>
              <th>Tanggal Dibuat</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td style={{ fontWeight: 500 }}>{user.name}</td>
                <td style={{ color: 'var(--text-secondary)' }}>
                  {user.username}
                </td>
                <td>
                  <span
                    className={`badge ${user.role === 'ADMIN' ? 'badge-admin' : 'badge-staff'}`}
                  >
                    <Shield size={12} />
                    {user.role === 'ADMIN' ? 'Admin' : 'Staff'}
                  </span>
                </td>
                <td style={{ color: 'var(--text-secondary)' }}>
                  {user.archiveCount}
                </td>
                <td style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                  {formatDateShort(user.createdAt)}
                </td>
                <td>
                  <div className="table-actions">
                    <button
                      className="btn btn-ghost btn-icon"
                      onClick={() => handleOpenEdit(user)}
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="btn btn-ghost btn-icon"
                      onClick={() => {
                        setError('');
                        setDeleteUser(user);
                      }}
                      title="Hapus"
                      style={{ color: 'var(--danger-400)' }}
                      disabled={(session?.user as any)?.id === user.id}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => !saving && setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editUser ? 'Edit User' : 'Tambah User Baru'}
              </h2>
              <button
                className="btn btn-ghost btn-icon"
                onClick={() => setShowModal(false)}
                disabled={saving}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div className="alert alert-error">{error}</div>}

                <div className="form-group">
                  <label className="form-label">Nama Lengkap *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Masukkan nama lengkap"
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Username *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Masukkan username"
                    value={form.username}
                    onChange={(e) =>
                      setForm({ ...form, username: e.target.value })
                    }
                    required
                    disabled={!!editUser}
                    style={editUser ? { opacity: 0.6 } : {}}
                  />
                  {editUser && (
                    <div className="form-help">Username tidak dapat diubah</div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Password {editUser ? '(kosongkan jika tidak diubah)' : '*'}
                  </label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder={editUser ? 'Kosongkan jika tidak diubah' : 'Masukkan password'}
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    required={!editUser}
                    autoComplete="new-password"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Role *</label>
                  <select
                    className="form-select"
                    value={form.role}
                    onChange={(e) =>
                      setForm({ ...form, role: e.target.value })
                    }
                  >
                    <option value="STAFF">Staff</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="loading-spinner" style={{ width: '14px', height: '14px' }} />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      {editUser ? 'Simpan Perubahan' : 'Tambah User'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteUser && (
        <div className="modal-overlay" onClick={() => !saving && setDeleteUser(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-body" style={{ paddingTop: '32px' }}>
              <div className="confirm-icon danger">
                <AlertTriangle size={28} />
              </div>
              <h3 style={{ textAlign: 'center', marginBottom: '8px', fontSize: '18px', fontWeight: 700 }}>
                Hapus User?
              </h3>
              <p className="confirm-text">
                Anda akan menghapus user &ldquo;{deleteUser.name}&rdquo; ({deleteUser.username}).
                Tindakan ini tidak dapat dibatalkan.
              </p>
              {error && (
                <div className="alert alert-error" style={{ marginTop: '16px' }}>
                  {error}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setDeleteUser(null)}
                disabled={saving}
              >
                Batal
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={saving}
              >
                {saving ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
