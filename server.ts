import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { INITIAL_ARTICLES, INITIAL_NOTIFICATIONS, INITIAL_VOLUMES } from './src/data/mockData';
import { Article, ArticleStatus, EmailNotification, PeerReview, UserAccount } from './src/types';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// In-memory database state
let articles: Article[] = [...INITIAL_ARTICLES];
let notifications: EmailNotification[] = [...INITIAL_NOTIFICATIONS];
let volumes = [...INITIAL_VOLUMES];

export interface KopFooterTemplate {
  id: string;
  templateName: string;
  journalTitle: string;
  kopHeaderTitle: string;
  kopSubHeader: string;
  addressInfo: string;
  issnText: string;
  footerText: string;
  logoUrl?: string;
  docxTemplateFileName?: string;
  docxTemplateUrl?: string;
  isActive: boolean;
  updatedAt: string;
}

let kopTemplates: KopFooterTemplate[] = [
  {
    id: 'tpl-default-1',
    templateName: 'Template Kop & Footer Resmi Jurnal Nusantara (.DOCX)',
    journalTitle: 'JURNAL NUSANTARA: Portal Publikasi & Peer Review Digital',
    kopHeaderTitle: 'DEWAN REDAKSI & PENGELOLA JURNAL NUSANTARA',
    kopSubHeader: 'PUSAT PUBLIKASI DAN INFORMASI ILMIAH NASIONAL',
    addressInfo: 'Jl. Riset Sains No. 45, Jakarta Selatan 12110 | Telp: (021) 7890-1234 | Email: redaksi@jurnalnusantara.org',
    issnText: 'p-ISSN: 2829-109X | e-ISSN: 2829-1107 | Crossref DOI Prefix: 10.31219/jn.v5i2',
    footerText: 'Jurnal Nusantara diterbitkan di bawah Lisensi Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)',
    docxTemplateFileName: 'Template_Format_Nusantara_Kop_Footer_2026.docx',
    isActive: true,
    updatedAt: new Date().toISOString()
  }
];

let userAccounts: UserAccount[] = [
  {
    id: 'usr-admin-1',
    username: 'admin',
    password: 'admin123',
    name: 'Dr. Hendra Wijaya (Editor in Chief)',
    email: 'editor@jurnalnusantara.org',
    role: 'admin',
    approvalStatus: 'APPROVED',
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr-rev-1',
    username: 'reviewer1',
    password: 'reviewer123',
    name: 'Prof. Budi Santoso, Ph.D.',
    email: 'budi.santoso@itb.ac.id',
    role: 'reviewer',
    approvalStatus: 'APPROVED',
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr-rev-2',
    username: 'reviewer2',
    password: 'reviewer123',
    name: 'Dr. Eko Prasetyo',
    email: 'eko.p@upi.edu',
    role: 'reviewer',
    approvalStatus: 'APPROVED',
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr-ed-1',
    username: 'editor1',
    password: 'editor123',
    name: 'Dr. Ratna Sari (Section Editor)',
    email: 'ratna.sari@jurnalnusantara.org',
    role: 'admin',
    approvalStatus: 'APPROVED',
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr-aut-1',
    username: 'penulis1',
    password: 'penulis123',
    name: 'Dr. Ahmad Rizal, M.Pd.',
    email: 'ahmad.rizal@uny.ac.id',
    institution: 'Universitas Negeri Yogyakarta',
    role: 'author',
    approvalStatus: 'APPROVED',
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr-aut-2',
    username: 'penulis2',
    password: 'penulis123',
    name: 'Nia Ramadhani, M.Sc.',
    email: 'nia.ramadhani@ui.ac.id',
    institution: 'Universitas Indonesia',
    role: 'author',
    approvalStatus: 'PENDING',
    createdAt: new Date().toISOString()
  }
];

