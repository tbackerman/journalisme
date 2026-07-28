import React, { useState } from 'react';
import { Article, ArticleStatus, UserRole } from '../types';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  FileText,
  Bot,
  User,
  Shield,
  Search,
  Sparkles,
  ChevronRight,
  Send,
  Eye,
  History,
  Award,
  Layers,
  ArrowRight,
  MessageSquare
} from 'lucide-react';

interface PublicationDashboardProps {
  articles: Article[];
  activeRole: UserRole;
  onSelectArticle: (article: Article) => void;
  onUpdateStatus: (articleId: string, newStatus: ArticleStatus, notes?: string) => Promise<void>;
  onRunAIPeerReview: (articleId: string) => Promise<void>;
  onSubmitHumanReview: (articleId: string, reviewData: any) => Promise<void>;
  onSubmitRevision: (articleId: string, revisionNotes: string) => Promise<void>;
  isLoadingAi: boolean;
}

export const PublicationDashboard: React.FC<PublicationDashboardProps> = ({
  articles,
  activeRole,
  onSelectArticle,
  onUpdateStatus,
  onRunAIPeerReview,
  onSubmitHumanReview,
  onSubmitRevision,
  isLoadingAi,
}) => {
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticleForAction, setSelectedArticleForAction] = useState<Article | null>(null);
  const [actionType, setActionType] = useState<'status' | 'human-review' | 'revision' | 'history' | null>(null);

  // Form states
  const [statusChangeTarget, setStatusChangeTarget] = useState<ArticleStatus>('UNDER_REVIEW');
  const [statusChangeNotes, setStatusChangeNotes] = useState('');
  const [revisionNotesText, setRevisionNotesText] = useState('');

  // Human review form states
  const [originalityScore, setOriginalityScore] = useState(8);
  const [methodologyScore, setMethodologyScore] = useState(8);
  const [clarityScore, setClarityScore] = useState(8);
  const [overallScore, setOverallScore] = useState(8);
  const [recommendation, setRecommendation] = useState<'ACCEPT' | 'MINOR_REVISION' | 'MAJOR_REVISION' | 'REJECT'>('MINOR_REVISION');
  const [summaryComments, setSummaryComments] = useState('');

  // Filtering articles based on role
  const displayedArticles = articles.filter(art => {
    const matchesSearch =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.authors.some(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      selectedStatusFilter === 'ALL' || art.status === selectedStatusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: ArticleStatus) => {
    switch (status) {
      case 'DRAFT':
        return <span className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700 text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1"><Clock className="w-3 h-3" /> Draf</span>;
      case 'SUBMITTED':
        return <span className="bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1"><Send className="w-3 h-3" /> Diserahkan</span>;
      case 'INITIAL_SCREENING':
        return <span className="bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1"><Clock className="w-3 h-3" /> Skrining Awal</span>;
      case 'UNDER_REVIEW':
        return <span className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1 animate-pulse"><Sparkles className="w-3 h-3 text-indigo-500" /> Peer Review</span>;
      case 'REVISION_REQUIRED':
        return <span className="bg-orange-50 text-orange-700 dark:bg-orange-950/80 dark:text-orange-300 border border-orange-200 dark:border-orange-800 text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Revisi Diperlukan</span>;
      case 'REVISED':
        return <span className="bg-teal-50 text-teal-700 dark:bg-teal-950/80 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Revisi Dikirim</span>;
      case 'ACCEPTED':
        return <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1"><Award className="w-3 h-3" /> Diterima (Accepted)</span>;
      case 'PUBLISHED':
        return <span className="bg-emerald-600 text-white text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 shadow-sm"><CheckCircle2 className="w-3 h-3" /> Diterbitkan</span>;
      case 'REJECTED':
        return <span className="bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1"><XCircle className="w-3 h-3" /> Ditolak</span>;
      default:
        return null;
    }
  };

  // Pipeline status steps
  const pipelineSteps: { key: ArticleStatus; label: string }[] = [
    { key: 'SUBMITTED', label: '1. Diserahkan' },
    { key: 'INITIAL_SCREENING', label: '2. Skrining Editor' },
    { key: 'UNDER_REVIEW', label: '3. Peer Review' },
    { key: 'REVISION_REQUIRED', label: '4. Revisi' },
    { key: 'ACCEPTED', label: '5. Diterima' },
    { key: 'PUBLISHED', label: '6. Diterbitkan' },
  ];

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedArticleForAction) return;
    await onUpdateStatus(selectedArticleForAction.id, statusChangeTarget, statusChangeNotes);
    setSelectedArticleForAction(null);
    setActionType(null);
    setStatusChangeNotes('');
  };

  const handleHumanReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedArticleForAction) return;

    await onSubmitHumanReview(selectedArticleForAction.id, {
      reviewerName: activeRole === 'admin' ? 'Dr. Hendra (Editor in Chief)' : 'Prof. Budi Santoso (Mitra Bestari)',
      score: {
        originality: Number(originalityScore),
        methodology: Number(methodologyScore),
        clarity: Number(clarityScore),
        academicImpact: Number(overallScore),
        overall: Number(overallScore),
      },
      recommendation,
      summaryComments,
      strengths: ['Analisis terfokus', 'Metode sesuai kebutuhan'],
      weaknesses: ['Perlu perbaikan struktur penulisan pada beberapa bagian'],
      detailedFeedback: [],
    });

    setSelectedArticleForAction(null);
    setActionType(null);
    setSummaryComments('');
  };

  const handleRevisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedArticleForAction) return;
    await onSubmitRevision(selectedArticleForAction.id, revisionNotesText);
    setSelectedArticleForAction(null);
    setActionType(null);
    setRevisionNotesText('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Overview Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Publication Overview</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Tracking {articles.length} active submissions in the automated workflow engine
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700">
            Workflow: Active
          </span>
        </div>
      </div>

      {/* Sleek Stats Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Incoming</p>
          <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
            {articles.filter(a => a.status === 'SUBMITTED' || a.status === 'INITIAL_SCREENING').length}
          </h3>
          <p className="text-[10px] text-indigo-500 font-bold mt-2">↑ awaiting screening</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">In Peer Review</p>
          <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
            {articles.filter(a => a.status === 'UNDER_REVIEW').length}
          </h3>
          <p className="text-[10px] text-amber-500 font-bold mt-2">● Gemini AI matched</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Revisions</p>
          <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
            {articles.filter(a => a.status === 'REVISION_REQUIRED' || a.status === 'REVISED').length}
          </h3>
          <p className="text-[10px] text-slate-500 font-bold mt-2">Avg. 14 days response</p>
        </div>

        <div className="bg-indigo-600 p-5 rounded-2xl shadow-xl shadow-indigo-200 dark:shadow-indigo-950/50 text-white">
          <p className="text-xs font-bold text-indigo-100 uppercase tracking-wider mb-2">Finalized</p>
          <h3 className="text-3xl font-bold text-white">
            {articles.filter(a => a.status === 'ACCEPTED' || a.status === 'PUBLISHED').length}
          </h3>
          <p className="text-[10px] text-indigo-200 font-bold mt-2">Ready for publication</p>
        </div>
      </div>

      {/* Visual Pipeline Flow Legend */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-md">
        <div className="text-xs font-semibold text-slate-400 mb-3 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Publication Pipeline Workflow:
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-center text-xs">
          {pipelineSteps.map((step, idx) => (
            <div key={step.key} className="bg-slate-800/90 p-2.5 rounded-xl border border-slate-700/80 flex flex-col justify-between">
              <span className="font-bold text-indigo-400">{step.label}</span>
              <span className="text-[10px] text-slate-400 mt-1">
                {idx === 0 && 'Naskah dikirim'}
                {idx === 1 && 'Cek format & kelayakan'}
                {idx === 2 && 'AI + Human Review'}
                {idx === 3 && 'Tanggapan Penulis'}
                {idx === 4 && 'Disetujui Redaksi'}
                {idx === 5 && 'Terbit + DOI'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search manuscripts by title, keyword, or author..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1">
          {['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'REVISION_REQUIRED', 'ACCEPTED', 'PUBLISHED'].map(st => (
            <button
              key={st}
              onClick={() => setSelectedStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                selectedStatusFilter === st
                  ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-200 dark:shadow-indigo-950/50'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {st === 'ALL' ? 'Semua' : st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Table / Cards List */}
      <div className="space-y-4">
        {displayedArticles.map(article => (
          <div
            key={article.id}
            className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-4"
          >
            {/* Top row: Status Badge & ID */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-400">#{article.id}</span>
                {getStatusBadge(article.status)}
                <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded">
                  {article.discipline}
                </span>
              </div>
              <span className="text-xs text-slate-400">
                Dikirim: {new Date(article.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>

            {/* Title & Author */}
            <div>
              <h3
                onClick={() => onSelectArticle(article)}
                className="text-base font-bold text-slate-900 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer transition-colors"
              >
                {article.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Penulis Utama: <span className="font-semibold text-slate-700 dark:text-slate-300">{article.authors[0]?.name}</span> ({article.authors[0]?.institution})
              </p>
            </div>

            {/* Assigned Reviewers & Peer Review Summary */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/60 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-emerald-500" />
                  Status Penelaahan Mitra Bestari:
                </span>
                <span className="text-slate-500 text-[11px]">
                  {article.peerReviews.length} Ulasan Tersimpan
                </span>
              </div>

              {article.peerReviews.length === 0 ? (
                <p className="text-slate-400 italic text-[11px]">
                  Belum ada laporan peer review. {activeRole !== 'author' && 'Tekan tombol "Jalankan Gemini AI Peer Review" untuk analisis instan.'}
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {article.peerReviews.map(rev => (
                    <div key={rev.id} className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                          {rev.reviewerRole === 'AI_GEMINI' ? (
                            <span className="text-indigo-500 font-bold flex items-center gap-0.5">
                              <Sparkles className="w-3 h-3" /> Gemini AI
                            </span>
                          ) : (
                            <span className="text-emerald-600 font-bold">{rev.reviewerName}</span>
                          )}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded font-bold ${
                          rev.recommendation === 'ACCEPT' ? 'bg-emerald-100 text-emerald-800' :
                          rev.recommendation === 'MINOR_REVISION' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {rev.recommendation}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 line-clamp-2">"{rev.summaryComments}"</p>
                      <div className="flex items-center gap-2 text-slate-400 text-[10px] font-mono">
                        <span>Skor Keaslian: {rev.score.originality}/10</span>
                        <span>•</span>
                        <span>Metode: {rev.score.methodology}/10</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons Toolbar per Role */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onSelectArticle(article)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" /> Detail Naskah
                </button>

                <button
                  onClick={() => {
                    setSelectedArticleForAction(article);
                    setActionType('history');
                  }}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors flex items-center gap-1"
                >
                  <History className="w-3.5 h-3.5" /> Riwayat Status
                </button>
              </div>

              {/* Role-Specific Actions */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Admin / Reviewer ACC & Reject Quick Action Toolbar */}
                {(activeRole === 'admin' || activeRole === 'reviewer') && (
                  <>
                    <button
                      onClick={() => {
                        setSelectedArticleForAction(article);
                        setStatusChangeTarget('ACCEPTED');
                        setActionType('status');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-sm transition-colors flex items-center gap-1"
                      title="ACC / Setujui Artikel ini untuk diterbitkan"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      ACC / Setujui
                    </button>

                    <button
                      onClick={() => {
                        setSelectedArticleForAction(article);
                        setStatusChangeTarget('REJECTED');
                        setActionType('status');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-sm transition-colors flex items-center gap-1"
                      title="Tolak Artikel ini"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Tolak Artikel
                    </button>
                  </>
                )}

                {/* AI Review Trigger for Reviewer & Admin */}
                {(activeRole === 'admin' || activeRole === 'reviewer') && (
                  <button
                    onClick={() => onRunAIPeerReview(article.id)}
                    disabled={isLoadingAi}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    {isLoadingAi ? 'Memproses AI Review...' : 'AI Review'}
                  </button>
                )}

                {/* Human Review Trigger for Reviewer & Admin */}
                {(activeRole === 'admin' || activeRole === 'reviewer') && (
                  <button
                    onClick={() => {
                      setSelectedArticleForAction(article);
                      setActionType('human-review');
                    }}
                    className="px-3 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950 font-medium transition-colors flex items-center gap-1"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Review Manual
                  </button>
                )}

                {/* Admin Status Change */}
                {activeRole === 'admin' && (
                  <button
                    onClick={() => {
                      setSelectedArticleForAction(article);
                      setStatusChangeTarget(article.status);
                      setActionType('status');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold shadow-sm transition-colors flex items-center gap-1"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    Ubah Status Redaksi
                  </button>
                )}

                {/* Author Revision Submit */}
                {activeRole === 'author' && article.status === 'REVISION_REQUIRED' && (
                  <button
                    onClick={() => {
                      setSelectedArticleForAction(article);
                      setActionType('revision');
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold shadow-sm transition-colors flex items-center gap-1.5 animate-bounce"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Kirim Revisi Naskah
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Modals */}

      {/* 1. Admin Change Status Modal */}
      {actionType === 'status' && selectedArticleForAction && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-500" />
              Kelola Status Redaksi & Notifikasi Email
            </h3>
            <p className="text-xs text-slate-500">
              Artikel: <span className="font-semibold text-slate-700 dark:text-slate-300">"{selectedArticleForAction.title}"</span>
            </p>

            <form onSubmit={handleStatusSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Pilih Status Baru:
                </label>
                <select
                  value={statusChangeTarget}
                  onChange={e => setStatusChangeTarget(e.target.value as ArticleStatus)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-semibold"
                >
                  <option value="SUBMITTED">1. SUBMITTED (Diserahkan)</option>
                  <option value="INITIAL_SCREENING">2. INITIAL_SCREENING (Skrining Awal Editor)</option>
                  <option value="UNDER_REVIEW">3. UNDER_REVIEW (Memasuki Peer Review)</option>
                  <option value="REVISION_REQUIRED">4. REVISION_REQUIRED (Minta Revisi ke Penulis)</option>
                  <option value="ACCEPTED">5. ACCEPTED (Diterima Dipublikasikan)</option>
                  <option value="PUBLISHED">6. PUBLISHED (Terbitkan Resmi ke Volume Jurnal)</option>
                  <option value="REJECTED">7. REJECTED (Ditolak)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Catatan Redaksi / Reviewer (Akan disertakan dalam Email Notifikasi Penulis):
                </label>
                <textarea
                  rows={3}
                  placeholder="Tuliskan catatan arahan revisi atau keputusan dewan redaksi..."
                  value={statusChangeNotes}
                  onChange={e => setStatusChangeNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                ></textarea>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/50 p-3 rounded-xl border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  Sistem akan secara otomatis mengirimkan <strong>Email Notifikasi Resmi</strong> ke email penulis ({selectedArticleForAction.authors[0]?.email}) saat status disimpan.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActionType(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-md"
                >
                  Simpan Status & Kirim Email
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Human Peer Review Form Modal */}
      {actionType === 'human-review' && selectedArticleForAction && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-600" />
              Form Penilaian Peer Review Manual
            </h3>

            <form onSubmit={handleHumanReviewSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Skor Keaslian (1-10):</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={originalityScore}
                    onChange={e => setOriginalityScore(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Skor Metodologi (1-10):</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={methodologyScore}
                    onChange={e => setMethodologyScore(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Rekomendasi Keputusan:</label>
                <select
                  value={recommendation}
                  onChange={e => setRecommendation(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
                >
                  <option value="ACCEPT">ACCEPT (Diterima Langsung)</option>
                  <option value="MINOR_REVISION">MINOR_REVISION (Revisi Ringan)</option>
                  <option value="MAJOR_REVISION">MAJOR_REVISION (Revisi Mayor)</option>
                  <option value="REJECT">REJECT (Ditolak)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Ulasan & Catatan Kritis Reviewer:</label>
                <textarea
                  rows={4}
                  required
                  value={summaryComments}
                  onChange={e => setSummaryComments(e.target.value)}
                  placeholder="Sampaikan ulasan kritis mengenai kelebihan, kekurangan, dan bagian yang wajib direvisi penulis..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActionType(null)}
                  className="px-4 py-2 rounded-xl border"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold"
                >
                  Kirim Penilaian Reviewer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Author Revision Modal */}
      {actionType === 'revision' && selectedArticleForAction && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Send className="w-5 h-5 text-orange-600" />
              Kirim Tanggapan & Revisi Naskah
            </h3>

            <form onSubmit={handleRevisionSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Catatan Perubahan Revisi (Matrix Respons Reviewer):
                </label>
                <textarea
                  rows={4}
                  required
                  value={revisionNotesText}
                  onChange={e => setRevisionNotesText(e.target.value)}
                  placeholder="Jelaskan bagian apa saja yang telah diperbaiki sesuai masukan reviewer..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActionType(null)}
                  className="px-4 py-2 rounded-xl border"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-600 text-white font-bold"
                >
                  Kirim Revisi Naskah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. History Drawer */}
      {actionType === 'history' && selectedArticleForAction && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-600" />
              Riwayat Perubahan Status Naskah
            </h3>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1 text-xs">
              {selectedArticleForAction.history.map((hist, idx) => (
                <div key={hist.id || idx} className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-emerald-600 dark:text-emerald-400">{hist.status}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(hist.changedAt).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">Aktor: {hist.changedBy}</p>
                  {hist.notes && <p className="text-slate-500 italic">"{hist.notes}"</p>}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActionType(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
