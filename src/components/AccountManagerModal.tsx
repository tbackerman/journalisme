import React, { useState, useEffect } from 'react';
import { UserAccount } from '../types';
import { UserPlus, Trash2, Users, Shield, SearchCheck, CheckCircle2, AlertCircle, X, Key, User } from 'lucide-react';

interface AccountManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const AccountManagerModal: React.FC<AccountManagerModalProps> = ({
  isOpen,
  onClose,
  showToast,
}) => {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // New account form state
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'reviewer' | 'admin'>('reviewer');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name || !username || !password) {
      setErrorMsg('Nama lengkap, username, dan password wajib diisi.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, username, password, email, role })
      });

      const data = await res.json();
      if (res.ok) {
        showToast(`Akun ${role === 'admin' ? 'Editor' : 'Reviewer'} "${username}" berhasil dibuat!`, 'success');
        setName('');
        setUsername('');
        setPassword('');
        setEmail('');
        await fetchUsers();
      } else {
        setErrorMsg(data.error || 'Gagal membuat akun.');
      }
    } catch (err) {
      setErrorMsg('Terjadi kesalahan server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (id: string, uname: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus akun "${uname}"?`)) return;

    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast(`Akun "${uname}" telah dihapus.`, 'info');
        await fetchUsers();
      }
    } catch (err) {
      showToast('Gagal menghapus akun.', 'error');
    }
  };

  const handleApproveAuthor = async (id: string, name: string) => {
    try {
      const res = await fetch(`/api/users/${id}/approve`, { method: 'PATCH' });
      if (res.ok) {
        showToast(`Pendaftaran Penulis "${name}" berhasil DISETUJUI! Email konfirmasi terkirim.`, 'success');
        await fetchUsers();
      }
    } catch (err) {
      showToast('Gagal menyetujui akun Penulis.', 'error');
    }
  };

  const handleRejectAuthor = async (id: string, name: string) => {
    if (!confirm(`Tolak pendaftaran akun Penulis "${name}"?`)) return;

    try {
      const res = await fetch(`/api/users/${id}/reject`, { method: 'PATCH' });
      if (res.ok) {
        showToast(`Pendaftaran Penulis "${name}" DITOLAK.`, 'info');
        await fetchUsers();
      }
    } catch (err) {
      showToast('Gagal menolak akun Penulis.', 'error');
    }
  };

  const pendingAuthors = users.filter(u => u.role === 'author' && u.approvalStatus === 'PENDING');
  const activeUsers = users.filter(u => u.approvalStatus !== 'PENDING');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
            <Users className="w-3.5 h-3.5" />
            Manajemen Pengguna & Hak Akses
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Kelola Akun Reviewer & Editor
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Admin/Chief Editor dapat membuatkan kredensial login untuk Mitra Bestari (Reviewer) dan Editor.
          </p>
        </div>

        {/* Create User Form Section */}
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-indigo-600" />
            Buat Akun Reviewer / Editor Baru
          </h3>

          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleCreateAccount} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                Nama Lengkap & Gelar *
              </label>
              <input
                type="text"
                placeholder="Contoh: Prof. Dr. Ir. Budi Santoso, M.Sc."
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                Email
              </label>
              <input
                type="email"
                placeholder="Contoh: budi.santoso@itb.ac.id"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                Username Login *
              </label>
              <input
                type="text"
                placeholder="Contoh: reviewer_budi"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                Password *
              </label>
              <input
                type="password"
                placeholder="Masukkan password baru"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                Peran Akses (Role) *
              </label>
              <div className="flex gap-3 pt-1">
                <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${role === 'reviewer' ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-md' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'}`}>
                  <input
                    type="radio"
                    name="userRole"
                    value="reviewer"
                    checked={role === 'reviewer'}
                    onChange={() => setRole('reviewer')}
                    className="sr-only"
                  />
                  <SearchCheck className="w-4 h-4" />
                  Mitra Bestari (Reviewer)
                </label>

                <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${role === 'admin' ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-md' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'}`}>
                  <input
                    type="radio"
                    name="userRole"
                    value="admin"
                    checked={role === 'admin'}
                    onChange={() => setRole('admin')}
                    className="sr-only"
                  />
                  <Shield className="w-4 h-4" />
                  Chief Editor / Admin
                </label>
              </div>
            </div>

            <div className="sm:col-span-2 pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 dark:shadow-indigo-950/50 transition-all flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                {isLoading ? 'Menyimpan Akun Baru...' : 'Buat Akun Sekarang'}
              </button>
            </div>
          </form>
        </div>

        {/* Pending Author Approval Requests */}
        {pendingAuthors.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-950/60 border-2 border-amber-300 dark:border-amber-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                Permohonan Pendaftaran Penulis Baru ({pendingAuthors.length})
              </h3>
              <span className="bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full text-[10px] font-bold animate-pulse">
                Persetujuan Diperlukan
              </span>
            </div>

            <div className="space-y-2">
              {pendingAuthors.map(pa => (
                <div
                  key={pa.id}
                  className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-amber-200 dark:border-amber-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{pa.name}</span>
                      <span className="text-[10px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full font-bold">
                        {pa.institution || 'Instansi/Universitas'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-1 flex flex-wrap gap-2">
                      <span>Username: <strong>{pa.username}</strong></span>
                      <span>•</span>
                      <span>Email: <strong>{pa.email}</strong></span>
                      {pa.phone && <span>• Telp: {pa.phone}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => handleApproveAuthor(pa.id, pa.name)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-sm transition-all"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      ACC / Disetujui
                    </button>
                    <button
                      onClick={() => handleRejectAuthor(pa.id, pa.name)}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-sm transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                      Tolak
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Existing Accounts List */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              Daftar Akun Terdaftar & Disetujui ({activeUsers.length})
            </span>
          </h3>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
            {activeUsers.map(u => (
              <div key={u.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl text-white font-bold ${u.role === 'admin' ? 'bg-indigo-600' : u.role === 'author' ? 'bg-emerald-600' : 'bg-slate-800'}`}>
                    {u.role === 'admin' ? <Shield className="w-4 h-4" /> : u.role === 'author' ? <User className="w-4 h-4" /> : <SearchCheck className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{u.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${u.role === 'admin' ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300' : u.role === 'author' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
                        {u.role === 'admin' ? 'Chief Editor' : u.role === 'author' ? 'Penulis' : 'Reviewer'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5 flex flex-wrap gap-2">
                      <span>Username: <strong>{u.username}</strong></span>
                      <span>•</span>
                      <span>Password: <strong>{u.password || '******'}</strong></span>
                      <span>•</span>
                      <span>{u.email}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteUser(u.id, u.username)}
                  className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors self-end sm:self-auto text-xs flex items-center gap-1 font-semibold"
                  title="Hapus akun"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Hapus
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
