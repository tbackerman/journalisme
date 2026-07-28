import React, { useState, useEffect } from 'react';
import { KopFooterTemplate } from '../types';
import { FileText, Plus, CheckCircle2, Trash2, Download, Sparkles, X, AlertCircle, Building2, Globe } from 'lucide-react';

interface TemplateManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const TemplateManagerModal: React.FC<TemplateManagerModalProps> = ({
  isOpen,
  onClose,
  showToast
}) => {
  const [templates, setTemplates] = useState<KopFooterTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // New Template Form
  const [templateName, setTemplateName] = useState('');
  const [journalTitle, setJournalTitle] = useState('JURNAL NUSANTARA: Scientific Journal');
  const [kopHeaderTitle, setKopHeaderTitle] = useState('DEWAN REDAKSI & PENGELOLA JURNAL ILMIAH');
  const [kopSubHeader, setKopSubHeader] = useState('PUSAT PUBLIKASI AKADEMIK & TEKNOLOGI INFORMASI');
  const [addressInfo, setAddressInfo] = useState('Jl. Riset Nasional No. 10, Jakarta | Telp: (021) 555-1234 | Email: redaksi@jurnalnusantara.org');
  const [issnText, setISSNText] = useState('p-ISSN: 2829-109X | e-ISSN: 2829-1107 | Crossref DOI Prefix: 10.31219/jn');
  const [footerText, setFooterText] = useState('Diterbitkan oleh Jurnal Nusantara di bawah Lisensi Creative Commons Attribution 4.0 International (CC BY 4.0)');
  const [docxFileName, setDocxFileName] = useState('Template_Kop_Footer_Resmi.docx');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/templates/kop-footer');
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.templates || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!templateName || !journalTitle || !kopHeaderTitle) {
      setErrorMsg('Nama Template, Judul Jurnal, dan Kop Header wajib diisi.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/templates/kop-footer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateName,
          journalTitle,
          kopHeaderTitle,
          kopSubHeader,
          addressInfo,
          issnText,
          footerText,
          docxTemplateFileName: docxFileName
        })
      });

      if (res.ok) {
        showToast('Template Kop & Footer Word/DOCX berhasil ditambahkan!', 'success');
        setTemplateName('');
        await fetchTemplates();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Gagal menyimpan template');
      }
    } catch (err) {
      setErrorMsg('Terjadi kesalahan jaringan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivate = async (id: string, name: string) => {
    try {
      const res = await fetch(`/api/templates/kop-footer/${id}/activate`, { method: 'PATCH' });
      if (res.ok) {
        showToast(`Template "${name}" telah diaktifkan!`, 'success');
        await fetchTemplates();
      }
    } catch (err) {
      showToast('Gagal mengaktifkan template.', 'error');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus template "${name}"?`)) return;

    try {
      const res = await fetch(`/api/templates/kop-footer/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast(`Template "${name}" berhasil dihapus.`, 'info');
        await fetchTemplates();
      }
    } catch (err) {
      showToast('Gagal menghapus template.', 'error');
    }
  };

  const activeTemplate = templates.find(t => t.isActive) || templates[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
            <FileText className="w-3.5 h-3.5" />
            Kelola Kop Header & Footer Word (.DOCX)
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Template Kop & Footer Jurnal Resmi
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Admin dapat menambah, menyunting, dan mengatur template Kop Surat & Footer resmi (format DOCX/Word) yang diacu oleh Penulis, Editor, dan Reviewer.
          </p>
        </div>

        {/* Live Preview of Active Template Kop Surat */}
        {activeTemplate && (
          <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border-2 border-dashed border-indigo-200 dark:border-indigo-900/60 space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Preatinjau Kop Surat & Footer Aktif: {activeTemplate.templateName}
              </span>
              <span className="bg-emerald-500 text-white px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider">
                Aktif Digunakan
              </span>
            </div>

            {/* Simulated DOCX Kop Header */}
            <div className="bg-white text-slate-900 p-6 rounded-xl shadow-md border border-slate-200 space-y-3 font-serif">
              {/* Header Logos & Title */}
              <div className="text-center space-y-1 border-b-4 border-double border-slate-900 pb-3">
                <div className="text-sm font-bold tracking-wider uppercase text-slate-900">
                  {activeTemplate.kopHeaderTitle}
                </div>
                <div className="text-xs font-bold text-slate-800 uppercase">
                  {activeTemplate.kopSubHeader}
                </div>
                <div className="text-base font-extrabold text-indigo-900 uppercase tracking-tight font-sans pt-1">
                  {activeTemplate.journalTitle}
                </div>
                <div className="text-[10px] text-slate-600 font-sans italic">
                  {activeTemplate.addressInfo}
                </div>
                <div className="text-[10px] text-slate-800 font-bold font-sans">
                  {activeTemplate.issnText}
                </div>
              </div>

              {/* Sample Content Body snippet */}
              <div className="py-2 text-[11px] text-slate-400 font-sans text-center italic">
                --- [ Isi Naskah Artikel Scientific Paper Penulis ] ---
              </div>

              {/* Footer text preview */}
              <div className="border-t border-slate-300 pt-2 text-[9px] text-slate-500 font-sans text-center">
                {activeTemplate.footerText}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-slate-500 text-[11px] font-mono">
                File Template Word: <strong>{activeTemplate.docxTemplateFileName}</strong>
              </span>
              <button
                onClick={() => {
                  const blob = new Blob([
                    `${activeTemplate.kopHeaderTitle}\n${activeTemplate.kopSubHeader}\n${activeTemplate.journalTitle}\n${activeTemplate.addressInfo}\n${activeTemplate.issnText}\n\nFOOTER:\n${activeTemplate.footerText}`
                  ], { type: 'application/msword' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = activeTemplate.docxTemplateFileName || 'Template_Kop_Footer.docx';
                  a.click();
                  showToast('Mengunduh berkas template DOCX Word...', 'info');
                }}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow"
              >
                <Download className="w-3.5 h-3.5" />
                Unduh File Template DOCX Word
              </button>
            </div>
          </div>
        )}

        {/* Add New Template Form */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Plus className="w-4 h-4 text-indigo-600" />
            Tambah / Buat Template Kop & Footer Baru
          </h3>

          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleCreateTemplate} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="sm:col-span-2 space-y-1">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                Nama Template Word (.DOCX) *
              </label>
              <input
                type="text"
                placeholder="Contoh: Template Kop Surat Edisi Khusus 2026"
                value={templateName}
                onChange={e => setTemplateName(e.target.value)}
                className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                Judul Jurnal Utama *
              </label>
              <input
                type="text"
                value={journalTitle}
                onChange={e => setJournalTitle(e.target.value)}
                className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                Judul Lembaga / Organisasi Kop Header *
              </label>
              <input
                type="text"
                value={kopHeaderTitle}
                onChange={e => setKopHeaderTitle(e.target.value)}
                className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                Kop Sub-Header / Divisi
              </label>
              <input
                type="text"
                value={kopSubHeader}
                onChange={e => setKopSubHeader(e.target.value)}
                className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                Nama File DOCX Template
              </label>
              <input
                type="text"
                value={docxFileName}
                onChange={e => setDocxFileName(e.target.value)}
                className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                Informasi Alamat & Kontak Kop
              </label>
              <input
                type="text"
                value={addressInfo}
                onChange={e => setAddressInfo(e.target.value)}
                className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                Teks ISSN & DOI Prefix
              </label>
              <input
                type="text"
                value={issnText}
                onChange={e => setISSNText(e.target.value)}
                className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                Teks Footer Jurnal
              </label>
              <input
                type="text"
                value={footerText}
                onChange={e => setFooterText(e.target.value)}
                className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="sm:col-span-2 pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 dark:shadow-indigo-950/50 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {isLoading ? 'Menyimpan Template...' : 'Simpan Template DOCX Baru'}
              </button>
            </div>
          </form>
        </div>

        {/* Existing Templates List */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Daftar Template Kop & Footer Terdaftar ({templates.length})
          </h3>

          <div className="space-y-2">
            {templates.map(t => (
              <div
                key={t.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  t.isActive
                    ? 'bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                      {t.templateName}
                    </span>
                    {t.isActive && (
                      <span className="bg-emerald-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                        Aktif
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 font-mono">
                    {t.journalTitle} • {t.docxTemplateFileName}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {!t.isActive && (
                    <button
                      onClick={() => handleActivate(t.id, t.templateName)}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs transition-colors flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Jadikan Utama
                    </button>
                  )}
                  {!t.isActive && (
                    <button
                      onClick={() => handleDelete(t.id, t.templateName)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-xl transition-colors"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