// Initialize Gemini Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY environment variable is not defined.');
  }
  return new GoogleGenAI({
    apiKey: apiKey || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Helper: Generic email notification sender
function sendEmailNotification(options: {
  recipientEmail: string;
  recipientName: string;
  subject: string;
  body: string;
  statusTrigger: ArticleStatus;
  articleId: string;
  articleTitle: string;
}) {
  const notif: EmailNotification = {
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    recipientEmail: options.recipientEmail,
    recipientName: options.recipientName,
    subject: options.subject,
    body: options.body,
    sentAt: new Date().toISOString(),
    statusTrigger: options.statusTrigger,
    articleId: options.articleId,
    articleTitle: options.articleTitle,
    isRead: false
  };

  notifications.unshift(notif);
  return notif;
}

// Helper: Auto-generate email notification when status changes
function createStatusEmailNotification(
  article: Article,
  newStatus: ArticleStatus,
  notes?: string
): EmailNotification {
  const primaryAuthor = article.authors.find(a => a.isCorresponding) || article.authors[0];
  const recipientEmail = primaryAuthor?.email || 'penulis@jurnalnusantara.org';
  const recipientName = primaryAuthor?.name || 'Penulis Jurnal';

  const statusLabels: Record<ArticleStatus, { subject: string; template: string }> = {
    DRAFT: {
      subject: `[Jurnal Nusantara] Draf Naskah Disimpan: "${article.title.substring(0, 40)}..."`,
      template: `Draf naskah ilmiah Anda telah berhasil disimpan dalam sistem.`
    },
    SUBMITTED: {
      subject: `[Jurnal Nusantara] Konfirmasi Penerimaan Naskah: "${article.title.substring(0, 40)}..."`,
      template: `Terima kasih telah menyerahkan naskah Anda ke Jurnal Nusantara. Naskah telah terdaftar dengan ID #${article.id} dan saat ini menunggu proses skrining awal oleh Editor.`
    },
    INITIAL_SCREENING: {
      subject: `[Jurnal Nusantara] Naskah Memasuki Skrining Awal: "${article.title.substring(0, 40)}..."`,
      template: `Naskah Anda sedang berada dalam tahap Skrining Awal oleh Dewan Redaksi untuk pemeriksaan kesesuaian ruang lingkup dan format penulisan.`
    },
    UNDER_REVIEW: {
      subject: `[Jurnal Nusantara] Naskah Memasuki Tahap Peer Review: "${article.title.substring(0, 40)}..."`,
      template: `Naskah Anda telah dinyatakan lolos skrining awal dan saat ini secara resmi berada dalam tahap penilaian substansi ilmiah (Peer Review) oleh Mitra Bestari.`
    },
    REVISION_REQUIRED: {
      subject: `[Jurnal Nusantara] Keputusan Reviewer: Revisi Diperlukan untuk Naskah #${article.id}`,
      template: `Berdasarkan hasil penelaahan oleh Mitra Bestari / AI Peer Review, naskah Anda memerlukan perbaikan. Silakan periksa catatan review dan kirimkan revisi terbaru melalui Dashboard Penulis.`
    },
    REVISED: {
      subject: `[Jurnal Nusantara] Penerimaan Revisi Naskah #${article.id}`,
      template: `Revisi naskah Anda telah kami terima dan akan diperiksa kembali oleh Editor / Reviewer.`
    },
    ACCEPTED: {
      subject: `[Jurnal Nusantara] Selamat! Naskah Anda Diterima untuk Dipublikasikan`,
      template: `Dengan senang hati kami beritahukan bahwa naskah ilmiah Anda telah DITERIMA untuk diterbitkan pada terbitan mendatang Jurnal Nusantara.`
    },
    PUBLISHED: {
      subject: `[Jurnal Nusantara] Pengumuman Resmi: Artikel Anda Telah Diterbitkan (DOI Assigned)`,
      template: `Artikel ilmiah Anda telah resmi diterbitkan! \n\nDOI: ${article.doi || '10.31219/jurnalnusantara.' + article.id}\nVolume: ${article.volume || 'Vol. 5 No. 2 (2026)'}\n\nAnda dapat mengunduh dan membagikan kutipan artikel langsung dari portal publik.`
    },
    REJECTED: {
      subject: `[Jurnal Nusantara] Pemberitahuan Keputusan Redaksi Naskah #${article.id}`,
      template: `Setelah melalui proses evaluasi komprehensif, kami menginformasikan bahwa naskah Anda belum dapat diterima untuk publikasi pada edisi kali ini.`
    }
  };

  const config = statusLabels[newStatus] || {
    subject: `[Jurnal Nusantara] Pembaruan Status Naskah #${article.id}`,
    template: `Status naskah Anda telah diperbarui menjadi ${newStatus}.`
  };

  const notif: EmailNotification = {
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    recipientEmail,
    recipientName,
    subject: config.subject,
    body: `Yth. ${recipientName},\n\n${config.template}\n\n${notes ? `Catatan Redaksi/Reviewer:\n"${notes}"\n\n` : ''}Salam hormat,\nDewan Redaksi Jurnal Nusantara\nhttps://jurnal-nusantara.org`,
    sentAt: new Date().toISOString(),
    statusTrigger: newStatus,
    articleId: article.id,
    articleTitle: article.title,
    isRead: false
  };

  notifications.unshift(notif);
  return notif;
}

// Auth & User Management Endpoints
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username dan password wajib diisi' });
  }

  const user = userAccounts.find(
    u => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password
  );

  if (!user) {
    return res.status(401).json({ error: 'Username atau password salah. Silakan periksa kembali.' });
  }

  // Check registration approval status for Penulis (Author)
  if (user.role === 'author') {
    if (user.approvalStatus === 'PENDING') {
      return res.status(403).json({
        error: 'Pendaftaran akun Anda masih MENUNGGU PERSETUJUAN (PENDING) dari Admin / Chief Editor. Silakan hubungi dewan redaksi.'
      });
    }
    if (user.approvalStatus === 'REJECTED') {
      return res.status(403).json({
        error: 'Pendaftaran akun Penulis Anda ditolak oleh Dewan Redaksi.'
      });
    }
  }

  const { password: _, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword, message: `Berhasil login sebagai ${user.name}` });
});

