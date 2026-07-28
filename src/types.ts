export type UserRole = 'author' | 'reviewer' | 'admin';

export interface UserAccount {
  id: string;
  username: string;
  password?: string;
  name: string;
  email: string;
  role: 'author' | 'reviewer' | 'admin';
  institution?: string;
  phone?: string;
  approvalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt?: string;
}

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

export type ArticleStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'INITIAL_SCREENING'
  | 'UNDER_REVIEW'
  | 'REVISION_REQUIRED'
  | 'REVISED'
  | 'ACCEPTED'
  | 'PUBLISHED'
  | 'REJECTED';

export interface Author {
  id: string;
  name: string;
  email: string;
  institution: string;
  isCorresponding?: boolean;
}

export interface ReviewScore {
  originality: number; // 1-10
  methodology: number; // 1-10
  clarity: number; // 1-10
  academicImpact: number; // 1-10
  overall: number; // 1-10
}

export interface DetailedFeedbackItem {
  section: string;
  comment: string;
  recommendation: string;
}

export interface PeerReview {
  id: string;
  reviewerId: string;
  reviewerName: string;
  reviewerRole: 'AI_GEMINI' | 'HUMAN_REVIEWER';
  createdAt: string;
  score: ReviewScore;
  recommendation: 'ACCEPT' | 'MINOR_REVISION' | 'MAJOR_REVISION' | 'REJECT';
  summaryComments: string;
  strengths: string[];
  weaknesses: string[];
  detailedFeedback: DetailedFeedbackItem[];
  plagiarismEstimatePercent?: number;
}

export interface AssignedReviewer {
  reviewerId: string;
  reviewerName: string;
  reviewerEmail: string;
  status: 'PENDING' | 'COMPLETED';
  assignedAt: string;
  completedAt?: string;
}

export interface StatusHistoryItem {
  id: string;
  status: ArticleStatus;
  changedBy: string;
  changedAt: string;
  notes?: string;
}

export interface EditorialDecision {
  id: string;
  editorName: string;
  decision: ArticleStatus;
  notes: string;
  createdAt: string;
}

export interface ArticleMetrics {
  views: number;
  downloads: number;
  citations: number;
}

export interface Article {
  id: string;
  title: string;
  abstract: string;
  keywords: string[];
  discipline: string;
  authors: Author[];
  fullText: string;
  fileName?: string;
  fileSize?: string;
  fileUrl?: string;
  status: ArticleStatus;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  publishedAt?: string;
  volume?: string;
  issue?: string;
  doi?: string;
  metrics: ArticleMetrics;
  assignedReviewers: AssignedReviewer[];
  peerReviews: PeerReview[];
  editorialDecisions: EditorialDecision[];
  history: StatusHistoryItem[];
  revisionNotes?: string;
}

export interface EmailNotification {
  id: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  body: string;
  sentAt: string;
  statusTrigger: ArticleStatus | 'REVIEW_ASSIGNED' | 'REVISION_SUBMITTED';
  articleId: string;
  articleTitle: string;
  isRead: boolean;
}

export interface JournalVolume {
  id: string;
  volumeNumber: number;
  issueNumber: number;
  year: number;
  month: string;
  title: string;
  description: string;
  coverImage?: string;
  articleIds: string[];
}
