import { Article, EmailNotification, JournalVolume } from '../types';

export const INITIAL_VOLUMES: JournalVolume[] = [
  {
    id: 'vol-5-issue-2',
    volumeNumber: 5,
    issueNumber: 2,
    year: 2026,
    month: 'Juli',
    title: 'Inovasi Teknologi Terapan & Transformasi Digital Nusantara',
    description: 'Edisi khusus memuat artikel ilmiah mutakhir dalam kecerdasan buatan, jaringan komputer, dan inovasi pendidikan tinggi.',
    articleIds: ['art-pub-01', 'art-pub-02']
  },
  {
    id: 'vol-5-issue-1',
    volumeNumber: 5,
    issueNumber: 1,
    year: 2026,
    month: 'Januari',
    title: 'Sains Komputasi & Keberlanjutan Lingkungan',
    description: 'Menyoroti model analitik data, bioinformatika, dan teknologi ramah lingkungan.',
    articleIds: ['art-pub-03']
  }
];

export const INITIAL_ARTICLES: Article[] = [
  {
    id: 'art-pub-01',
    title: 'Penerapan Model Large Language Model Gemini untuk Deteksi Otomatis Anomali pada Jaringan IoT Industri',
    abstract: 'Penelitian ini mengajukan kerangka kerja baru yang memanfaatkan sistem pembelajar mesin berbasis Gemini AI untuk menganalisis arus lalu lintas paket data pada sensor IoT industri secara real-time. Pengujian empiris menunjukkan tingkat akurasi deteksi mencapai 98.4% dengan latensi di bawah 15 milidetik, mengungguli metode pemrosesan sinyal tradisional.',
    keywords: ['Gemini AI', 'Internet of Things', 'Anomaly Detection', 'Cybersecurity', 'Machine Learning'],
    discipline: 'Informatika & Komputer',
    authors: [
      { id: 'a1', name: 'Dr. Ahmad Fauzi, M.T.', email: 'ahmad.fauzi@ui.ac.id', institution: 'Universitas Indonesia', isCorresponding: true },
      { id: 'a2', name: 'Siti Nurhaliza, S.Kom.', email: 'siti.nurhaliza@ui.ac.id', institution: 'Universitas Indonesia' }
    ],
    fullText: `
# 1. Pendahuluan
Perkembangan pesat Internet of Things (IoT) pada sektor manufaktur dan industri 4.0 membawa tantangan keamanan siber yang kompleks. Metode deteksi anomali konvensional seringkali gagal mendeteksi pola serangan baru (zero-day attacks) karena keterbatasan heuristik yang kaku.

Penelitian ini memperkenalkan arsitektur deteksi anomali terdistribusi yang memadukan ekstraksi fitur statistik paket data dengan pemrosesan bahasa alami berparameter tinggi untuk memprediksi potensi pencerobohan jaringan.

# 2. Metodologi
Dataset yang digunakan mencakup 500.000 log transaksi jaringan terenkripsi dari lingkungan IoT manufaktur nyata. Pemrosesan dilakukan melalui tiga tahap utama:
1. Preprocessing & Ekstraksi Fitur Vektor
2. Evaluasi Kontekstual Paket via Model Gemini API
3. Verifikasi Klasifikasi dengan Algoritma Ensemble

# 3. Hasil & Pembahasan
Hasil eksperimen menunjukkan bahwa integrasi pemodelan bahasa dengan analisis deret waktu menghasilkan penurunan false-positive rate sebesar 42% dibandingkan metode Isolation Forest baku.

# 4. Kesimpulan
Kerangka kerja yang diusulkan berhasil meningkatkan ketahanan jaringan IoT industri tanpa mengorbankan throughput sistem secara signifikan.
    `,
    fileName: 'jurnal_gemini_iot_fauzi_2026.pdf',
    fileSize: '1.8 MB',
    status: 'PUBLISHED',
    createdAt: '2026-05-10T08:30:00Z',
    updatedAt: '2026-07-15T10:00:00Z',
    submittedAt: '2026-05-12T09:15:00Z',
    publishedAt: '2026-07-15T10:00:00Z',
    volume: 'Vol. 5 No. 2 (2026)',
    issue: 'Edisi Juli 2026',
    doi: '10.31219/jurnalnusantara.v5i2.101',
    metrics: { views: 1420, downloads: 680, citations: 12 },
    assignedReviewers: [
      { reviewerId: 'rev-ai', reviewerName: 'Gemini AI Reviewer', reviewerEmail: 'ai-peer-review@jurnalnusantara.org', status: 'COMPLETED', assignedAt: '2026-05-13T10:00:00Z', completedAt: '2026-05-13T10:02:00Z' },
      { reviewerId: 'rev-01', reviewerName: 'Prof. Budi Santoso, Ph.D.', reviewerEmail: 'budi.santoso@itb.ac.id', status: 'COMPLETED', assignedAt: '2026-05-13T10:05:00Z', completedAt: '2026-05-20T14:00:00Z' }
    ],
    peerReviews: [
      {
        id: 'pr-01',
        reviewerId: 'rev-ai',
        reviewerName: 'Gemini AI Reviewer',
        reviewerRole: 'AI_GEMINI',
        createdAt: '2026-05-13T10:02:00Z',
        score: { originality: 9, methodology: 9, clarity: 9, academicImpact: 9, overall: 9 },
        recommendation: 'ACCEPT',
        summaryComments: 'Naskah ilmiah disusun dengan sangat rapi dan metodologi eksperimen terperinci. Kontribusi terhadap deteksi anomali IoT bernilai tinggi.',
        strengths: [
          'Penggunaan dataset IoT manufaktur yang realistis',
          'Metodologi evaluasi latensi dan throughput terukur presisi',
          'Tinjauan pustaka mencakup perkembangan mutakhir 2024-2026'
        ],
        weaknesses: [
          'Perlu klarifikasi batasan konsumsi daya pada micro-controller edge'
        ],
        detailedFeedback: [
          { section: 'Metodologi', comment: 'Sebutkan spesifikasi keras perangkat edge yang digunakan.', recommendation: 'Tambahkan tabel spesifikasi hardware di bab 2.2.' }
        ],
        plagiarismEstimatePercent: 4
      }
    ],
    editorialDecisions: [
      { id: 'ed-01', editorName: 'Dr. Hendra Wijaya (Editor In Chief)', decision: 'PUBLISHED', notes: 'Artikel disetujui untuk diterbitkan pada Vol. 5 No. 2.', createdAt: '2026-07-15T10:00:00Z' }
    ],
    history: [
      { id: 'h1', status: 'SUBMITTED', changedBy: 'Dr. Ahmad Fauzi, M.T.', changedAt: '2026-05-12T09:15:00Z', notes: 'Artikel berhasil diunggah' },
      { id: 'h2', status: 'INITIAL_SCREENING', changedBy: 'Admin Editor', changedAt: '2026-05-13T08:00:00Z', notes: 'Lolos kelayakan awal & format' },
      { id: 'h3', status: 'UNDER_REVIEW', changedBy: 'Admin Editor', changedAt: '2026-05-13T10:00:00Z', notes: 'Penugasan Mitra Bestari (Reviewer)' },
      { id: 'h4', status: 'ACCEPTED', changedBy: 'Admin Editor', changedAt: '2026-06-01T11:00:00Z', notes: 'Diterima tanpa revisi mayor' },
      { id: 'h5', status: 'PUBLISHED', changedBy: 'Admin Editor', changedAt: '2026-07-15T10:00:00Z', notes: 'Diterbitkan secara resmi' }
    ]
  },
  {
    id: 'art-pub-02',
    title: 'Analisis Komparatif Efektivitas Blended Learning Berbasis Gamifikasi dalam Pembelajaran Matematika Tingkat Menengah',
    abstract: 'Studi kuasi-eksperimental ini meneliti dampak integrasi elemen gamifikasi terhadap motivasi belajar dan pemahaman konsep aljabar siswa SMA. Melibatkan 240 partisipan yang terbagi dalam kelas eksperimen dan kontrol selama satu semester.',
    keywords: ['Blended Learning', 'Gamifikasi', 'Pendidikan Matematika', 'E-Learning', 'Pedagogi'],
    discipline: 'Pendidikan & Kebudayaan',
    authors: [
      { id: 'a3', name: 'Prof. Rina Suryani, M.Pd.', email: 'rina.suryani@uny.ac.id', institution: 'Universitas Negeri Yogyakarta', isCorresponding: true }
    ],
    fullText: `
# 1. Pendahuluan
Pasca pandemi, adopsi pembelajaran campuran (blended learning) terus mengalami transformasi. Namun, rendahnya retensi motivasi siswa dalam menyelesaikan tugas aljabar abstrak masih menjadi kendala pedagogis utama.

# 2. Metode Penelitian
Penelitian ini menggunakan desain Randomized Pretest-Posttest Control Group. Instrumen tes terstandar digunakan untuk mengukur pemahaman konsep, sedangkan angket ARCS digunakan untuk mengukur motivasi.
    `,
    fileName: 'jurnal_gamifikasi_matematika.pdf',
    fileSize: '1.2 MB',
    status: 'PUBLISHED',
    createdAt: '2026-05-20T11:00:00Z',
    updatedAt: '2026-07-16T14:00:00Z',
    submittedAt: '2026-05-22T08:00:00Z',
    publishedAt: '2026-07-16T14:00:00Z',
    volume: 'Vol. 5 No. 2 (2026)',
    issue: 'Edisi Juli 2026',
    doi: '10.31219/jurnalnusantara.v5i2.102',
    metrics: { views: 890, downloads: 410, citations: 5 },
    assignedReviewers: [
      { reviewerId: 'rev-02', reviewerName: 'Dr. Eko Prasetyo', reviewerEmail: 'eko.p@upi.edu', status: 'COMPLETED', assignedAt: '2026-05-23T09:00:00Z', completedAt: '2026-06-02T15:00:00Z' }
    ],
    peerReviews: [
      {
        id: 'pr-02',
        reviewerId: 'rev-02',
        reviewerName: 'Dr. Eko Prasetyo',
        reviewerRole: 'HUMAN_REVIEWER',
        createdAt: '2026-06-02T15:00:00Z',
        score: { originality: 8, methodology: 8, clarity: 9, academicImpact: 8, overall: 8 },
        recommendation: 'ACCEPT',
        summaryComments: 'Metodologi penelitian eksperimental sangat kuat. Data disajikan dengan grafik yang mudah dipahami.',
        strengths: ['Analisis statistik ANOVA terstruktur jelas', 'Relevan dengan kurikulum nasional'],
        weaknesses: ['Perlu penjelasan mengenai keberlanjutan motivasi jangka panjang'],
        detailedFeedback: []
      }
    ],
    editorialDecisions: [],
    history: [
      { id: 'h20', status: 'SUBMITTED', changedBy: 'Prof. Rina Suryani, M.Pd.', changedAt: '2026-05-22T08:00:00Z' },
      { id: 'h21', status: 'PUBLISHED', changedBy: 'Admin Editor', changedAt: '2026-07-16T14:00:00Z' }
    ]
  },
  {
    id: 'art-rev-03',
    title: 'Model Prediksi Ketahanan Pangan Berbasis Satelit Sentinel-2 dan Algoritma Random Forest di Daerah Aliran Sungai Citarum',
    abstract: 'Keamanan pangan nasional sangat bergantung pada pemantauan estimasi hasil panen padi secara berkala. Penelitian ini mengkombinasikan citra satelit multispektral dengan teknik pemodelan spasial untuk memetakan produktivitas lahan pertanian secara presisi.',
    keywords: ['Penginderaan Jauh', 'Sentinel-2', 'Random Forest', 'Ketahanan Pangan', 'GIS'],
    discipline: 'Sains & Teknologi',
    authors: [
      { id: 'a4', name: 'Bambang Pratama, M.Sc.', email: 'bambang.pratama@brin.go.id', institution: 'Badan Riset dan Inovasi Nasional (BRIN)', isCorresponding: true },
      { id: 'a5', name: 'Dr. Maya Kartika', email: 'maya.k@ipb.ac.id', institution: 'IPB University' }
    ],
    fullText: `
# 1. Pendahuluan
Perubahan iklim global memicu ketidakpastian pola tanam di wilayah tropis. Pemantauan terestrial secara manual memerlukan biaya tinggi dan waktu yang lama. Oleh karena itu, adopsi citra satelit resolusi tinggi menjadi solusi strategis.

# 2. Data dan Metode
Menggunakan indeks vegetasi NDVI, EVI, dan NDWI yang diekstrak dari citra satelit Sentinel-2 rentang tahun 2023-2025. Klasifikasi tutupan lahan dilakukan menggunakan algoritma Random Forest dengan 500 decision trees.
    `,
    fileName: 'draft_prediksi_pangan_citarum.pdf',
    fileSize: '3.4 MB',
    status: 'UNDER_REVIEW',
    createdAt: '2026-07-01T09:00:00Z',
    updatedAt: '2026-07-20T11:00:00Z',
    submittedAt: '2026-07-02T10:00:00Z',
    metrics: { views: 120, downloads: 45, citations: 0 },
    assignedReviewers: [
      { reviewerId: 'rev-ai', reviewerName: 'Gemini AI Reviewer', reviewerEmail: 'ai-peer-review@jurnalnusantara.org', status: 'COMPLETED', assignedAt: '2026-07-03T08:00:00Z', completedAt: '2026-07-03T08:02:00Z' },
      { reviewerId: 'rev-03', reviewerName: 'Dr. Ir. Hadi Suwito', reviewerEmail: 'hadi.suwito@ugm.ac.id', status: 'PENDING', assignedAt: '2026-07-05T09:00:00Z' }
    ],
    peerReviews: [
      {
        id: 'pr-ai-03',
        reviewerId: 'rev-ai',
        reviewerName: 'Gemini AI Reviewer',
        reviewerRole: 'AI_GEMINI',
        createdAt: '2026-07-03T08:02:00Z',
        score: { originality: 8, methodology: 7, clarity: 8, academicImpact: 8, overall: 8 },
        recommendation: 'MINOR_REVISION',
        summaryComments: 'Artikel menyajikan pengolahan citra satelit yang komprehensif. Namun, validasi lapangan (ground truth validation) perlu diperjelas kuantitas sampelnya.',
        strengths: ['Gaya penulisan akademik yang padat dan lugas', 'Visualisasi hasil klasifikasi lahan sangat informatif'],
        weaknesses: ['Penjelasan pengoreksian gangguan awan pada citra satelit kurang terperinci'],
        detailedFeedback: [
          { section: 'Data dan Metode', comment: 'Bagaimana metode cloud masking yang diterapkan pada citra Sentinel-2?', recommendation: 'Jelaskan apakah menggunakan cloud mask band bawaan QA60 atau algoritma Sen2Cor.' }
        ],
        plagiarismEstimatePercent: 6
      }
    ],
    editorialDecisions: [],
    history: [
      { id: 'h30', status: 'SUBMITTED', changedBy: 'Bambang Pratama, M.Sc.', changedAt: '2026-07-02T10:00:00Z', notes: 'Artikel dikirim oleh Penulis' },
      { id: 'h31', status: 'INITIAL_SCREENING', changedBy: 'Admin Editor', changedAt: '2026-07-03T07:30:00Z', notes: 'Lolos cek format awal' },
      { id: 'h32', status: 'UNDER_REVIEW', changedBy: 'Admin Editor', changedAt: '2026-07-03T08:00:00Z', notes: 'Penugasan Peer Review AI & Pakar' }
    ]
  },
  {
    id: 'art-sub-04',
    title: 'Pengaruh Kebijakan Insentif Pajak Hijau Terhadap Pertumbuhan Investasi Energi Terbarukan di Indonesia',
    abstract: 'Kajian hukum dan ekonomi ini menganalisis implikasi Regulasi Pajak Karbon dan Tax Holiday terhadap minat investor domestik dan asing pada sektor pembangkit listrik tenaga surya (PLTS).',
    keywords: ['Pajak Hijau', 'Energi Terbarukan', 'Kebijakan Publik', 'Investasi PLTS', 'Hukum Ekonomi'],
    discipline: 'Ekonomi & Bisnis',
    authors: [
      { id: 'a6', name: 'Dian Anggraini, S.H., M.E.', email: 'dian.anggraini@kemenkeu.go.id', institution: 'Kementerian Keuangan RI', isCorresponding: true }
    ],
    fullText: `
# 1. Pendahuluan
Komitmen pencapaian Net Zero Emission 2060 membutuhkan investasi fiskal berkeberlanjutan. Pemerintah telah menerbitkan berbagai regulasi insentif perpajakan untuk mendorong peralihan energi fosil.

# 2. Tinjauan Pustaka & Kebijakan
Studi ini membedah Peraturan Menteri Keuangan tentang insentif fiskal energi bersih dan membandingkannya dengan praktik terbaik di Vietnam dan Thailand.
    `,
    fileName: 'insentif_pajak_hijau_dian.pdf',
    fileSize: '950 KB',
    status: 'SUBMITTED',
    createdAt: '2026-07-25T14:20:00Z',
    updatedAt: '2026-07-25T14:20:00Z',
    submittedAt: '2026-07-25T14:20:00Z',
    metrics: { views: 35, downloads: 12, citations: 0 },
    assignedReviewers: [],
    peerReviews: [],
    editorialDecisions: [],
    history: [
      { id: 'h40', status: 'SUBMITTED', changedBy: 'Dian Anggraini, S.H., M.E.', changedAt: '2026-07-25T14:20:00Z', notes: 'Naskah baru diserahkan oleh penulis' }
    ]
  }
];