// Author Self-Registration Endpoint
app.post('/api/auth/register-author', (req, res) => {
  const { username, password, name, email, institution, phone } = req.body;
  if (!username || !password || !name || !email) {
    return res.status(400).json({ error: 'Lengkapi semua field pendaftaran (Username, Password, Nama Lengkap, Email)' });
  }

  const exists = userAccounts.some(
    u => u.username.toLowerCase() === username.trim().toLowerCase() || u.email.toLowerCase() === email.trim().toLowerCase()
  );

  if (exists) {
    return res.status(400).json({ error: 'Username atau Email sudah terdaftar. Gunakan username/email lain.' });
  }

  const newAuthor: UserAccount = {
    id: `usr-aut-${Date.now()}`,
    username: username.trim(),
    password: password.trim(),
    name: name.trim(),
    email: email.trim(),
    institution: institution ? institution.trim() : 'Penulis Independen',
    phone: phone ? phone.trim() : '',
    role: 'author',
    approvalStatus: 'PENDING',
    createdAt: new Date().toISOString()
  };

  userAccounts.unshift(newAuthor);

  // Send Notification to Editor regarding new pending author registration
  sendEmailNotification({
    recipientEmail: 'editor@jurnalnusantara.org',
    recipientName: 'Dr. Hendra Wijaya (Chief Editor)',
    subject: `[Registrasi Penulis Baru] Persetujuan Diperlukan: ${newAuthor.name}`,
    body: `Yth. Chief Editor,\n\nPenulis baru telah mendaftar di portal Jurnal Nusantara:\n- Nama: ${newAuthor.name}\n- Instansi: ${newAuthor.institution}\n- Email: ${newAuthor.email}\n- Username: ${newAuthor.username}\n\nStatus: MENUNGGU PERSETUJUAN (PENDING).\nSilakan buka menu "Kelola Akun" di header untuk menyetujui (Approve) atau menolak pendaftaran penulis ini.\n\nSalam,\nSistem Redaksi Jurnal Nusantara`,
    statusTrigger: 'SUBMITTED',
    articleId: 'REGISTRATION',
    articleTitle: `Registrasi Penulis - ${newAuthor.name}`
  });

  res.status(201).json({
    user: newAuthor,
    message: 'Pendaftaran berhasil dikirim! Akun Anda sedang menunggu persetujuan (approval) dari Admin/Chief Editor.'
  });
});

app.get('/api/users', (req, res) => {
  res.json({ users: userAccounts });
});

