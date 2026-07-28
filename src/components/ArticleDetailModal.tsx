import React, { useState } from 'react';
import { Article } from '../types';
import {
  FileText,
  Download,
  Quote,
  Eye,
  X,
  Share2,
  ExternalLink,
  Bot,
  CheckCircle2,
  Building,
  User,
  Sparkles,
  BookOpen
} from 'lucide-react';

interface ArticleDetailModalProps {
  article: Article;
  onClose: () => void;
  onOpenCitationModal: (article: Article) => void;
  onDownloadPdf: (article: Article) => void;
}

export const ArticleDetailModal: React.FC<ArticleDetailModalProps> = ({
  article,
  onClose,
  onOpenCitationModal,
  onDownloadPdf,
}) => {
  const [activeViewTab, setActiveViewTab] = useState<'abstract' | 'pdf-reader' | 'peer-reviews'>('abstract');

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 my-auto max-h-[90vh] overflow-y-auto">
        {/* Header Bar */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-semibold px-2.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                {article.discipline}
              </span>
              <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-0.5 rounded font-mono">
                {article.volume || 'Vol. 5 No. 2 (2026)'}
              </span>
              <span className="text-xs text-emerald-600 font-bold">Open Access</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 leading-snug">
              {article.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Authors Info */}
        <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
          <div className="font-bold text-slate-700 dark:text-slate-300">Penulis & Afiliasi Institusi:</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {article.authors.map((auth, idx) => (
              <div key={auth.id || idx} className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  {auth.name} {auth.isCorresponding && <span className="text-amber-500 font-bold" title="Penulis Korespondensi">*</span>}
                </div>
                <div className="text-slate-500 text-[11px] mt-0.5 flex items-center gap-1">
                  <Building className="w-3 h-3 text-slate-400" />
                  {auth.institution}
                </div>
                <div className="text-slate-400 text-[10px] font-mono">{auth.email}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs: Abstrak vs Reader vs Reviews */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveViewTab('abstract')}
            className={`pb-2.5 px-3 transition-all border-b-2 ${
              activeViewTab === 'abstract'
                ? 'border-emerald-600 text-emerald-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Abstrak & Meta
          </button>
          <button
            onClick={() => setActiveViewTab('pdf-reader')}
            className={`pb-2.5 px-3 transition-all border-b-2 ${
              activeViewTab === 'pdf-reader'
                ? 'border-emerald-600 text-emerald-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Pratinjau Naskah PDF
          </button>
          <button
            onClick={() => setActiveViewTab('peer-reviews')}
            className={`pb-2.5 px-3 transition-all border-b-2 ${
              activeViewTab === 'peer-reviews'
                ? 'border-emerald-600 text-emerald-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Laporan Peer Review ({article.peerReviews.length})
          </button>
        </div>

        {/* Content based on active tab */}
        {activeViewTab === 'abstract' && (
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Abstrak (Abstract)</h3>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-justify">
                {article.abstract}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="font-bold text-slate-500 text-xs">Kata Kunci:</span>
              {article.keywords.map((kw, i) => (
                <span key={i} className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-md text-xs font-medium border border-slate-200 dark:border-slate-700">
                  {kw}
                </span>
              ))}
            </div>

            {article.doi && (
              <div className="bg-emerald-50 dark:bg-emerald-950/60 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 font-mono">
                <strong>DOI Resmi Artikel:</strong> https://doi.org/{article.doi}
              </div>
            )}
          </div>
        )}

        {activeViewTab === 'pdf-reader' && (
          <div className="space-y-4">
            <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
              <span className="font-mono flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                {article.fileName || 'naskah_ilmiah_2026.pdf'} ({article.fileSize || '1.8 MB'})
              </span>
              <button
                onClick={() => onDownloadPdf(article)}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-bold flex items-center gap-1 shadow"
              >
                <Download className="w-3.5 h-3.5" /> Unduh PDF Ref
              </button>
            </div>

            <div className="bg-slate-950 text-slate-200 p-6 rounded-2xl border border-slate-800 font-mono text-xs max-h-96 overflow-y-auto whitespace-pre-wrap leading-relaxed shadow-inner">
              {article.fullText}
            </div>
          </div>
        )}

        {activeViewTab === 'peer-reviews' && (
          <div className="space-y-4 text-xs">
            {article.peerReviews.length === 0 ? (
              <p className="text-slate-400 italic text-center py-6">Belum ada ulasan peer review untuk naskah ini.</p>
            ) : (
              article.peerReviews.map((rev, idx) => (
                <div key={rev.id || idx} className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      {rev.reviewerRole === 'AI_GEMINI' ? (
                        <span className="text-indigo-600 font-bold flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" /> Gemini AI Peer Reviewer
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-bold">{rev.reviewerName}</span>
                      )}
                    </span>
                    <span className="font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px]">
                      {rev.recommendation}
                    </span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 italic">"{rev.summaryComments}"</p>
                  <div className="flex items-center gap-3 text-slate-500 text-[10px] font-mono pt-1">
                    <span>Keaslian: {rev.score.originality}/10</span>
                    <span>Metodologi: {rev.score.methodology}/10</span>
                    <span>Keseluruhan: {rev.score.overall}/10</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Footer Toolbar */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-slate-500">
            Metrics: {article.metrics.views} Views • {article.metrics.downloads} Downloads
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenCitationModal(article)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100"
            >
              <Quote className="w-3.5 h-3.5 inline mr-1" />
              Format Kutipan
            </button>

            <button
              onClick={() => onDownloadPdf(article)}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-sm flex items-center gap-1.5"
            >
              <Download className="w-3 h-3" />
              Unduh PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
