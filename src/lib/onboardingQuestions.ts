export interface OnboardingQuestion {
  id: string;
  question: string;
  hint: string;
}

export const onboardingQuestions: OnboardingQuestion[] = [
  {
    id: "q1",
    question: "What are you selling?",
    hint: "Product, category, and the one-line pitch. E.g. 'Devin, an autonomous AI software engineer, sold as enterprise licenses.'",
  },
  {
    id: "q2",
    question: "Who do you sell to inside an organization?",
    hint: "Titles and levels you normally target. CTO? VP Engineering? Directors? Who signs?",
  },
  {
    id: "q3",
    question: "What does your ideal customer look like?",
    hint: "Industry, company size, tech maturity, geography. What makes an account a great fit?",
  },
  {
    id: "q4",
    question: "What pains do you solve, and what triggers a deal?",
    hint: "Backlogs, migrations, security debt, hiring freezes. What 'why now' signals convert best?",
  },
  {
    id: "q5",
    question: "Who are your best customer logos and proof points?",
    hint: "Real customers you can name by industry, plus your strongest case studies or metrics.",
  },
  {
    id: "q6",
    question: "How do you like to run outreach?",
    hint: "Tone, length, structure, follow-up cadence. Anything you never do (e.g. no em dashes, one CTA only).",
  },
  {
    id: "q7",
    question: "How do deals normally progress after the first meeting?",
    hint: "Pilot? Security review? Procurement? Who gets pulled in and what usually stalls?",
  },
  {
    id: "q8",
    question: "What does multi-threading look like for you in an active opportunity?",
    hint: "Which extra personas do you want mapped and reached in accounts with live opps?",
  },
];