app.post('/api/users', (req, res) => {
  const { username, password, name, email, role, institution } = req.body;
  if (!username || !password || !name || !role) {
    return res.status(400).json({ error: 'Lengkapi semua field (Username, Password, Nama, Peran)' });
  }

  const exists = userAccounts.some(u => u.username.toLowerCase() === username.trim().toLowerCase());
  if (exists) {
    return res.status(400).json({ error: 'Username sudah digunakan, silakan gunakan username lain' });
  }

  const newUser: UserAccount = {
    id: `usr-${Date.now()}`,
    username: username.trim(),
    password: password.trim(),
    name: name.trim(),
    email: email ? email.trim() : `${username.trim()}@jurnalnusantara.org`,
    institution: institution ? institution.trim() : '',
    role: role === 'admin' ? 'admin' : role === 'author' ? 'author' : 'reviewer',
    approvalStatus: 'APPROVED',
    createdAt: new Date().toISOString()
  };

  userAccounts.unshift(newUser);
  res.status(201).json({ user: newUser, message: `Akun ${role} berhasil dibuat` });
});

// Admin Approve Author Account
app.patch('/api/users/:id/approve', (req, res) => {
  const user = userAccounts.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'Akun tidak ditemukan' });
  }

  user.approvalStatus = 'APPROVED';

  // Send approval notification email to author
  sendEmailNotification({
    recipientEmail: user.email,
    recipientName: user.name,
    subject: '[Jurnal Nusantara] Akun Penulis Anda telah Disetujui!',
    body: `Yth. ${user.name},\n\nPendaftaran akun Penulis Anda di Jurnal Nusantara telah DISETUJUI oleh Dewan Redaksi.\n\nAnda sekarang dapat login menggunakan:\n- Username: ${user.username}\n- Password: (password terdaftar Anda)\n\nSilakan masuk untuk menyerahkan (submit) naskah karya ilmiah Anda.\n\nSalam Hangat,\nDewan Redaksi Jurnal Nusantara`,
    statusTrigger: 'ACCEPTED',
    articleId: 'ACCOUNT_APPROVED',
    articleTitle: 'Persetujuan Akun Penulis'
  });

  res.json({ success: true, user, message: `Akun Penulis "${user.name}" berhasil DISETUJUI.` });
});

// Admin Reject Author Account
app.patch('/api/users/:id/reject', (req, res) => {
  const user = userAccounts.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'Akun tidak ditemukan' });
  }

  user.approvalStatus = 'REJECTED';

  res.json({ success: true, user, message: `Akun Penulis "${user.name}" telah DITOLAK.` });
});

app.delete('/api/users/:id', (req, res) => {
  const index = userAccounts.findIndex(u => u.id === req.params.id);
  if (index !== -1) {
    userAccounts.splice(index, 1);
    res.json({ success: true, message: 'Akun berhasil dihapus' });
  } else {
    res.status(404).json({ error: 'Akun tidak ditemukan' });
  }
});

// Kop & Footer DOCX Template Management Endpoints
app.get('/api/templates/kop-footer', (req, res) => {
  res.json({ templates: kopTemplates });
});

app.post('/api/templates/kop-footer', (req, res) => {
  const {
    templateName,
    journalTitle,
    kopHeaderTitle,
    kopSubHeader,
    addressInfo,
    issnText,
    footerText,
    docxTemplateFileName
  } = req.body;

  if (!templateName || !journalTitle || !kopHeaderTitle) {
    return res.status(400).json({ error: 'Lengkapi Nama Template, Judul Jurnal, dan Kop Header' });
  }

  const newTemplate: KopFooterTemplate = {
    id: `tpl-${Date.now()}`,
    templateName: templateName.trim(),
    journalTitle: journalTitle.trim(),
    kopHeaderTitle: kopHeaderTitle.trim(),
    kopSubHeader: kopSubHeader ? kopSubHeader.trim() : '',
    addressInfo: addressInfo ? addressInfo.trim() : '',
    issnText: issnText ? issnText.trim() : '',
    footerText: footerText ? footerText.trim() : '',
    docxTemplateFileName: docxTemplateFileName ? docxTemplateFileName.trim() : 'Template_Surat_Resmi.docx',
    isActive: kopTemplates.length === 0,
    updatedAt: new Date().toISOString()
  };

  kopTemplates.unshift(newTemplate);
  res.status(201).json({ template: newTemplate, message: 'Template Kop & Footer berhasil disimpan' });
});

