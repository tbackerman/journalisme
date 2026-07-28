import React, { useState } from 'react';
import { UserAccount } from '../types';
import { Lock, User, Key, ShieldCheck, X, AlertCircle, Sparkles } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserAccount) => void;
  onOpenRegister?: () => void;
  targetRole?: 'reviewer' | 'admin' | null;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onOpenRegister,
  targetRole
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!username || !password) {
      setErrorMsg('Username dan password wajib diisi');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (res.ok) {
        onLoginSuccess(data.user);
        onClose();
      } else {
        setErrorMsg(data.error || 'Login gagal. Periksa username dan password.');
      }
    } catch (err) {
      setErrorMsg('Terjadi kesalahan koneksi server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl relative space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-indigo-950/50 font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Otentikasi Login System
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {targetRole === 'admin'
                ? 'Akses terbatas untuk Chief Editor & Dewan Redaksi.'
                : targetRole === 'reviewer'
                ? 'Akses terbatas untuk Mitra Bestari (Peer Reviewer).'
                : 'Masuk dengan kredensial yang dibuat oleh Pengelola Jurnal.'}
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Masukkan username Anda..."
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="Masukkan password Anda..."
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-200 dark:shadow-indigo-950/50 transition-all flex items-center justify-center gap-2"
          >
            <Key className="w-4 h-4" />
            {isLoading ? 'Memverifikasi...' : 'Masuk ke Sistem'}
          </button>
        </form>

        {/* Quick Fill / Presets for Demo */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Akun Bawaan (Uji Coba Cepat):
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickFill('admin', 'admin123')}
              className="p-2.5 text-left rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <div className="font-bold text-slate-800 dark:text-slate-200">Editor / Admin</div>
              <div className="text-[10px] text-slate-500 font-mono">admin / admin123</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('reviewer1', 'reviewer123')}
              className="p-2.5 text-left rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <div className="font-bold text-slate-800 dark:text-slate-200">Reviewer 1</div>
              <div className="text-[10px] text-slate-500 font-mono">reviewer1 / reviewer123</div>
            </button>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            *Admin/Chief Editor dapat menambahkan username & password Reviewer/Editor baru di menu <strong>Kelola Akun</strong>.
          </p>

          {onOpenRegister && (
            <div className="pt-2 text-center text-xs text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
              Belum memiliki akun Penulis?{' '}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenRegister();
                }}
                className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Daftar Penulis Baru
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
