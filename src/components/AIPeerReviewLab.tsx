import React, { useState } from 'react';
import { Article, PeerReview } from '../types';
import {
  Sparkles,
  Bot,
  CheckCircle2,
  AlertCircle,
  XCircle,
  FileText,
  BarChart2,
  Award,
  BookOpen,
  RefreshCw,
  Printer,
  ChevronRight,
  ShieldAlert,
  Send
} from 'lucide-react';

interface AIPeerReviewLabProps {
  articles: Article[];
  onRunAIPeerReview: (articleId: string) => Promise<void>;
  isLoadingAi: boolean;
}

export const AIPeerReviewLab: React.FC<AIPeerReviewLabProps> = ({
  articles,
  onRunAIPeerReview,
  isLoadingAi,
}) => {
  const [selectedArticleId, setSelectedArticleId] = useState<string>(
    articles[0]?.id || ''
  );

  const selectedArticle = articles.find(a => a.id === selectedArticleId) || articles[0];
  const latestAiReview: PeerReview | undefined = selectedArticle?.peerReviews.find(
    r => r.reviewerRole === 'AI_GEMINI'
  ) || selectedArticle?.peerReviews[0];

  const handleRunAi = async () => {
    if (!selectedArticleId) return;
    await onRunAIPeerReview(selectedArticleId);
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800';
    if (score >= 6) return 'text-amber-600 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800';
    return 'text-rose-600 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800';
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Lab Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Gemini 3.6 Flash Engine
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Sistem Peer Review Otomatis Berbasis AI
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Teknologi penelaahan karya ilmiah cerdas yang mengevaluasi struktur naskah, ketajaman metodologi, keaslian gagasan, dan potensi dampak ilmiah secara real-time.
            </p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80 text-xs space-y-2 w-full sm:w-auto">
            <div className="font-bold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Standar Reviewer Terakreditasi
            </div>
            <p className="text-slate-400 text-[11px]">
              Menghasilkan skor rubrik 5 kriteria, ulasan kritis, matriks revisi, dan estimasi keaslian.
            </p>
          </div>
        </div>
      </div>

      {/* Select Article & Run AI Trigger Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex-1 space-y-1">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Pilih Naskah Artikel untuk Diuji dengan Gemini AI:
          </label>
          <select
            value={selectedArticleId}
            onChange={e => setSelectedArticleId(e.target.value)}
            className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100"
          >
            {articles.map(art => (
              <option key={art.id} value={art.id}>
                #{art.id} - {art.title} ({art.status})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleRunAi}
          disabled={isLoadingAi}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 disabled:opacity-50 text-white font-extrabold text-xs shadow-lg shadow-indigo-950 transition-all flex items-center justify-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isLoadingAi ? 'animate-spin' : ''}`} />
          {isLoadingAi ? 'Gemini AI Sedang Menganalisis Naskah...' : 'Jalankan Evaluasi AI Peer Review'}
        </button>
      </div>

      {/* Loading Overlay State */}
      {isLoadingAi && (
        <div className="bg-slate-900 text-white rounded-2xl p-8 border border-slate-800 text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin mx-auto"></div>
          <h3 className="text-base font-bold text-indigo-300">
            Gemini AI Sedang Membaca & Menganalisis Artikel Ilmiah...
          </h3>
          <div className="max-w-md mx-auto text-xs text-slate-400 space-y-1 font-mono">
            <p>✓ Memeriksa kesesuaian abstrak dengan rumusan masalah...</p>
            <p>✓ Menganalisis metodologi penelitian & pengolahan data...</p>
            <p>✓ Mengevaluasi keaslian & estimasi tingkat kemiripan...</p>
            <p className="text-emerald-400 animate-pulse">⚡ Menghasilkan rubrik skor & catatan perbaikan...</p>
          </div>
        </div>
      )}

      {/* Peer Review Result Cards View */}
      {selectedArticle && latestAiReview && !isLoadingAi && (
        <div className="space-y-6">
          {/* Recommendation Banner */}
          <div className={`rounded-2xl p-5 border shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
            latestAiReview.recommendation === 'ACCEPT'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
              : latestAiReview.recommendation === 'MINOR_REVISION' || latestAiReview.recommendation === 'MAJOR_REVISION'
              ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-100'
              : 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-100'
          }`}>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider opacity-80">Rekomendasi Keputusan Reviewer:</span>
                <span className="px-3 py-1 rounded-full font-black text-xs uppercase bg-white/80 dark:bg-slate-900/80 shadow-sm">
                  {latestAiReview.recommendation.replace('_', ' ')}
                </span>
              </div>
              <h3 className="text-base font-bold">
                "{selectedArticle.title}"
              </h3>
            </div>

            <div className="text-right shrink-0">
              <div className="text-2xl font-black">{latestAiReview.score.overall} / 10</div>
              <div className="text-[11px] opacity-80">Skor Keseluruhan (Overall Score)</div>
            </div>
          </div>

          {/* 5-Metric Score Rubrik Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className={`p-4 rounded-xl border text-center ${getScoreColor(latestAiReview.score.originality)}`}>
              <div className="text-2xl font-black">{latestAiReview.score.originality}/10</div>
              <div className="text-[11px] font-bold mt-1">Keaslian & Kebaruan</div>
            </div>
            <div className={`p-4 rounded-xl border text-center ${getScoreColor(latestAiReview.score.methodology)}`}>
              <div className="text-2xl font-black">{latestAiReview.score.methodology}/10</div>
              <div className="text-[11px] font-bold mt-1">Ketajaman Metodologi</div>
            </div>
            <div className={`p-4 rounded-xl border text-center ${getScoreColor(latestAiReview.score.clarity)}`}>
              <div className="text-2xl font-black">{latestAiReview.score.clarity}/10</div>
              <div className="text-[11px] font-bold mt-1">Struktur & Kejelasan</div>
            </div>
            <div className={`p-4 rounded-xl border text-center ${getScoreColor(latestAiReview.score.academicImpact)}`}>
              <div className="text-2xl font-black">{latestAiReview.score.academicImpact}/10</div>
              <div className="text-[11px] font-bold mt-1">Dampak Keilmuan</div>
            </div>
            <div className="p-4 rounded-xl border text-center bg-teal-50 dark:bg-teal-950/60 border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-200">
              <div className="text-2xl font-black">{latestAiReview.plagiarismEstimatePercent || 5}%</div>
              <div className="text-[11px] font-bold mt-1">Indeks Kemiripan (Similarity)</div>
            </div>
          </div>

          {/* Summary Comments Box */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Bot className="w-4 h-4 text-emerald-600" />
              Ulasan Kritis Reviewer (Executive Summary Review)
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              "{latestAiReview.summaryComments}"
            </p>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Keunggulan Utama Naskah (Strengths)
              </h4>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                {latestAiReview.strengths?.map((st, i) => (
                  <li key={i} className="flex items-start gap-2 bg-emerald-50/50 dark:bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-100 dark:border-emerald-900/50">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{st}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" /> Kelemahan & Hal Perlu Diperbaiki (Weaknesses)
              </h4>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                {latestAiReview.weaknesses?.map((wk, i) => (
                  <li key={i} className="flex items-start gap-2 bg-amber-50/50 dark:bg-amber-950/30 p-2.5 rounded-lg border border-amber-100 dark:border-amber-900/50">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{wk}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Detailed Section-by-Section Matrix */}
          {latestAiReview.detailedFeedback && latestAiReview.detailedFeedback.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                Matriks Catatan Perbaikan Per Bagian (Sectional Feedback Matrix)
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 font-bold">
                      <th className="p-3 w-1/4">Bagian Naskah</th>
                      <th className="p-3 w-2/4">Kritik & Catatan Penelaahan</th>
                      <th className="p-3 w-1/4">Saran Tindakan Revisi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {latestAiReview.detailedFeedback.map((fb, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">{fb.section}</td>
                        <td className="p-3 text-slate-700 dark:text-slate-300">{fb.comment}</td>
                        <td className="p-3 text-indigo-600 dark:text-indigo-400 font-medium">{fb.recommendation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
