import React, { useState, useEffect } from 'react';
import { HeaderNav } from './components/HeaderNav';
import { RoleBanner } from './components/RoleBanner';
import { PublicPortal } from './components/PublicPortal';
import { PublicationDashboard } from './components/PublicationDashboard';
import { SubmissionForm } from './components/SubmissionForm';
import { AIPeerReviewLab } from './components/AIPeerReviewLab';
import { EmailNotificationCenter } from './components/EmailNotificationCenter';
import { ArticleDetailModal } from './components/ArticleDetailModal';
import { CitationModal } from './components/CitationModal';
import { LoginModal } from './components/LoginModal';
import { AccountManagerModal } from './components/AccountManagerModal';
import { RegisterModal } from './components/RegisterModal';
import { TemplateManagerModal } from './components/TemplateManagerModal';
import { Article, ArticleStatus, EmailNotification, JournalVolume, UserRole, UserAccount } from './types';
import { CheckCircle2, Sparkles, Mail, AlertCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'portal' | 'dashboard' | 'submit' | 'ai-lab' | 'email-center'>('portal');
  const [activeRole, setActiveRole] = useState<UserRole>('author');

  // Auth User State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('jurnal_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [loginTargetRole, setLoginTargetRole] = useState<UserRole | null>(null);
  const [isAccountManagerOpen, setIsAccountManagerOpen] = useState(false);
  const [isTemplateManagerOpen, setIsTemplateManagerOpen] = useState(false);

  const [articles, setArticles] = useState<Article[]>([]);
  const [volumes, setVolumes] = useState<JournalVolume[]>([]);
  const [notifications, setNotifications] = useState<EmailNotification[]>([]);

  const [selectedArticleForDetail, setSelectedArticleForDetail] = useState<Article | null>(null);
  const [selectedArticleForCitation, setSelectedArticleForCitation] = useState<Article | null>(null);

  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Show auto-dismissing toast
  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Sync role when user changes
  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    localStorage.setItem('jurnal_user', JSON.stringify(user));

    if (user.role === 'admin') {
      setActiveRole('admin');
    } else if (user.role === 'reviewer') {
      setActiveRole('reviewer');
    }

    showToast(`Berhasil login sebagai ${user.name} (${user.role === 'admin' ? 'Chief Editor' : 'Reviewer'})!`, 'success');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('jurnal_user');
    setActiveRole('author');
    showToast('Sesi login telah diakhiri. Kembali ke mode Penulis.', 'info');
  };

  const handleOpenLogin = (role?: UserRole) => {
    setLoginTargetRole(role || null);
    setIsLoginModalOpen(true);
  };

  // Fetch initial data from server API
  const fetchData = async () => {
    try {
      const [artRes, notifRes] = await Promise.all([
        fetch('/api/articles'),
        fetch('/api/notifications')
      ]);

      if (artRes.ok) {
        const artData = await artRes.json();
        setArticles(artData.articles || []);
        setVolumes(artData.volumes || []);
      }

      if (notifRes.ok) {
        const notifData = await notifRes.json();
        setNotifications(notifData.notifications || []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handler: Submit new article
  const handleSubmitArticle = async (data: {
    title: string;
    abstract: string;
    keywords: string[];
    discipline: string;
    authors: any[];
    fullText: string;
    fileName?: string;
    fileSize?: string;
  }) => {
    try {
      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        await fetchData();
        showToast('Naskah artikel berhasil diserahkan! Email konfirmasi telah dikirim ke penulis.', 'success');
        setActiveTab('dashboard');
      } else {
        showToast('Gagal menyerahkan naskah artikel.', 'error');
      }
    } catch (err) {
      showToast('Terjadi kesalahan server.', 'error');
    }
  };

  // Handler: Update Status (Admin or Editorial decision)
  const handleUpdateStatus = async (articleId: string, newStatus: ArticleStatus, notes?: string) => {
    try {
      const changerName = currentUser ? currentUser.name : 'Sistem Redaksi';
      const res = await fetch(`/api/articles/${articleId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          notes,
          changedBy: changerName
        })
      });

      if (res.ok) {
        await fetchData();
        showToast(`Status berhasil diubah menjadi ${newStatus}. Notifikasi email terkirim ke Penulis!`, 'success');
      }
    } catch (err) {
      showToast('Gagal mengubah status naskah.', 'error');
    }
  };

  // Handler: Run AI Peer Review via Gemini
  const handleRunAIPeerReview = async (articleId: string) => {
    setIsLoadingAi(true);
    try {
      const res = await fetch(`/api/articles/${articleId}/peer-review/ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (res.ok) {
        await fetchData();
        showToast('Evaluasi Gemini AI Peer Review berhasil diselesaikan!', 'success');
        if (activeTab !== 'ai-lab') {
          setActiveTab('ai-lab');
        }
      } else {
        showToast('Gagal menjalankan AI Peer Review.', 'error');
      }
    } catch (err) {
      showToast('Terjadi kesalahan jaringan.', 'error');
    } finally {
      setIsLoadingAi(false);
    }
  };

  // Handler: Submit Human Peer Review
  const handleSubmitHumanReview = async (articleId: string, reviewData: any) => {
    try {
      const reviewerName = currentUser ? `${currentUser.name} (Mitra Bestari)` : 'Mitra Bestari Terverifikasi';
      const res = await fetch(`/api/articles/${articleId}/peer-review/human`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...reviewData,
          reviewerName
        })
      });

      if (res.ok) {
        await fetchData();
        showToast('Ulasan Mitra Bestari berhasil disimpan.', 'success');
      }
    } catch (err) {
      showToast('Gagal menyimpan ulasan.', 'error');
    }
  };

  // Handler: Submit Author Revision
  const handleSubmitRevision = async (articleId: string, revisionNotes: string) => {
    try {
      const res = await fetch(`/api/articles/${articleId}/revision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ revisionNotes })
      });

      if (res.ok) {
        await fetchData();
        showToast('Revisi naskah berhasil dikirimkan ke dewan redaksi!', 'success');
      }
    } catch (err) {
      showToast('Gagal mengirimkan revisi.', 'error');
    }
  };

  // Handler: Mark notification as read
  const handleMarkNotifRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
      await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // Handler: Send Custom Notification
  const handleSendCustomNotification = async (data: any) => {
    try {
      const res = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        await fetchData();
        showToast('Email notifikasi khusus berhasil dikirimkan!', 'success');
      }
    } catch (err) {
      showToast('Gagal mengirimkan email.', 'error');
    }
  };

  // Handler: Simulated PDF download
  const handleDownloadPdf = (article: Article) => {
    fetch(`/api/articles/${article.id}/metric`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'downloads' })
    }).catch(() => {});

    const element = document.createElement('a');
    const file = new Blob([article.fullText], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = article.fileName || `artikel_${article.id}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    showToast(`Mengunduh berkas ${article.fileName || 'naskah.pdf'}...`, 'info');
  };

  const unreadEmailCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col selection:bg-indigo-600 selection:text-white">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-bounce">
          {toastMessage.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
          {toastMessage.type === 'info' && <Mail className="w-5 h-5 text-indigo-400 shrink-0" />}
          {toastMessage.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
          <span className="text-xs font-semibold leading-tight">{toastMessage.text}</span>
        </div>
      )}

      {/* Navigation Header */}
      <HeaderNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        unreadEmailCount={unreadEmailCount}
        currentUser={currentUser}
        onOpenLogin={handleOpenLogin}
        onOpenRegister={() => setIsRegisterModalOpen(true)}
        onLogout={handleLogout}
        onOpenAccountManager={() => setIsAccountManagerOpen(true)}
        onOpenTemplateManager={() => setIsTemplateManagerOpen(true)}
      />

      {/* Role Banner Indicator */}
      <RoleBanner
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        currentUser={currentUser}
        onOpenLogin={handleOpenLogin}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'portal' && (
          <PublicPortal
            articles={articles}
            volumes={volumes}
            onSelectArticle={art => setSelectedArticleForDetail(art)}
            onOpenCitationModal={art => setSelectedArticleForCitation(art)}
            onSubmitNewClick={() => setActiveTab('submit')}
          />
        )}

        {activeTab === 'dashboard' && (
          <PublicationDashboard
            articles={articles}
            activeRole={activeRole}
            onSelectArticle={art => setSelectedArticleForDetail(art)}
            onUpdateStatus={handleUpdateStatus}
            onRunAIPeerReview={handleRunAIPeerReview}
            onSubmitHumanReview={handleSubmitHumanReview}
            onSubmitRevision={handleSubmitRevision}
            isLoadingAi={isLoadingAi}
          />
        )}

        {activeTab === 'submit' && (
          <SubmissionForm
            currentUser={currentUser}
            onOpenLogin={() => handleOpenLogin('author')}
            onOpenRegister={() => setIsRegisterModalOpen(true)}
            onSubmitArticle={handleSubmitArticle}
            onCancel={() => setActiveTab('portal')}
          />
        )}

        {activeTab === 'ai-lab' && (
          <AIPeerReviewLab
            articles={articles}
            onRunAIPeerReview={handleRunAIPeerReview}
            isLoadingAi={isLoadingAi}
          />
        )}

        {activeTab === 'email-center' && (
          <EmailNotificationCenter
            notifications={notifications}
            onMarkAsRead={handleMarkNotifRead}
            onSendCustomNotification={handleSendCustomNotification}
          />
        )}
      </main>

      {/* Modals */}
      {selectedArticleForDetail && (
        <ArticleDetailModal
          article={selectedArticleForDetail}
          onClose={() => setSelectedArticleForDetail(null)}
          onOpenCitationModal={art => {
            setSelectedArticleForDetail(null);
            setSelectedArticleForCitation(art);
          }}
          onDownloadPdf={handleDownloadPdf}
        />
      )}

      {selectedArticleForCitation && (
        <CitationModal
          article={selectedArticleForCitation}
          onClose={() => setSelectedArticleForCitation(null)}
        />
      )}

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        onOpenRegister={() => setIsRegisterModalOpen(true)}
        targetRole={loginTargetRole}
      />

      {/* Register Modal for Author */}
      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onOpenLogin={() => {
          setIsRegisterModalOpen(false);
          setIsLoginModalOpen(true);
        }}
        showToast={showToast}
      />

      {/* Account Manager Modal for Chief Editor */}
      <AccountManagerModal
        isOpen={isAccountManagerOpen}
        onClose={() => setIsAccountManagerOpen(false)}
        showToast={showToast}
      />

      {/* Template Kop & Footer Manager Modal */}
      <TemplateManagerModal
        isOpen={isTemplateManagerOpen}
        onClose={() => setIsTemplateManagerOpen(false)}
        showToast={showToast}
      />

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-8 text-xs mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <p className="font-bold text-slate-200">
              Jurnal Nusantara © 2026 — Platform Publikasi Jurnal Ilmiah
            </p>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <a href="#portal" onClick={() => setActiveTab('portal')} className="hover:text-indigo-400">Portal Publik</a>
            <span>•</span>
            <a href="#dashboard" onClick={() => setActiveTab('dashboard')} className="hover:text-indigo-400">Status Publikasi</a>
            <span>•</span>
            <a href="#ai" onClick={() => setActiveTab('ai-lab')} className="hover:text-indigo-400">Gemini AI Reviewer</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
