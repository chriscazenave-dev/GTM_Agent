export type AccountType = "opportunity" | "pg";

export interface Account {
  id: string;
  name: string;
  domain: string;
  industry: string;
  vertical: string;
  type: AccountType;
  employees?: string;
  hq?: string;
  owner?: string;
  stage?: string;
  amount?: string;
  closeDate?: string;
  notes?: string;
}

export interface Opportunity {
  id: string;
  accountId: string;
  name: string;
  stage: string;
  amount: string;
  closeDate: string;
  nextStep?: string;
}

export type NewsCategory =
  | "funding"
  | "product"
  | "hiring"
  | "exec-move"
  | "engineering"
  | "linkedin-post"
  | "earnings"
  | "partnership";

export interface NewsItem {
  id: string;
  accountId: string;
  headline: string;
  summary: string;
  source: string;
  url: string;
  date: string; // ISO
  category: NewsCategory;
  execName?: string;
  execTitle?: string;
  whyItMatters: string;
}

export interface OrgPerson {
  id: string;
  accountId: string;
  name: string;
  title: string;
  layer: 1 | 2 | 3 | 4 | 5 | 6;
  reportsTo: string | null; // person id
  linkedinUrl?: string;
  focusArea?: string;
  detail?: string; // ex-company, tenure
  email?: string;
  emailStatus?: "verified" | "pattern-derived" | "unknown";
  projectConnection?: string;
  evidenceUrl?: string;
  addedManually?: boolean;
}

export interface EngProject {
  id: string;
  accountId: string;
  name: string;
  description: string;
  sourceUrl: string;
  devinValueAttach: string;
}

export type EmailStatus = "suggested" | "approved" | "rejected" | "edited";

export interface SuggestedEmail {
  id: string;
  accountId: string;
  personName: string;
  personTitle: string;
  personLinkedin?: string;
  toEmail: string;
  emailVerified: boolean;
  subject: string;
  body: string;
  whyNowSignal: string;
  signalUrl?: string;
  status: EmailStatus;
  date: string;
  editedBody?: string;
  feedback?: string;
}

export interface OnboardingAnswer {
  questionId: string;
  transcript: string;
  audioDataUrl?: string;
  recordedAt: string;
}

export interface OnboardingState {
  completed: boolean;
  answers: OnboardingAnswer[];
}

export interface ApiKeys {
  openai?: string;
  x?: string;
  exa?: string;
  apollo?: string;
}
