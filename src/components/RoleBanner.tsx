import React from 'react';
import { UserRole, UserAccount } from '../types';
import { User, SearchCheck, Shield, Sparkles, Lock, Key } from 'lucide-react';

interface RoleBannerProps {
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  currentUser: UserAccount | null;
  onOpenLogin: (role?: UserRole) => void;
}

export const RoleBanner: React.FC<RoleBannerProps> = ({
  activeRole,
  setActiveRole,
  currentUser,
  onOpenLogin
}) => {
  const roleConfigs = {
    author: {
      title: 'Perspektif Akses: Penulis (Author)',
      description: 'Menyerahkan naskah artikel, memantau alur penerbitan, merespons catatan reviewer, dan menerima notifikasi email.',
      icon: <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
    },
    reviewer: {
      title: 'Perspektif Akses: Mitra Bestari (Reviewer)',
      description: 'Menelaah naskah yang ditugaskan, memberikan penilaian rubrik, menjalankan Gemini AI Peer Review, dan menyerahkan catatan evaluasi.',
      icon: <SearchCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
    },
    admin: {
      title: 'Perspektif Akses: Dewan Redaksi (Chief Editor)',
      description: 'Kendali penuh alur penerbitan, penugasan reviewer, keputusan redaksi, pembuatan akun pengguna, dan penerbitan terbitan jurnal.',
      icon: <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
    }
  };

  const current = roleConfigs[activeRole];

  return (
    <div className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-2.5 px-4 sm:px-8 text-xs text-slate-700 dark:text-slate-300">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            {current.icon}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <span className="font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {current.title}
            </span>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
            <span className="text-slate-500 dark:text-slate-400 text-xs">
              {current.description}
            </span>
          </div>
        </div>

        {/* User Login Status Badge */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {currentUser ? (
            <div className="bg-emerald-50 dark:bg-emerald-950/80 px-3 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Sesi Login: {currentUser.name} ({currentUser.role === 'admin' ? 'Chief Editor' : 'Reviewer'})
            </div>
          ) : activeRole !== 'author' ? (
            <button
              onClick={() => onOpenLogin(activeRole)}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3 py-1 rounded-xl text-[11px] flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Lock className="w-3 h-3" />
              Perlu Login {activeRole === 'admin' ? 'Editor' : 'Reviewer'}
            </button>
          ) : (
            <span className="text-[11px] text-slate-500 italic">Mode Publik / Penulis (Tanpa Login)</span>
          )}
        </div>
      </div>
    </div>
  );
};