app.patch('/api/templates/kop-footer/:id/activate', (req, res) => {
  const template = kopTemplates.find(t => t.id === req.params.id);
  if (!template) {
    return res.status(404).json({ error: 'Template tidak ditemukan' });
  }

  kopTemplates.forEach(t => (t.isActive = false));
  template.isActive = true;

  res.json({ success: true, message: `Template "${template.templateName}" sekarang aktif sebagai kop & footer utama.` });
});

app.delete('/api/templates/kop-footer/:id', (req, res) => {
  const index = kopTemplates.findIndex(t => t.id === req.params.id);
  if (index !== -1) {
    kopTemplates.splice(index, 1);
    if (kopTemplates.length > 0 && !kopTemplates.some(t => t.isActive)) {
      kopTemplates[0].isActive = true;
    }
    res.json({ success: true, message: 'Template berhasil dihapus' });
  } else {
    res.status(404).json({ error: 'Template tidak ditemukan' });
  }
});

// REST API Endpoints

// Get all articles
app.get('/api/articles', (req, res) => {
  res.json({ articles, volumes });
});

// Get single article by ID
app.get('/api/articles/:id', (req, res) => {
  const article = articles.find(a => a.id === req.params.id);
  if (!article) {
    return res.status(404).json({ error: 'Artikel tidak ditemukan' });
  }
  res.json({ article });
});

// Submit new article
app.post('/api/articles', (req, res) => {
  const { title, abstract, keywords, discipline, authors, fullText, fileName, fileSize } = req.body;

  if (!title || !abstract || !discipline || !authors || authors.length === 0) {
    return res.status(400).json({ error: 'Judul, abstrak, rumpun ilmu, dan penulis wajib diisi' });
  }

  const newArticle: Article = {
    id: `art-${Date.now()}`,
    title,
    abstract,
    keywords: Array.isArray(keywords) ? keywords : (keywords || '').split(',').map((k: string) => k.trim()),
    discipline,
    authors,
    fullText: fullText || `
# 1. Pendahuluan
${abstract}

# 2. Metodologi
Penelitian ini menggunakan pendekatan kualitatif dan kuantitatif terintegrasi.

# 3. Hasil & Pembahasan
Data dianalisis menggunakan pengujian statistik terstandar.

# 4. Kesimpulan
Hasil menunjukkan signifikansi positif sesuai hipotesis awal.
    `,
    fileName: fileName || `${title.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 30)}.pdf`,
    fileSize: fileSize || '1.5 MB',
    status: 'SUBMITTED',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    submittedAt: new Date().toISOString(),
    metrics: { views: 1, downloads: 0, citations: 0 },
    assignedReviewers: [
      {
        reviewerId: 'rev-ai',
        reviewerName: 'Gemini AI Reviewer',
        reviewerEmail: 'ai-peer-review@jurnalnusantara.org',
        status: 'PENDING',
        assignedAt: new Date().toISOString(),
      },
    ],
    peerReviews: [],
    editorialDecisions: [],
    history: [
      {
        id: `h-${Date.now()}`,
        status: 'SUBMITTED',
        changedBy: authors[0]?.name || 'Penulis',
        changedAt: new Date().toISOString(),
        notes: 'Naskah baru diserahkan melalui portal',
      },
    ],
  };

  articles.unshift(newArticle);
  createStatusEmailNotification(newArticle, 'SUBMITTED');

  res.status(201).json({ article: newArticle, message: 'Naskah berhasil diserahkan' });
});

