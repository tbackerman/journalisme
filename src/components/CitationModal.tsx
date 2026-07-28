import React, { useState } from 'react';
import { Article } from '../types';
import { Quote, Check, Copy, X } from 'lucide-react';

interface CitationModalProps {
  article: Article;
  onClose: () => void;
}

export const CitationModal: React.FC<CitationModalProps> = ({ article, onClose }) => {
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const authorNamesFormatted = article.authors.map(a => a.name).join(', ');
  const firstAuthorLastName = article.authors[0]?.name.split(' ').pop() || 'Penulis';
  const year = article.publishedAt ? new Date(article.publishedAt).getFullYear() : 2026;

  const citations = {
    APA: `${authorNamesFormatted}. (${year}). ${article.title}. Jurnal Nusantara, 5(2), 101-115. https://doi.org/${article.doi || '10.31219/jurnalnusantara.v5i2.101'}`,
    IEEE: `${authorNamesFormatted}, "${article.title}," Jurnal Nusantara, vol. 5, no. 2, pp. 101-115, ${year}, doi: ${article.doi || '10.31219/jurnalnusantara.v5i2.101'}.`,
    BIBTEX: `@article{${firstAuthorLastName.toLowerCase()}${year}jurnal,
  title={${article.title}},
  author={${authorNamesFormatted}},
  journal={Jurnal Nusantara},
  volume={5},
  number={2},
  pages={101--115},
  year={${year}},
  doi={${article.doi || '10.31219/jurnalnusantara.v5i2.101'}}
}`,
    CHICAGO: `${authorNamesFormatted}. "${article.title}." Jurnal Nusantara 5, no. 2 (${year}): 101-115.`
  };

  const handleCopy = (text: string, formatKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(formatKey);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Quote className="w-5 h-5 text-emerald-600" />
            Kutipan Akademis (Academic Citation Generator)
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500 font-medium">
          Salin format kutipan untuk karya ilmiah Anda:
        </p>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {Object.entries(citations).map(([formatKey, text]) => (
            <div key={formatKey} className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">{formatKey}</span>
                <button
                  onClick={() => handleCopy(text, formatKey)}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 text-[11px] font-semibold flex items-center gap-1 shadow-sm"
                >
                  {copiedFormat === formatKey ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Tersalin!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Salin Format
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs font-mono text-slate-800 dark:text-slate-200 leading-relaxed select-all bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                {text}
              </p>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
