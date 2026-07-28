import React, { useState } from 'react';
import { EmailNotification } from '../types';
import {
  Mail,
  Send,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  Plus,
  Sparkles,
  Search,
  Filter,
  User,
  AlertCircle
} from 'lucide-react';

interface EmailNotificationCenterProps {
  notifications: EmailNotification[];
  onMarkAsRead: (id: string) => Promise<void>;
  onSendCustomNotification: (data: {
    recipientEmail: string;
    recipientName: string;
    subject: string;
    body: string;
    articleTitle?: string;
  }) => Promise<void>;
}

export const EmailNotificationCenter: React.FC<EmailNotificationCenterProps> = ({
  notifications,
  onMarkAsRead,
  onSendCustomNotification,
}) => {
  const [selectedNotif, setSelectedNotif] = useState<EmailNotification | null>(null);
  const [showCustomModal, setShowCustomModal] = useState(false);

  // Custom notification form
  const [recipientEmail, setRecipientEmail] = useState('penulis@jurnalnusantara.org');
  const [recipientName, setRecipientName] = useState('Dr. Ahmad Fauzi, M.T.');
  const [subject, setSubject] = useState('[Jurnal Nusantara] Catatan Redaksi Pengelola Jurnal');
  const [body, setBody] = useState('Yth. Penulis,\n\nKami menginformasikan bahwa naskah Anda sedang memerlukan beberapa perbaikan pada format referensi.\n\nSalam,\nDewan Redaksi');

  const handleSendCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSendCustomNotification({
      recipientEmail,
      recipientName,
      subject,
      body,
    });
    setShowCustomModal(false);
  };

  const handleOpenDetail = (notif: EmailNotification) => {
    setSelectedNotif(notif);
    if (!notif.isRead) {
      onMarkAsRead(notif.id);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Mail className="w-5 h-5 text-indigo-600" />
            Automated Email Notification Log
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time delivery logs for official status updates sent to authors and peer reviewers.
          </p>
        </div>

        <button
          onClick={() => setShowCustomModal(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-200 dark:shadow-indigo-950/50 transition-all flex items-center gap-2 shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
          Send Custom Email Alert
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.map(notif => (
          <div
            key={notif.id}
            onClick={() => handleOpenDetail(notif)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
              notif.isRead
                ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-90'
                : 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 font-medium'
            }`}
          >
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className={`p-2 rounded-xl mt-0.5 ${notif.isRead ? 'bg-slate-100 text-slate-500' : 'bg-emerald-600 text-white'}`}>
                <Mail className="w-4 h-4" />
              </div>

              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {notif.subject}
                  </span>
                  {!notif.isRead && (
                    <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                      Baru
                    </span>
                  )}
                  <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] px-2 py-0.5 rounded font-mono">
                    {notif.statusTrigger}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">
                  Penerima: <span className="font-semibold">{notif.recipientName}</span> ({notif.recipientEmail})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto text-xs text-slate-400 shrink-0">
              <span className="flex items-center gap-1 text-[11px]">
                <Clock className="w-3 h-3" />
                {new Date(notif.sentAt).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
              </span>
              <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-emerald-600">
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Email Preview Modal */}
      {selectedNotif && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-600" />
                Pratinjau Surel Terkirim (Simulated Email Inbox)
              </h3>
              <button
                onClick={() => setSelectedNotif(null)}
                className="text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                Tutup [X]
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-2">
              <div><strong>Pengirim:</strong> Redaksi Jurnal Nusantara &lt;redaksi@jurnalnusantara.org&gt;</div>
              <div><strong>Penerima:</strong> {selectedNotif.recipientName} &lt;{selectedNotif.recipientEmail}&gt;</div>
              <div><strong>Subjek:</strong> {selectedNotif.subject}</div>
              <div><strong>Waktu Pengiriman:</strong> {new Date(selectedNotif.sentAt).toLocaleString('id-ID')}</div>
            </div>

            <div className="bg-white dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 font-mono whitespace-pre-wrap leading-relaxed">
              {selectedNotif.body}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedNotif(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs"
              >
                Selesai Membaca
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Email Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Send className="w-4 h-4 text-emerald-600" />
              Kirim Email Notifikasi Khusus ke Penulis
            </h3>

            <form onSubmit={handleSendCustom} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Nama Penerima:</label>
                <input
                  type="text"
                  required
                  value={recipientName}
                  onChange={e => setRecipientName(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Email Penerima:</label>
                <input
                  type="email"
                  required
                  value={recipientEmail}
                  onChange={e => setRecipientEmail(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Subjek Email:</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Isi Pesan Email:</label>
                <textarea
                  rows={4}
                  required
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-4 py-2 rounded-xl border"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold"
                >
                  Kirim Email Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