// Update article status (e.g. Admin or Reviewer decision)
app.patch('/api/articles/:id/status', (req, res) => {
  const { status, notes, changedBy, volume, issue, doi } = req.body;
  const articleIndex = articles.findIndex(a => a.id === req.params.id);

  if (articleIndex === -1) {
    return res.status(404).json({ error: 'Artikel tidak ditemukan' });
  }

  const article = articles[articleIndex];
  const oldStatus = article.status;
  const newStatus: ArticleStatus = status;

  article.status = newStatus;
  article.updatedAt = new Date().toISOString();

  if (notes) {
    article.editorialDecisions.push({
      id: `ed-${Date.now()}`,
      editorName: changedBy || 'Editor Jurnal',
      decision: newStatus,
      notes,
      createdAt: new Date().toISOString(),
    });
  }

  if (newStatus === 'PUBLISHED') {
    article.publishedAt = new Date().toISOString();
    article.volume = volume || 'Vol. 5 No. 2 (2026)';
    article.issue = issue || 'Edisi Juli 2026';
    article.doi = doi || `10.31219/jurnalnusantara.v5i2.${Math.floor(100 + Math.random() * 900)}`;

    // Add to volume articleIds
    const targetVolume = volumes.find(v => v.id === 'vol-5-issue-2');
    if (targetVolume && !targetVolume.articleIds.includes(article.id)) {
      targetVolume.articleIds.push(article.id);
    }
  }

  article.history.unshift({
    id: `h-${Date.now()}`,
    status: newStatus,
    changedBy: changedBy || 'Sistem Redaksi',
    changedAt: new Date().toISOString(),
    notes: notes || `Status diubah dari ${oldStatus} menjadi ${newStatus}`,
  });

  articles[articleIndex] = article;

  // Trigger email notification
  const notification = createStatusEmailNotification(article, newStatus, notes);

  res.json({ article, notification, message: `Status berhasil diubah menjadi ${newStatus}` });
});

// Submit revision from author
app.post('/api/articles/:id/revision', (req, res) => {
  const { revisionNotes, fullText } = req.body;
  const articleIndex = articles.findIndex(a => a.id === req.params.id);

  if (articleIndex === -1) {
    return res.status(404).json({ error: 'Artikel tidak ditemukan' });
  }

  const article = articles[articleIndex];
  article.status = 'REVISED';
  article.updatedAt = new Date().toISOString();
  if (revisionNotes) article.revisionNotes = revisionNotes;
  if (fullText) article.fullText = fullText;

  article.history.unshift({
    id: `h-${Date.now()}`,
    status: 'REVISED',
    changedBy: article.authors[0]?.name || 'Penulis',
    changedAt: new Date().toISOString(),
    notes: `Revisi dikirim oleh Penulis. Catatan: ${revisionNotes || 'Tanpa catatan'}`,
  });

  articles[articleIndex] = article;
  const notification = createStatusEmailNotification(article, 'REVISED', revisionNotes);

  res.json({ article, notification, message: 'Revisi naskah berhasil dikirim' });
});

