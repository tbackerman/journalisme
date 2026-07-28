import React, { useState, useEffect } from 'react';
import { Author, UserAccount } from '../types';
import {
  Upload,
  User,
  Plus,
  Trash2,
  FileText,
  CheckCircle2,
  Sparkles,
  Send,
  AlertCircle,
  BookOpen,
  Lock,
  LogIn,
  UserPlus,
  ShieldAlert
} from 'lucide-react';

interface SubmissionFormProps {
  currentUser: UserAccount | null;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onSubmitArticle: (data: {
    title: string;
    abstract: string;
    keywords: string[];
    discipline: string;
    authors: Author[];
    fullText: string;
    fileName?: string;
    fileSize?: string;
  }) => Promise<void>;
  onCancel: () => void;
}

export const SubmissionForm: React.FC<SubmissionFormProps> = ({
  currentUser,
  onOpenLogin,
  onOpenRegister,
  onSubmitArticle,
  onCancel
}) => {
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [discipline, setDiscipline] = useState('Informatika & Komputer');
  const [keywords, setKeywords] = useState('');
  const [fullText, setFullText] = useState('');
  const [fileName, setFileName] = useState('naskah_ilmiah_2026.pdf');
  const [fileSize, setFileSize] = useState('1.5 MB');

  // Authors List
  const [authors, setAuthors] = useState<Author[]>([
    {
      id: 'auth-1',
      name: currentUser ? currentUser.name : '',
      email: currentUser ? currentUser.email : '',
      institution: currentUser ? (currentUser.institution || 'Instansi Penulis') : '',
      isCorresponding: true
    }
  ]);

  useEffect(() => {
    if (currentUser) {
      setAuthors([
        {
          id: `auth-${currentUser.id}`,
          name: currentUser.name,
          email: currentUser.email,
          institution: currentUser.institution || 'Instansi Penulis',
          isCorresponding: true
        }
      ]);
    }
  }, [currentUser]);

  const handleAddAuthor = () => {
    setAuthors([
      ...authors,
      {
        id: `auth-${Date.now()}`,
        name: '',
        email: '',
        institution: '',
        isCorresponding: false
      }
    ]);
  };

  const handleRemoveAuthor = (index: number) => {
    if (authors.length <= 1) return;
    setAuthors(authors.filter((_, i) => i !== index));
  };

  const handleAuthorChange = (index: number, field: keyof Author, value: any) => {
    const updated = [...authors];
    updated[index] = { ...updated[index], [field]: value };
    setAuthors(updated);
  };

  const handleCorrespondingSelect = (index: number) => {
    const updated = authors.map((a, i) => ({
      ...a,
      isCorresponding: i === index
    }));
    setAuthors(updated);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setFileSize(`${(file.size / (1024 * 1024)).toFixed(2)} MB`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !abstract || authors.some(a => !a.name || !a.email)) {
      alert('Mohon lengkapi judul, abstrak, dan data seluruh penulis.');
      return;
    }

    setIsSubmitting(true);
    const splitKeywords = keywords.split(',').map(k => k.trim()).filter(Boolean);

    await onSubmitArticle({
      title,
      abstract,
      discipline,
      keywords: splitKeywords.length > 0 ? splitKeywords : ['Karya Ilmiah', 'Inovasi', 'Jurnal'],
      authors,
      fullText: fullText || `# ${title}\n\n## Abstrak\n${abstract}\n\n## 1. Pendahuluan\nNaskah ilmiah ini membahas inovasi dan studi teoritis...`,
      fileName,
      fileSize
    });

    setIsSubmitting(false);
  };

  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-6 animate-fade-in">
        <div className="w-16 h-16 bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold">
            <ShieldAlert className="w-3.5 h-3.5" />
            Otentikasi Penulis Diperlukan
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Penulis Wajib Login Terlebih Dahulu
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
            Sesuai standar tata kelola jurnal ilmiah terakreditasi, Anda <strong>wajib masuk (login) ke akun Penulis</strong> yang terverifikasi dan telah disetujui oleh Dewan Redaksi sebelum dapat mengunggah atau menyerahkan naskah karya ilmiah.
          </p>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-left text-xs space-y-2">
          <div className="font-bold text-slate-800 dark:text-slate-200">
            Alur Penyerahan Naskah Jurnal Nusantara:
          </div>
          <ol className="list-decimal list-inside space-y-1.5 text-slate-600 dark:text-slate-300 text-[11px]">
            <li>Daftar akun Penulis (Author) melalui tombol registrasi di bawah.</li>
            <li>Admin / Chief Editor memverifikasi dan menyetujui (Approve) pendaftaran Anda.</li>
            <li>Masuk (Login) ke akun Penulis Anda, lalu unggah naskah beserta data afiliasi lengkap.</li>
          </ol>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={onOpenLogin}
            className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-200 dark:shadow-indigo-950/50 transition-all flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            Masuk / Login Penulis
          </button>
          <button
            onClick={onOpenRegister}
            className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-200 dark:shadow-emerald-950/50 transition-all flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Daftar Akun Penulis Baru
          </button>
        </div>

        <div>
          <button
            onClick={onCancel}
            className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline"
          >
            Kembali ke Portal Beranda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
      {/* Header */}
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Upload className="w-6 h-6 text-indigo-600" />
          Online Article Submission
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Complete the manuscript submission details. Articles are immediately routed to initial editorial screening and Gemini AI review.
        </p>
      </div>

      {/* Wizard Progress Steps */}
      <div className="flex items-center justify-between text-xs font-semibold bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-400'}`}>
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>1</span>
          1. Manuscript Info
        </div>
        <span className="text-slate-300">•</span>
        <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-400'}`}>
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>2</span>
          2. Authors & Affiliations
        </div>
        <span className="text-slate-300">•</span>
        <div className={`flex items-center gap-1.5 ${step >= 3 ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-400'}`}>
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 3 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>3</span>
          3. Full Text & PDF
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                Judul Artikel Lengkap (Bahasa Indonesia / Inggris): *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Penerapan Algoritma Deep Learning untuk Deteksi Kerusakan Lahan Pertanian..."
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Rumpun / Bidang Ilmu: *
                </label>
                <select
                  value={discipline}
                  onChange={e => setDiscipline(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-semibold"
                >
                  <option value="Informatika & Komputer">Informatika & Komputer</option>
                  <option value="Pendidikan & Kebudayaan">Pendidikan & Kebudayaan</option>
                  <option value="Sains & Teknologi">Sains & Teknologi</option>
                  <option value="Ekonomi & Bisnis">Ekonomi & Bisnis</option>
                  <option value="Kesehatan & Kedokteran">Kesehatan & Kedokteran</option>
                  <option value="Hukum & Sosial">Hukum & Sosial</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Kata Kunci (Dipisahkan Koma): *
                </label>
                <input
                  type="text"
                  placeholder="contoh: Artificial Intelligence, IoT, Deep Learning, Klasifikasi"
                  value={keywords}
                  onChange={e => setKeywords(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                Abstrak Artikel (150 - 250 Kata): *
              </label>
              <textarea
                rows={6}
                required
                placeholder="Tuliskan latar belakang masalah, tujuan penelitian, metodologi yang digunakan, hasil temuan utama, dan kesimpulan ringkas..."
                value={abstract}
                onChange={e => setAbstract(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 leading-relaxed"
              ></textarea>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!title || !abstract}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-950/50"
              >
                Continue to Author Details &rarr;
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Authors */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                Daftar Penulis & Afiliasi Institusi
              </h3>
              <button
                type="button"
                onClick={handleAddAuthor}
                className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Penulis
              </button>
            </div>

            <div className="space-y-3">
              {authors.map((auth, idx) => (
                <div
                  key={auth.id || idx}
                  className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3"
                >
                  <div className="flex items-center justify-between font-bold text-slate-700 dark:text-slate-300">
                    <span>Penulis #{idx + 1} {auth.isCorresponding && '(Penulis Korespondensi)'}</span>
                    {authors.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveAuthor(idx)}
                        className="text-rose-600 hover:text-rose-700 text-xs flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Hapus
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 mb-1">Nama Lengkap & Gelar:</label>
                      <input
                        type="text"
                        required
                        placeholder="Dr. Ahmad Fauzi, M.T."
                        value={auth.name}
                        onChange={e => handleAuthorChange(idx, 'name', e.target.value)}
                        className="w-full p-2 bg-white dark:bg-slate-900 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 mb-1">Email Resmi / Kampus:</label>
                      <input
                        type="email"
                        required
                        placeholder="ahmad@univ.ac.id"
                        value={auth.email}
                        onChange={e => handleAuthorChange(idx, 'email', e.target.value)}
                        className="w-full p-2 bg-white dark:bg-slate-900 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 mb-1">Institusi / Universitas:</label>
                      <input
                        type="text"
                        required
                        placeholder="Universitas Indonesia"
                        value={auth.institution}
                        onChange={e => handleAuthorChange(idx, 'institution', e.target.value)}
                        className="w-full p-2 bg-white dark:bg-slate-900 border rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="radio"
                      id={`corr-${idx}`}
                      name="corresponding"
                      checked={auth.isCorresponding}
                      onChange={() => handleCorrespondingSelect(idx)}
                    />
                    <label htmlFor={`corr-${idx}`} className="text-[11px] text-slate-600 dark:text-slate-400 font-medium cursor-pointer">
                      Tandai sebagai Penulis Korespondensi (Penerima Notifikasi Email Status Jurnal)
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-medium"
              >
                &larr; Kembali
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all"
              >
                Lanjut ke File Naskah &rarr;
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Full Text & File */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                Unggah Berkas PDF / Dokumen Naskah Ilmiah:
              </label>
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 p-6 rounded-2xl text-center bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 transition-colors">
                <Upload className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="font-semibold text-slate-700 dark:text-slate-300">Pilih berkas PDF atau seret berkas ke sini</p>
                <p className="text-[11px] text-slate-400 mt-1">Format didukung: PDF, DOCX (Maksimal 10 MB)</p>
                <input
                  type="file"
                  accept=".pdf,.docx,.doc"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload-input"
                />
                <label
                  htmlFor="file-upload-input"
                  className="mt-3 inline-block px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-bold cursor-pointer hover:bg-emerald-500"
                >
                  Pilih File Dari Komputer
                </label>
                {fileName && (
                  <div className="mt-3 text-xs bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 p-2 rounded-lg font-mono inline-block">
                    File Terpilih: {fileName} ({fileSize})
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                Naskah Lengkap Teks/Markdown (Opsional - Untuk Analisis AI Presisi):
              </label>
              <textarea
                rows={6}
                placeholder="# 1. Pendahuluan&#10;Tuliskan teks lengkap naskah Anda di sini...&#10;&#10;# 2. Metodologi&#10;..."
                value={fullText}
                onChange={e => setFullText(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 leading-relaxed font-mono text-[11px]"
              ></textarea>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-950/50 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Dengan menekan tombol <strong>"Kirim Naskah Artikel"</strong>, naskah Anda akan langsung diproses ke sistem antrean <strong>Gemini AI Peer Review</strong> dan email konfirmasi akan terkirim secara otomatis.
              </span>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-medium"
              >
                &larr; Kembali
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-950 transition-all flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? 'Mengirim Naskah...' : 'Kirim Naskah Artikel Sekarang'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
