import React from 'react';
import {
  BookOpen,
  FileText,
  Upload,
  Sparkles,
  Mail,
  Shield,
  User,
  SearchCheck,
  BarChart2,
  LogIn,
  LogOut,
  Users,
  Lock
} from 'lucide-react';
import { UserRole, UserAccount } from '../types';

interface HeaderNavProps {
  activeTab: 'portal' | 'dashboard' | 'submit' | 'ai-lab' | 'email-center';
  setActiveTab: (tab: 'portal' | 'dashboard' | 'submit' | 'ai-lab' | 'email-center') => void;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  unreadEmailCount: number;
  currentUser: UserAccount | null;
  onOpenLogin: (role?: UserRole) => void;
  onOpenRegister: () => void;
  onLogout: () => void;
  onOpenAccountManager: () => void;
  onOpenTemplateManager: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  activeTab,
  setActiveTab,
  activeRole,
  setActiveRole,
  unreadEmailCount,
  currentUser,
  onOpenLogin,
  onOpenRegister,
  onLogout,
  onOpenAccountManager,
  onOpenTemplateManager,
}) => {
  const handleRoleSelect = (role: UserRole) => {
    if (role === 'author') {
      setActiveRole('author');
      return;
    }

    // Require login for reviewer or admin
    if (!currentUser) {
      onOpenLogin(role);
      return;
    }

    // Check if user has required role or admin role
    if (role === 'reviewer' && currentUser.role !== 'reviewer' && currentUser.role !== 'admin') {
      onOpenLogin('reviewer');
      return;
    }

    if (role === 'admin' && currentUser.role !== 'admin') {
      onOpenLogin('admin');
      return;
    }

    setActiveRole(role);
  };

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 shadow-sm">
      {/* Top Bar with ISSN & User Session Bar */}
      <div className="bg-slate-50 dark:bg-slate-950 px-4 sm:px-8 py-2 text-[11px] text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800/80 flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Terakreditasi Nasional (p-ISSN: 2829-109X | e-ISSN: 2829-1107)
          </span>
          <span className="hidden sm:inline text-slate-300 dark:text-slate-700">|</span>
          <span className="hidden sm:inline text-slate-500">Indexing: Crossref, Google Scholar, Garuda, DOAJ</span>
        </div>

        {/* User Auth Info Bar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {currentUser ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/80 px-2.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold">
                <User className="w-3 h-3 text-indigo-600" />
                <span>{currentUser.name}</span>
                <span className="text-[10px] bg-indigo-600 text-white px-1.5 py-0.2 rounded-full uppercase">
                  {currentUser.role === 'admin' ? 'Editor' : currentUser.role === 'author' ? 'Penulis' : 'Reviewer'}
                </span>
              </div>

              {currentUser.role === 'admin' && (
                <>
                  <button
                    onClick={onOpenTemplateManager}
                    className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/80 hover:bg-amber-100 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 rounded-full font-bold text-[10px] flex items-center gap-1 transition-colors"
                    title="Kelola Template Kop Surat & Footer Jurnal (.DOCX)"
                  >
                    <FileText className="w-3 h-3 text-amber-600" />
                    Template Kop & Footer
                  </button>

                  <button
                    onClick={onOpenAccountManager}
                    className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-full font-semibold text-[10px] flex items-center gap-1 transition-colors"
                    title="Kelola Akun Reviewer, Editor, & Persetujuan Penulis"
                  >
                    <Users className="w-3 h-3 text-indigo-600" />
                    Kelola Akun
                  </button>
                </>
              )}

              <button
                onClick={onLogout}
                className="px-2 py-1 hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-600 dark:text-rose-400 rounded-full font-semibold text-[10px] flex items-center gap-1 transition-colors border border-rose-200 dark:border-rose-800"
                title="Keluar dari sesi"
              >
                <LogOut className="w-3 h-3" />
                Keluar
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenRegister}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-full text-[11px] flex items-center gap-1.5 shadow-sm transition-all"
              >
                <User className="w-3 h-3" />
                Daftar Penulis
              </button>

              <button
                onClick={() => onOpenLogin()}
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-full text-[11px] flex items-center gap-1.5 shadow-sm transition-all"
              >
                <LogIn className="w-3 h-3" />
                Login Akun
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between">
          <button
            onClick={() => setActiveTab('portal')}
            className="flex items-center gap-3 text-left group"
          >
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-indigo-950/40 group-hover:scale-105 transition-transform text-white font-bold text-xl">
              Σ
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-800 dark:text-white">
                Jurnal Nusantara
              </h1>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
                Scientific Publication Engine
              </p>
            </div>
          </button>

          {/* Role Switcher Pill for Mobile */}
          <div className="md:hidden flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => handleRoleSelect('author')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                activeRole === 'author' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500'
              }`}
            >
              Penulis
            </button>
            <button
              onClick={() => handleRoleSelect('reviewer')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 ${
                activeRole === 'reviewer' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500'
              }`}
            >
              {!currentUser && <Lock className="w-2.5 h-2.5" />}
              Reviewer
            </button>
            <button
              onClick={() => handleRoleSelect('admin')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 ${
                activeRole === 'admin' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500'
              }`}
            >
              {!currentUser && <Lock className="w-2.5 h-2.5" />}
              Editor
            </button>
          </div>
        </div>

        {/* Primary Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none text-xs font-semibold">
          <button
            onClick={() => setActiveTab('portal')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'portal'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-950/50 font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Portal Publik
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-950/50 font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            Workflow & Status
          </button>

          <button
            onClick={() => setActiveTab('submit')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'submit'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-950/50 font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Upload className="w-4 h-4" />
            Submit Naskah
          </button>

          <button
            onClick={() => setActiveTab('ai-lab')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'ai-lab'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-950/50 font-bold'
                : 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            Gemini AI Review
          </button>

          <button
            onClick={() => setActiveTab('email-center')}
            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'email-center'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-950/50 font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Mail className="w-4 h-4" />
            Notifikasi
            {unreadEmailCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                {unreadEmailCount}
              </span>
            )}
          </button>
        </nav>

        {/* Role Switcher (Desktop) */}
        <div className="hidden md:flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
          <span className="text-slate-400 font-semibold px-2 text-[10px] uppercase tracking-wider">
            Mode Akses:
          </span>
          <button
            onClick={() => handleRoleSelect('author')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all ${
              activeRole === 'author'
                ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
            title="Peran Penulis: Submit artikel & pantau status"
          >
            <User className="w-3.5 h-3.5" />
            Penulis
          </button>

          <button
            onClick={() => handleRoleSelect('reviewer')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all ${
              activeRole === 'reviewer'
                ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
            title="Peran Reviewer: Perlu Login dengan Akun Reviewer"
          >
            {(!currentUser || (currentUser.role !== 'reviewer' && currentUser.role !== 'admin')) && (
              <Lock className="w-3 h-3 text-amber-500" />
            )}
            <SearchCheck className="w-3.5 h-3.5" />
            Reviewer
          </button>

          <button
            onClick={() => handleRoleSelect('admin')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all ${
              activeRole === 'admin'
                ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
            title="Peran Chief Editor: Perlu Login dengan Akun Editor"
          >
            {(!currentUser || currentUser.role !== 'admin') && (
              <Lock className="w-3 h-3 text-amber-500" />
            )}
            <Shield className="w-3.5 h-3.5" />
            Chief Editor
          </button>
        </div>
      </div>
    </header>
  );
};