// AI Peer Review Endpoint powered by Gemini
app.post('/api/articles/:id/peer-review/ai', async (req, res) => {
  const articleIndex = articles.findIndex(a => a.id === req.params.id);
  if (articleIndex === -1) {
    return res.status(404).json({ error: 'Artikel tidak ditemukan' });
  }

  const article = articles[articleIndex];

  try {
    const ai = getGeminiClient();

    const systemInstruction = `
Anda adalah Pakar Penelaah Peer Review Jurnal Ilmiah Internasional & Nasional Terakreditasi.
Tugas Anda adalah melakukan penilaian kritis, konstruktif, objektif, dan akademis terhadap naskah karya ilmiah yang dikirimkan.

Evaluasi mencakup 5 kriteria:
1. Keaslian & Kebaruan (Originality & Novelty) [1-10]
2. Metodologi Penelitian & Ketajaman Analisis (Methodology) [1-10]
3. Kejelasan Penulisan & Struktur Akademis (Clarity) [1-10]
4. Dampak Keilmuan & Relevansi Praktis (Academic Impact) [1-10]
5. Skor Keseluruhan (Overall) [1-10]

Tentukan Rekomendasi: 'ACCEPT', 'MINOR_REVISION', 'MAJOR_REVISION', atau 'REJECT'.
Berikan ulasan kekuatan (strengths), kelemahan (weaknesses), ringkasan ulasan (summaryComments), dan beberapa feedback terperinci per bagian (detailedFeedback).
Gunakan bahasa Indonesia ilmiah yang lugas dan profesional.
    `;

    const promptText = `
Judul Artikel: ${article.title}
Rumpun Ilmu: ${article.discipline}
Kata Kunci: ${article.keywords.join(', ')}

Abstrak:
${article.abstract}

Naskah Lengkap / Teks Artikel:
${article.fullText}
    `;

    const geminiResponse = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: {
              type: Type.OBJECT,
              properties: {
                originality: { type: Type.INTEGER, description: 'Skor 1-10' },
                methodology: { type: Type.INTEGER, description: 'Skor 1-10' },
                clarity: { type: Type.INTEGER, description: 'Skor 1-10' },
                academicImpact: { type: Type.INTEGER, description: 'Skor 1-10' },
                overall: { type: Type.INTEGER, description: 'Skor 1-10' },
              },
              required: ['originality', 'methodology', 'clarity', 'academicImpact', 'overall'],
            },
            recommendation: {
              type: Type.STRING,
              description: 'ACCEPT, MINOR_REVISION, MAJOR_REVISION, atau REJECT',
            },
            summaryComments: { type: Type.STRING, description: 'Ulasan ringkas reviewer' },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Poin-poin keunggulan naskah',
            },
            weaknesses: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Poin-poin kelemahan atau hal yang perlu diperbaiki',
            },
            detailedFeedback: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  section: { type: Type.STRING, description: 'Bagian naskah (contoh: Abstrak, Metodologi, Hasil)' },
                  comment: { type: Type.STRING, description: 'Kritik atau pertanyaan' },
                  recommendation: { type: Type.STRING, description: 'Saran tindakan perbaikan' },
                },
                required: ['section', 'comment', 'recommendation'],
              },
            },
            plagiarismEstimatePercent: { type: Type.INTEGER, description: 'Estimasi tingkat kemiripan/plagiarisme 0-100%' },
          },
          required: ['score', 'recommendation', 'summaryComments', 'strengths', 'weaknesses', 'detailedFeedback'],
        },
      },
    });

    const parsedReview = JSON.parse(geminiResponse.text || '{}');

    const newPeerReview: PeerReview = {
      id: `pr-ai-${Date.now()}`,
      reviewerId: 'rev-ai',
      reviewerName: 'Gemini AI Peer Reviewer',
      reviewerRole: 'AI_GEMINI',
      createdAt: new Date().toISOString(),
      score: parsedReview.score || { originality: 8, methodology: 8, clarity: 8, academicImpact: 8, overall: 8 },
      recommendation: parsedReview.recommendation || 'MINOR_REVISION',
      summaryComments: parsedReview.summaryComments || 'Penilaian otomatis telah diselesaikan.',
      strengths: parsedReview.strengths || ['Topik sangat kontekstual'],
      weaknesses: parsedReview.weaknesses || ['Sajikan penjelasan tambahan pada metodologi'],
      detailedFeedback: parsedReview.detailedFeedback || [],
      plagiarismEstimatePercent: parsedReview.plagiarismEstimatePercent || Math.floor(2 + Math.random() * 8),
    };

    article.peerReviews.unshift(newPeerReview);

    // Update assigned reviewer status
    const aiAssignee = article.assignedReviewers.find(r => r.reviewerId === 'rev-ai');
    if (aiAssignee) {
      aiAssignee.status = 'COMPLETED';
      aiAssignee.completedAt = new Date().toISOString();
    } else {
      article.assignedReviewers.push({
        reviewerId: 'rev-ai',
        reviewerName: 'Gemini AI Peer Reviewer',
        reviewerEmail: 'ai-peer-review@jurnalnusantara.org',
        status: 'COMPLETED',
        assignedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      });
    }

    // Auto update article status based on AI recommendation if under review or submitted
    if (article.status === 'SUBMITTED' || article.status === 'INITIAL_SCREENING' || article.status === 'UNDER_REVIEW') {
      let nextStatus: ArticleStatus = 'UNDER_REVIEW';
      if (parsedReview.recommendation === 'ACCEPT') {
        nextStatus = 'ACCEPTED';
      } else if (parsedReview.recommendation === 'MINOR_REVISION' || parsedReview.recommendation === 'MAJOR_REVISION') {
        nextStatus = 'REVISION_REQUIRED';
      } else if (parsedReview.recommendation === 'REJECT') {
        nextStatus = 'REJECTED';
      }

      article.status = nextStatus;
      article.history.unshift({
        id: `h-${Date.now()}`,
        status: nextStatus,
        changedBy: 'Gemini AI Peer Reviewer',
        changedAt: new Date().toISOString(),
        notes: `Penilaian Peer Review AI Selesai. Rekomendasi: ${parsedReview.recommendation}`,
      });

      createStatusEmailNotification(
        article,
        nextStatus,
        `Hasil AI Peer Review: ${parsedReview.summaryComments}`
      );
    }

    article.updatedAt = new Date().toISOString();
    articles[articleIndex] = article;

    res.json({
      article,
      peerReview: newPeerReview,
      message: 'Proses AI Peer Review otomatis berhasil diselesaikan!',
    });
  } catch (err: any) {
    console.error('Gemini Peer Review Error:', err);
    res.status(500).json({ error: 'Gagal menjalankan AI Peer Review: ' + (err.message || 'Error internal server') });
  }
});

