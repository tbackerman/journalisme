import React, { useState } from 'react';
import { Article, JournalVolume } from '../types';
import {
  Search,
  Filter,
  BookOpen,
  Eye,
  Download,
  Share2,
  ExternalLink,
  FileText,
  Quote,
  Check,
  Award,
  Sparkles,
  Layers,
  Building
} from 'lucide-react';

interface PublicPortalProps {
  articles: Article[];
  volumes: JournalVolume[];
  onSelectArticle: (article: Article) => void;
  onOpenCitationModal: (article: Article) => void;
  onSubmitNewClick: () => void;
}

export const PublicPortal: React.FC<PublicPortalProps> = ({
  articles,
  volumes,
  onSelectArticle,
  onOpenCitationModal,
  onSubmitNewClick
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('ALL');
  const [selectedVolumeId, setSelectedVolumeId] = useState<string>('ALL');
  const [copiedDoiId, setCopiedDoiId] = useState<string | null>(null);

  const publishedArticles = articles.filter(a => a.status === 'PUBLISHED');

  const disciplines = [
    'ALL',
    'Informatika & Komputer',
    'Pendidikan & Kebudayaan',
    'Sains & Teknologi',
    'Ekonomi & Bisnis',
    'Kesehatan & Kedokteran',
    'Hukum & Sosial'
  ];

  const filteredArticles = publishedArticles.filter(art => {
    const matchesSearch =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.abstract.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.authors.some(a => a.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      art.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDiscipline =
      selectedDiscipline === 'ALL' || art.discipline === selectedDiscipline;

    const matchesVolume =
      selectedVolumeId === 'ALL' ||
      (selectedVolumeId === 'vol-5-issue-2' && art.volume?.includes('Vol. 5 No. 2')) ||
      (selectedVolumeId === 'vol-5-issue-1' && art.volume?.includes('Vol. 5 No. 1'));

    return matchesSearch && matchesDiscipline && matchesVolume;
  });

  const handleCopyDoi = (doi: string, id: string) => {
    navigator.clipboard.writeText(`https://doi.org/${doi}`);
    setCopiedDoiId(id);
    setTimeout(() => setCopiedDoiId(null), 2000);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Header Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-6 sm:p-10 border border-slate-800 text-white shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Jurnal Ilmiah Terbuka (Open Access Journal)
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Mendorong Inovasi Sains & Teknologi Terapan Nusantara
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Platform penerbitan karya ilmiah berkala nasional & internasional yang dilengkapi dengan sistem 
            <span className="text-emerald-400 font-semibold"> Peer Review Otomatis Gemini AI</span> untuk memastikan kecepatan evaluasi, objektivitas, dan standar kualitas akademis tertinggi.
          </p>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/60 text-center">
              <div className="text-xl font-bold text-emerald-400">2.84</div>
              <div className="text-[11px] text-slate-400">Impact Factor</div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/60 text-center">
              <div className="text-xl font-bold text-amber-400">Terakreditasi</div>
              <div className="text-[11px] text-slate-400">Akreditasi Dikti</div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/60 text-center">
              <div className="text-xl font-bold text-indigo-400">24 Jam</div>
              <div className="text-[11px] text-slate-400">Rata-rata AI Review</div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/60 text-center">
              <div className="text-xl font-bold text-teal-400">100%</div>
              <div className="text-[11px] text-slate-400">Open Access PDF</div>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onSubmitNewClick}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold text-white text-sm shadow-lg shadow-emerald-950 transition-all flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Kirim Naskah Artikel Sekarang
            </button>
            <a
              href="#artikel-terbit"
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 font-medium text-slate-200 text-sm transition-all"
            >
              Jelajahi Terbitan Terbaru
            </a>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Search & Filter Controls */}
      <div id="artikel-terbit" className="space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari kata kunci, judul artikel, abstrak, atau nama penulis..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 placeholder-slate-400"
            />
          </div>

          {/* Volume Filter Selector */}
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-500 shrink-0" />
            <select
              value={selectedVolumeId}
              onChange={e => setSelectedVolumeId(e.target.value)}
              className="text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">Semua Terbitan (All Issues)</option>
              {volumes.map(vol => (
                <option key={vol.id} value={vol.id}>
                  Vol. {vol.volumeNumber} No. {vol.issueNumber} ({vol.month} {vol.year})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Discipline Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-xs font-semibold text-slate-500 shrink-0 flex items-center gap-1 pl-1">
            <Filter className="w-3.5 h-3.5" /> Rumpun Ilmu:
          </span>
          {disciplines.map(disc => (
            <button
              key={disc}
              onClick={() => setSelectedDiscipline(disc)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                selectedDiscipline === disc
                  ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {disc === 'ALL' ? 'Semua Bidang' : disc}
            </button>
          ))}
        </div>
      </div>

      {/* Published Articles List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            Artikel Ilmiah Terbitan Resmi
            <span className="text-xs bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-full font-bold">
              {filteredArticles.length} Artikel
            </span>
          </h2>
        </div>

        {filteredArticles.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-3">
            <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
            <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">
              Tidak ada artikel yang cocok dengan pencarian
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Coba gunakan kata kunci lain atau ubah filter rumpun ilmu dan terbitan volume jurnal.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredArticles.map(article => (
              <div
                key={article.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow space-y-4"
              >
                {/* Header Metadata Badges */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800/60">
                      {article.discipline}
                    </span>
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs px-2.5 py-1 rounded-md font-mono">
                      {article.volume || 'Vol. 5 No. 2 (2026)'}
                    </span>
                    <span className="bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-xs font-medium px-2 py-0.5 rounded">
                      Open Access
                    </span>
                  </div>

                  {article.doi && (
                    <button
                      onClick={() => handleCopyDoi(article.doi!, article.id)}
                      className="text-xs font-mono text-slate-500 hover:text-emerald-600 flex items-center gap-1 transition-colors"
                      title="Klik untuk menyalin URL DOI"
                    >
                      <span>DOI: {article.doi}</span>
                      {copiedDoiId === article.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Share2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>

                {/* Article Title */}
                <h3
                  onClick={() => onSelectArticle(article)}
                  className="text-lg font-bold text-slate-900 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer leading-snug transition-colors"
                >
                  {article.title}
                </h3>

                {/* Authors List */}
                <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-600 dark:text-slate-400 font-medium">
                  {article.authors.map((auth, idx) => (
                    <span key={auth.id || idx} className="flex items-center gap-1">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{auth.name}</span>
                      <span className="text-slate-400 text-[10px]">({auth.institution})</span>
                      {auth.isCorresponding && (
                        <span className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 px-1 rounded" title="Penulis Korespondensi">
                          *
                        </span>
                      )}
                      {idx < article.authors.length - 1 && <span className="text-slate-300 ml-1">•</span>}
                    </span>
                  ))}
                </div>

                {/* Abstract Preview */}
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                  {article.abstract}
                </p>

                {/* Keywords Tags */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-slate-400 font-medium mr-1">Kata Kunci:</span>
                  {article.keywords.map((kw, i) => (
                    <span
                      key={i}
                      className="text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700"
                    >
                      {kw}
                    </span>
                  ))}
                </div>

                {/* Footer Metrics & Action Buttons */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs">
                  {/* Article Metrics */}
                  <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      {article.metrics?.views || 102} Pembaca
                    </span>
                    <span className="flex items-center gap-1">
                      <Download className="w-3.5 h-3.5 text-slate-400" />
                      {article.metrics?.downloads || 48} Unduhan
                    </span>
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                      <Quote className="w-3.5 h-3.5" />
                      {article.metrics?.citations || 0} Sitasi
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenCitationModal(article)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 font-medium"
                    >
                      <Quote className="w-3.5 h-3.5" />
                      Kutip APA/IEEE
                    </button>

                    <button
                      onClick={() => onSelectArticle(article)}
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-sm transition-colors flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Baca Artikel & PDF
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
