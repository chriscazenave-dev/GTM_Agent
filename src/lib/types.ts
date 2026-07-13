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

export type ForecastCategory = "commit" | "best-case" | "pipeline";

export interface StageEvent {
  stage: string;
  date: string; // ISO
}

export interface NextStep {
  id: string;
  text: string;
  done: boolean;
  due?: string;
}

export type MeddpiccKey =
  | "metrics"
  | "economicBuyer"
  | "decisionCriteria"
  | "decisionProcess"
  | "paperProcess"
  | "identifiedPain"
  | "champion"
  | "competition";

export interface MapMilestone {
  id: string;
  title: string;
  owner: "us" | "customer";
  due?: string;
  done: boolean;
}

export interface Opportunity {
  id: string;
  accountId: string;
  name: string;
  stage: string;
  amount: string;
  closeDate: string;
  nextStep?: string;
  forecastCategory?: ForecastCategory;
  stageHistory?: StageEvent[];
  nextSteps?: NextStep[];
  meddpicc?: Partial<Record<MeddpiccKey, string>>;
  map?: MapMilestone[];
  lastActivity?: string; // ISO
}

export type NewsCategory =
  | "funding"
  | "product"
  | "hiring"
  | "exec-move"
  | "engineering"
  | "linkedin-post"
  | "earnings"
  | "layoffs"
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

export type PersonRole = "champion" | "blocker" | "neutral" | "economic-buyer";

export type RelationshipStrength = "none" | "met" | "engaged" | "strong";

export interface PersonNote {
  id: string;
  date: string; // ISO
  text: string;
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
  pos?: { x: number; y: number }; // manual chart position override
  meetingNotes?: PersonNote[];
  role?: PersonRole;
  relationship?: RelationshipStrength;
  phone?: string;
  photoUrl?: string;
  lastTouched?: string; // ISO — last time you met/emailed them
}

export interface CompetitorIntel {
  id: string;
  name: string;
  angle: string; // displacement angle
}

export interface AccountIntel {
  accountId: string;
  earningsSummary?: string;
  painHypotheses?: string;
  competitors?: CompetitorIntel[];
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