// Human Peer Review Endpoint
app.post('/api/articles/:id/peer-review/human', (req, res) => {
  const { reviewerName, score, recommendation, summaryComments, strengths, weaknesses, detailedFeedback } = req.body;
  const articleIndex = articles.findIndex(a => a.id === req.params.id);

  if (articleIndex === -1) {
    return res.status(404).json({ error: 'Artikel tidak ditemukan' });
  }

  const article = articles[articleIndex];

  const newPeerReview: PeerReview = {
    id: `pr-hum-${Date.now()}`,
    reviewerId: `rev-${Date.now()}`,
    reviewerName: reviewerName || 'Mitra Bestari Pakar',
    reviewerRole: 'HUMAN_REVIEWER',
    createdAt: new Date().toISOString(),
    score: score || { originality: 8, methodology: 8, clarity: 8, academicImpact: 8, overall: 8 },
    recommendation: recommendation || 'MINOR_REVISION',
    summaryComments: summaryComments || 'Catatan ulasan mitra bestari telah diserahkan.',
    strengths: strengths || [],
    weaknesses: weaknesses || [],
    detailedFeedback: detailedFeedback || [],
  };

  article.peerReviews.unshift(newPeerReview);

  // Auto transition status
  let nextStatus: ArticleStatus = article.status;
  if (recommendation === 'ACCEPT') nextStatus = 'ACCEPTED';
  else if (recommendation === 'MINOR_REVISION' || recommendation === 'MAJOR_REVISION') nextStatus = 'REVISION_REQUIRED';
  else if (recommendation === 'REJECT') nextStatus = 'REJECTED';

  article.status = nextStatus;
  article.history.unshift({
    id: `h-${Date.now()}`,
    status: nextStatus,
    changedBy: reviewerName || 'Mitra Bestari',
    changedAt: new Date().toISOString(),
    notes: `Peer review manual dikirim oleh ${reviewerName}. Hasil: ${recommendation}`,
  });

  articles[articleIndex] = article;
  createStatusEmailNotification(article, nextStatus, summaryComments);

  res.json({ article, peerReview: newPeerReview, message: 'Review manual berhasil disimpan' });
});

// Notifications Endpoints
app.get('/api/notifications', (req, res) => {
  res.json({ notifications });
});

app.patch('/api/notifications/:id/read', (req, res) => {
  const notif = notifications.find(n => n.id === req.params.id);
  if (notif) {
    notif.isRead = true;
  }
  res.json({ success: true });
});

app.post('/api/notifications/send', (req, res) => {
  const { recipientEmail, recipientName, subject, body, articleId, articleTitle, statusTrigger } = req.body;

  const newNotif: EmailNotification = {
    id: `notif-${Date.now()}`,
    recipientEmail: recipientEmail || 'penulis@jurnalnusantara.org',
    recipientName: recipientName || 'Penulis',
    subject: subject || '[Jurnal Nusantara] Pemberitahuan Redaksi',
    body: body || 'Pemberitahuan dari Pengelola Jurnal Nusantara.',
    sentAt: new Date().toISOString(),
    statusTrigger: statusTrigger || 'SUBMITTED',
    articleId: articleId || '',
    articleTitle: articleTitle || '',
    isRead: false,
  };

  notifications.unshift(newNotif);
  res.status(201).json({ notification: newNotif, message: 'Notifikasi email berhasil dikirim' });
});

// Article metrics increment (views/downloads)
app.post('/api/articles/:id/metric', (req, res) => {
  const { type } = req.body; // 'views' | 'downloads' | 'citations'
  const article = articles.find(a => a.id === req.params.id);
  if (article) {
    if (type === 'views') article.metrics.views += 1;
    if (type === 'downloads') article.metrics.downloads += 1;
    if (type === 'citations') article.metrics.citations += 1;
  }
  res.json({ metrics: article?.metrics });
});

// Setup Vite Development or Static Production Server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Jurnal Nusantara Server] Berjalan pada http://localhost:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