export const INITIAL_NOTIFICATIONS: EmailNotification[] = [
  {
    id: 'notif-01',
    recipientEmail: 'bambang.pratama@brin.go.id',
    recipientName: 'Bambang Pratama, M.Sc.',
    subject: '[Jurnal Nusantara] Pembaruan Status Artikel: Dalam Peer Review',
    body: 'Yth. Bapak Bambang Pratama,\n\nNaskah ilmiah Anda yang berjudul "Model Prediksi Ketahanan Pangan Berbasis Satelit Sentinel-2 dan Algoritma Random Forest..." telah lolos skrining awal dan saat ini sedang memasuki proses Peer Review oleh Mitra Bestari.\n\nAnda dapat memantau perkembangan proses penelaahan melalui Dashboard Penulis.\n\nSalam hormat,\nDewan Redaksi Jurnal Nusantara',
    sentAt: '2026-07-03T08:01:00Z',
    statusTrigger: 'UNDER_REVIEW',
    articleId: 'art-rev-03',
    articleTitle: 'Model Prediksi Ketahanan Pangan Berbasis Satelit Sentinel-2...',
    isRead: false
  },
  {
    id: 'notif-02',
    recipientEmail: 'ahmad.fauzi@ui.ac.id',
    recipientName: 'Dr. Ahmad Fauzi, M.T.',
    subject: '[Jurnal Nusantara] Selamat! Artikel Anda telah Resmi Diterbitkan (Vol. 5 No. 2)',
    body: 'Yth. Dr. Ahmad Fauzi,\n\nDengan bangga kami informasikan bahwa naskah Anda yang berjudul "Penerapan Model Large Language Model Gemini untuk Deteksi Otomatis Anomali pada Jaringan IoT Industri" telah resmi diterbitkan pada Vol. 5 No. 2 (2026).\n\nDOI Artikel: 10.31219/jurnalnusantara.v5i2.101\n\nTerima kasih atas kontribusi ilmiah Anda.\n\nSalam hangat,\nEditor in Chief - Jurnal Nusantara',
    sentAt: '2026-07-15T10:01:00Z',
    statusTrigger: 'PUBLISHED',
    articleId: 'art-pub-01',
    articleTitle: 'Penerapan Model Large Language Model Gemini untuk Deteksi Otomatis Anomali...',
    isRead: true
  }
];
