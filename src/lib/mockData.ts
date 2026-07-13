import {
  Account,
  AccountIntel,
  Opportunity,
  NewsItem,
  OrgPerson,
  EngProject,
  SuggestedEmail,
} from "./types";

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

export const seedAccounts: Account[] = [
  { id: "acc-relativity", name: "Relativity", domain: "relativity.com", industry: "Legal Tech", vertical: "Software", type: "opportunity", employees: "1,500", hq: "Chicago, IL", stage: "Evaluation", amount: "$480K", closeDate: "2026-09-30" },
  { id: "acc-backblaze", name: "Backblaze", domain: "backblaze.com", industry: "Cloud Storage", vertical: "Infrastructure", type: "opportunity", employees: "350", hq: "San Mateo, CA", stage: "Technical Validation", amount: "$220K", closeDate: "2026-08-15" },
  { id: "acc-bill", name: "BILL", domain: "bill.com", industry: "Fintech", vertical: "Financial Services", type: "pg", employees: "2,500", hq: "San Jose, CA" },
  { id: "acc-quantum", name: "Quantum", domain: "quantum.com", industry: "Data Storage", vertical: "Infrastructure", type: "pg", employees: "1,100", hq: "San Jose, CA" },
  { id: "acc-netradyne", name: "Netradyne", domain: "netradyne.com", industry: "Fleet AI / IoT", vertical: "Transportation", type: "pg", employees: "1,300", hq: "San Diego, CA" },
  { id: "acc-r365", name: "Restaurant365", domain: "restaurant365.com", industry: "Restaurant SaaS", vertical: "Software", type: "opportunity", employees: "1,200", hq: "Irvine, CA", stage: "Pilot Scoping", amount: "$350K", closeDate: "2026-10-31" },
  { id: "acc-liveramp", name: "LiveRamp", domain: "liveramp.com", industry: "Data Collaboration", vertical: "AdTech", type: "opportunity", employees: "1,400", hq: "San Francisco, CA", stage: "Pilot Scoping", amount: "$400K", closeDate: "2026-09-15" },
  { id: "acc-marqeta", name: "Marqeta", domain: "marqeta.com", industry: "Card Issuing", vertical: "Financial Services", type: "pg", employees: "900", hq: "Oakland, CA" },
];

export const seedOpportunities: Opportunity[] = [
  {
    id: "opp-1", accountId: "acc-relativity", name: "Relativity — Devin Enterprise (aiR eng org)", stage: "Evaluation", amount: "$480K", closeDate: "2026-09-30", nextStep: "Security review with platform team",
    forecastCategory: "best-case",
    stageHistory: [
      { stage: "Discovery", date: daysAgo(75) },
      { stage: "Pilot Scoping", date: daysAgo(48) },
      { stage: "Evaluation", date: daysAgo(20) },
    ],
    nextSteps: [
      { id: "ns-1a", text: "Security review with platform team", done: false, due: "2026-07-24" },
      { id: "ns-1b", text: "Send pilot ROI summary to Keith", done: true },
    ],
    meddpicc: {
      metrics: "30% of platform eng time on maintenance; pilot showed 22 PRs merged async in 3 weeks",
      champion: "Keith Carlson (CTO) — publicly bought in on agents",
      identifiedPain: "EU expansion + platform modernization competing for the same engineers",
      competition: "Cursor enterprise eval running in parallel",
    },
    map: [
      { id: "map-1a", title: "Pilot readout with eng leadership", owner: "us", due: "2026-07-20", done: true },
      { id: "map-1b", title: "Security review sign-off", owner: "customer", due: "2026-08-01", done: false },
      { id: "map-1c", title: "Commercial proposal to procurement", owner: "us", due: "2026-08-15", done: false },
    ],
    lastActivity: daysAgo(3),
  },
  {
    id: "opp-2", accountId: "acc-backblaze", name: "Backblaze — Devin Teams (B2 platform)", stage: "Technical Validation", amount: "$220K", closeDate: "2026-08-15", nextStep: "Pilot results readout w/ VP Eng",
    forecastCategory: "commit",
    stageHistory: [
      { stage: "Discovery", date: daysAgo(60) },
      { stage: "Technical Validation", date: daysAgo(25) },
    ],
    nextSteps: [{ id: "ns-2a", text: "Pilot results readout w/ VP Eng", done: false, due: "2026-07-17" }],
    meddpicc: {
      champion: "Laura Chen (VP Platform Eng)",
      identifiedPain: "Drive-fleet maintenance eating reliability roadmap",
    },
    lastActivity: daysAgo(1),
  },
  {
    id: "opp-3", accountId: "acc-r365", name: "Restaurant365 — Devin Pilot", stage: "Pilot Scoping", amount: "$350K", closeDate: "2026-10-31", nextStep: "Scope backlog use cases with eng leads",
    forecastCategory: "pipeline",
    stageHistory: [{ stage: "Pilot Scoping", date: daysAgo(30) }],
    nextSteps: [{ id: "ns-3a", text: "Scope backlog use cases with eng leads", done: false }],
    lastActivity: daysAgo(18),
  },
  {
    id: "opp-4", accountId: "acc-liveramp", name: "LiveRamp — Devin Pilot", stage: "Pilot Scoping", amount: "$400K", closeDate: "2026-09-15", nextStep: "Align pilot success criteria with CTO office",
    forecastCategory: "best-case",
    stageHistory: [{ stage: "Pilot Scoping", date: daysAgo(22) }],
    nextSteps: [{ id: "ns-4a", text: "Align pilot success criteria with CTO office", done: false, due: "2026-07-18" }],
    meddpicc: { identifiedPain: "Identity infra migration with flat headcount" },
    lastActivity: daysAgo(6),
  },
];

export const seedIntel: AccountIntel[] = [
  {
    accountId: "acc-relativity",
    earningsSummary: "Private; investor updates emphasize aiR revenue growth and EU expansion. Hiring data shows Krakow hub scaling while US platform headcount is flat — classic do-more-with-less setup.",
    painHypotheses: "1) EU data residency work is pulling platform engineers off the aiR roadmap. 2) Legacy Server → RelativityOne migration is a multi-year tax. 3) QA automation gap flagged in eng blog posts.",
    competitors: [
      { id: "comp-1a", name: "Cursor (enterprise)", angle: "IDE assistant, not autonomous — position Devin on async backlog execution, not autocomplete." },
    ],
  },
  {
    accountId: "acc-backblaze",
    earningsSummary: "Public (BLZE). Last call: B2 revenue +27% YoY, gross margin pressure from AI storage buildout, explicit 'operational efficiency' language from CFO.",
    painHypotheses: "1) CoreWeave capacity buildout strains platform team. 2) Drive-fleet software maintenance is unglamorous, constant, and measurable — ideal Devin wedge.",
    competitors: [],
  },
];

export const seedNews: NewsItem[] = [
  { id: "n1", accountId: "acc-relativity", headline: "Relativity expands aiR for Review to EU data centers", summary: "Relativity announced GA of aiR for Review in EMEA, citing rapid growth in AI-assisted document review workloads and new hiring across its Krakow engineering hub.", source: "Relativity Newsroom", url: "https://www.relativity.com/company/newsroom/", date: daysAgo(4), category: "product", whyItMatters: "AI product scaling = platform/infra work piling up for the eng org your opp lives in." },
  { id: "n2", accountId: "acc-relativity", headline: "CTO posts on LinkedIn about agentic workflows in e-discovery", summary: "Relativity's CTO shared a post on how agentic AI will change legal review, with strong engagement from legal tech leaders.", source: "LinkedIn", url: "https://www.linkedin.com/company/relativity/", date: daysAgo(2), category: "linkedin-post", execName: "Keith Carlson", execTitle: "CTO", whyItMatters: "Direct hook for outreach: he is publicly bought in on agents. Reference the post." },
  { id: "n3", accountId: "acc-backblaze", headline: "Backblaze announces expanded CoreWeave partnership for AI storage", summary: "Backblaze deepened its partnership with CoreWeave to serve AI training workloads on B2, projecting significant capacity growth through 2027.", source: "Backblaze Blog", url: "https://www.backblaze.com/blog/", date: daysAgo(9), category: "partnership", whyItMatters: "Capacity growth means platform engineering strain. Ties directly to your pilot value story." },
  { id: "n4", accountId: "acc-bill", headline: "BILL Q2 earnings: 110% net revenue retention, doubling down on AI", summary: "BILL leadership highlighted AI-driven automation in AP/AR as the core growth lever and flagged increased R&D investment.", source: "Earnings Call", url: "https://investor.bill.com/", date: daysAgo(12), category: "earnings", whyItMatters: "R&D investment up = budget exists. AI mandate = Devin story lands with eng leadership." },
  { id: "n5", accountId: "acc-bill", headline: "Eric Chan (BILL eng leader) posts 'what I'm building' thread", summary: "Eric Chan published a public post outlining his team's platform modernization priorities for the year.", source: "LinkedIn", url: "https://www.linkedin.com/company/bill-com/", date: daysAgo(3), category: "linkedin-post", execName: "Eric Chan", execTitle: "VP Engineering", whyItMatters: "Fresh public post by a target exec is the strongest cold outreach hook available." },
  { id: "n6", accountId: "acc-quantum", headline: "Quantum ships Myriad all-flash file system update", summary: "Quantum released a major update to Myriad targeting AI/ML data pipelines, with object storage integration on the roadmap.", source: "Quantum Press", url: "https://www.quantum.com/en/company/newsroom/", date: daysAgo(18), category: "product", whyItMatters: "Active product push = integration and test burden. Dimitri owns Object Storage; angle for PG." },
  { id: "n7", accountId: "acc-netradyne", headline: "Netradyne launches Netradyne Intelligence analytics suite", summary: "New AI analytics layer across the Driver-i platform, plus expanded hiring for platform and data engineering roles in San Diego and Bangalore.", source: "Netradyne Newsroom", url: "https://www.netradyne.com/newsroom", date: daysAgo(7), category: "product", whyItMatters: "AI-first company: angle is non-model engineering work (migrations, deps, tests) eating their best engineers' time." },
  { id: "n8", accountId: "acc-r365", headline: "Restaurant365 acquires ExpandShare, integration work underway", summary: "R365 is integrating the ExpandShare training platform into its core suite, a multi-quarter engineering integration effort.", source: "R365 Press", url: "https://www.restaurant365.com/press/", date: daysAgo(21), category: "partnership", whyItMatters: "Acquisition integrations are a canonical Devin use case. Use in pilot scoping conversation." },
  { id: "n9", accountId: "acc-liveramp", headline: "LiveRamp posts 14 new senior platform engineering roles", summary: "Job postings signal a major investment in the clean room platform and a migration off legacy identity infrastructure.", source: "LiveRamp Careers", url: "https://liveramp.com/careers/", date: daysAgo(6), category: "hiring", whyItMatters: "Migration signal from job postings. Bring this to the pilot scoping call as a target workload." },
  { id: "n10", accountId: "acc-marqeta", headline: "Marqeta names new Chief Technology Officer", summary: "Marqeta announced a new CTO hire from a major fintech, with a mandate to scale the issuing platform internationally.", source: "Marqeta Newsroom", url: "https://www.marqeta.com/company/newsroom", date: daysAgo(5), category: "exec-move", whyItMatters: "New-in-seat exec is the highest-converting PG trigger in your playbook. Send within 30 days." },
  { id: "n11", accountId: "acc-backblaze", headline: "VP Platform Engineering speaks at SREcon on storage reliability", summary: "Talk covered Backblaze's shard-level reliability tooling and the operational cost of drive-fleet software maintenance.", source: "SREcon", url: "https://www.usenix.org/srecon", date: daysAgo(26), category: "engineering", whyItMatters: "Public technical content from a champion-adjacent exec. Reference in multi-threading emails." },
  { id: "n12", accountId: "acc-quantum", headline: "Quantum CFO flags cost discipline on earnings call", summary: "Leadership emphasized operational efficiency and doing more with existing engineering headcount.", source: "Earnings Call", url: "https://investors.quantum.com/", date: daysAgo(40), category: "earnings", whyItMatters: "Efficiency mandate = Devin ROI framing (offload async work without headcount)." },
];

export const seedOrgPeople: OrgPerson[] = [
  // Relativity — 6 layers
  { id: "p-rel-1", accountId: "acc-relativity", name: "Phil Saunders", title: "CEO", layer: 1, reportsTo: null, linkedinUrl: "https://www.linkedin.com/in/phil-saunders", focusArea: "Company strategy" },
  { id: "p-rel-2", accountId: "acc-relativity", name: "Keith Carlson", title: "CTO", layer: 2, reportsTo: "p-rel-1", linkedinUrl: "https://www.linkedin.com/company/relativity/", focusArea: "All engineering, aiR platform", detail: "Ex-AWS", projectConnection: "Publicly championing agentic AI in e-discovery", evidenceUrl: "https://www.linkedin.com/company/relativity/", role: "champion", relationship: "engaged", lastTouched: daysAgo(5) },
  { id: "p-rel-3", accountId: "acc-relativity", name: "Anita Rao", title: "SVP Engineering, RelativityOne", layer: 3, reportsTo: "p-rel-2", focusArea: "Core SaaS platform", detail: "8 yrs at Relativity" },
  { id: "p-rel-4", accountId: "acc-relativity", name: "Marek Nowak", title: "SVP Engineering, Krakow", layer: 3, reportsTo: "p-rel-2", focusArea: "EMEA engineering hub", detail: "Leads 300+ engineers" },
  { id: "p-rel-5", accountId: "acc-relativity", name: "David Kim", title: "VP Platform Engineering", layer: 4, reportsTo: "p-rel-3", focusArea: "Infra, CI/CD, developer experience", projectConnection: "Owns EU data center expansion for aiR", evidenceUrl: "https://www.relativity.com/company/newsroom/", role: "neutral", relationship: "met", lastTouched: daysAgo(12) },
  { id: "p-rel-6", accountId: "acc-relativity", name: "Sara Whitman", title: "VP AI Engineering", layer: 4, reportsTo: "p-rel-2", focusArea: "aiR for Review models & serving" },
  { id: "p-rel-7", accountId: "acc-relativity", name: "Tom Beckett", title: "Director, Developer Productivity", layer: 5, reportsTo: "p-rel-5", focusArea: "Build systems, internal tooling", emailStatus: "pattern-derived", email: "tbeckett@relativity.com" },
  { id: "p-rel-8", accountId: "acc-relativity", name: "Ewa Kaczmarek", title: "Director, Quality Engineering", layer: 5, reportsTo: "p-rel-4", focusArea: "Test automation across RelativityOne" },
  { id: "p-rel-9", accountId: "acc-relativity", name: "Chris Doyle", title: "Senior Manager, Platform Services", layer: 6, reportsTo: "p-rel-7", focusArea: "Shared services, API platform" },
  // Backblaze
  { id: "p-bb-1", accountId: "acc-backblaze", name: "Gleb Budman", title: "CEO", layer: 1, reportsTo: null, linkedinUrl: "https://www.linkedin.com/in/glebbudman", focusArea: "Co-founder" },
  { id: "p-bb-2", accountId: "acc-backblaze", name: "Siva Kumar", title: "CTO", layer: 2, reportsTo: "p-bb-1", focusArea: "B2 platform, storage engineering" },
  { id: "p-bb-3", accountId: "acc-backblaze", name: "Laura Chen", title: "VP Platform Engineering", layer: 4, reportsTo: "p-bb-2", focusArea: "Drive fleet software, reliability", projectConnection: "SREcon talk on shard-level reliability tooling", evidenceUrl: "https://www.usenix.org/srecon", role: "champion", relationship: "strong", lastTouched: daysAgo(2) },
  { id: "p-bb-4", accountId: "acc-backblaze", name: "Marcus Lee", title: "Director, Storage Engineering", layer: 5, reportsTo: "p-bb-3", focusArea: "Vault architecture" },
  // BILL
  { id: "p-bill-1", accountId: "acc-bill", name: "René Lacerte", title: "CEO", layer: 1, reportsTo: null, linkedinUrl: "https://www.linkedin.com/in/renelacerte", focusArea: "Founder" },
  { id: "p-bill-2", accountId: "acc-bill", name: "Priya Sharma", title: "CTO", layer: 2, reportsTo: "p-bill-1", focusArea: "AI-driven AP/AR automation" },
  { id: "p-bill-3", accountId: "acc-bill", name: "Eric Chan", title: "VP Engineering", layer: 4, reportsTo: "p-bill-2", focusArea: "Platform modernization", email: "echan@hq.bill.com", emailStatus: "pattern-derived", projectConnection: "Public 'what I'm building' post on platform priorities", evidenceUrl: "https://www.linkedin.com/company/bill-com/" },
  // Quantum
  { id: "p-q-1", accountId: "acc-quantum", name: "Jamie Lerner", title: "CEO", layer: 1, reportsTo: null, focusArea: "Turnaround, AI data strategy" },
  { id: "p-q-2", accountId: "acc-quantum", name: "Choon-Seng Tan", title: "SVP Engineering", layer: 3, reportsTo: "p-q-1", focusArea: "Company-wide engineering", projectConnection: "Strategic engineering efficiency mandate", evidenceUrl: "https://investors.quantum.com/" },
  { id: "p-q-3", accountId: "acc-quantum", name: "Dimitri Staessens", title: "VP Engineering, Object Storage", layer: 4, reportsTo: "p-q-2", focusArea: "ActiveScale object storage", projectConnection: "Myriad object storage integration roadmap", evidenceUrl: "https://www.quantum.com/en/company/newsroom/" },
];

export const seedProjects: EngProject[] = [
  { id: "proj-1", accountId: "acc-relativity", name: "aiR EU data center expansion", description: "Standing up aiR for Review across EU regions with data residency requirements.", sourceUrl: "https://www.relativity.com/company/newsroom/", devinValueAttach: "Infra-as-code rollout, config migration, and test coverage across regions." },
  { id: "proj-2", accountId: "acc-relativity", name: "RelativityOne platform modernization", description: "Ongoing move of legacy Server components into the RelativityOne SaaS platform.", sourceUrl: "https://www.relativity.com/", devinValueAttach: "Large-scale migration work: Devin's highest-ROI use case." },
  { id: "proj-3", accountId: "acc-backblaze", name: "CoreWeave AI storage capacity buildout", description: "Scaling B2 to serve AI training workloads under the expanded CoreWeave deal.", sourceUrl: "https://www.backblaze.com/blog/", devinValueAttach: "Drive-fleet software maintenance and reliability tooling offloaded async." },
  { id: "proj-4", accountId: "acc-bill", name: "AP/AR AI automation platform", description: "Core AI investment area named on earnings; platform modernization underway.", sourceUrl: "https://investor.bill.com/", devinValueAttach: "Dependency updates, test coverage, and service migrations while their team builds AI features." },
  { id: "proj-5", accountId: "acc-r365", name: "ExpandShare acquisition integration", description: "Integrating the acquired training platform into the R365 core suite.", sourceUrl: "https://www.restaurant365.com/press/", devinValueAttach: "Acquisition codebase integration: canonical Devin pilot workload." },
  { id: "proj-6", accountId: "acc-liveramp", name: "Identity infrastructure migration", description: "Job postings signal a migration off legacy identity infrastructure for the clean room platform.", sourceUrl: "https://liveramp.com/careers/", devinValueAttach: "Migration execution plus keeping docs and tests current during the move." },
];

const today = new Date().toISOString();

export const seedEmails: SuggestedEmail[] = [
  {
    id: "e1", accountId: "acc-marqeta", personName: "Alex Rivera", personTitle: "Chief Technology Officer", toEmail: "arivera@marqeta.com", emailVerified: true,
    subject: "Congrats on the CTO role", whyNowSignal: "Named CTO 3 weeks ago with international scaling mandate", signalUrl: "https://www.marqeta.com/company/newsroom", status: "suggested", date: today,
    body: `Hi Alex,\n\nSaw you recently joined Marqeta as CTO (congrats!) and wanted to reach out. We've been working with a few orgs in a similar spot like Nubank, Itau, and Hippo and thought there might be something worth a conversation.\n\nStepping into an issuing platform that's scaling internationally usually means inheriting a backlog of migrations, compliance work, and platform cleanup before you can move on the new roadmap.\n\nDevin, our autonomous AI software engineer, can handle a lot of that supporting work async: large-scale migrations, vulnerability remediation, dependency updates, and test coverage. That keeps your engineers focused on the international expansion itself.\n\nAre you open to a chat?\n\nBest,`,
  },
  {
    id: "e2", accountId: "acc-bill", personName: "Eric Chan", personTitle: "VP Engineering", personLinkedin: "https://www.linkedin.com/company/bill-com/", toEmail: "echan@hq.bill.com", emailVerified: false,
    subject: "BILL + Devin", whyNowSignal: "Public 'what I'm building' post on platform modernization priorities", signalUrl: "https://www.linkedin.com/company/bill-com/", status: "suggested", date: today,
    body: `Hi Eric,\n\nYour post on what you're building this year at BILL made the rounds on my team, and I wanted to reach out. We've been working with a few orgs in a similar spot like Nubank, Itau, and AngelList.\n\nPlatform modernization at BILL's scale, while the company doubles down on AI in AP/AR, means a lot of engineering work that isn't the fun part: service migrations, dependency updates, and keeping tests honest along the way.\n\nDevin, our autonomous AI software engineer, handles that supporting work async so your team stays focused on the modernization goals you laid out.\n\nAre you open to a chat?\n\nBest,`,
  },
  {
    id: "e3", accountId: "acc-quantum", personName: "Dimitri Staessens", personTitle: "VP Engineering, Object Storage", toEmail: "dstaessens@quantum.com", emailVerified: true,
    subject: "Quick one, Dimitri", whyNowSignal: "Myriad update with object storage integration on roadmap", signalUrl: "https://www.quantum.com/en/company/newsroom/", status: "suggested", date: today,
    body: `Hi Dimitri,\n\nSaw the Myriad update targeting AI/ML pipelines, with object storage integration on the roadmap, and wanted to reach out. We've been working with a few infrastructure orgs like NVIDIA, Cloudflare, and Cisco.\n\nAn integration push like that creates a long tail of engineering work: API glue, test matrices across configurations, and docs that go stale the moment they're written.\n\nDevin, our autonomous AI software engineer, takes that work async so your object storage team stays focused on the core system.\n\nAre you open to a chat?\n\nBest,`,
  },
  {
    id: "e4", accountId: "acc-quantum", personName: "Choon-Seng Tan", personTitle: "SVP Engineering", toEmail: "ctan@quantum.com", emailVerified: false,
    subject: "Quantum + Devin", whyNowSignal: "CFO efficiency mandate on earnings call", signalUrl: "https://investors.quantum.com/", status: "suggested", date: today,
    body: `Hi Choon-Seng,\n\nI noticed leadership's emphasis on doing more with existing engineering headcount on the last earnings call, and wanted to reach out. We've been working with a few infrastructure orgs like NVIDIA, Cloudflare, and Cisco.\n\nThat mandate usually lands on engineering as a backlog problem: modernization, security remediation, and maintenance that has to happen without new hires.\n\nDevin, our autonomous AI software engineer, works through that backlog async: migrations, vulnerability fixes, dependency updates, and test coverage. Your engineers stay on the roadmap.\n\nAre you open to a chat?\n\nBest,`,
    feedback: "Same-company duplicate with Dimitri. Differentiated angle (company-wide vs Object Storage). You decide whether to send both.",
  },
  {
    id: "e5", accountId: "acc-netradyne", personName: "Sanjay Rao", personTitle: "SVP Engineering", toEmail: "srao@netradyne.com", emailVerified: true,
    subject: "Netradyne + Devin", whyNowSignal: "Netradyne Intelligence launch + platform hiring wave", signalUrl: "https://www.netradyne.com/newsroom", status: "suggested", date: today,
    body: `Hi Sanjay,\n\nCongrats on the Netradyne Intelligence launch. We've been working with a few orgs building AI products like NVIDIA, Cisco, and Cloudflare, and I wanted to reach out.\n\nEven at an AI-first company, the non-model engineering work (platform migrations, dependency updates, test infrastructure) tends to eat your best engineers' time right when you need them on the product.\n\nDevin, our autonomous AI software engineer, takes that work async so the team you're hiring stays pointed at Driver-i and the new analytics layer.\n\nAre you open to a chat?\n\nBest,`,
  },
  {
    id: "e6", accountId: "acc-relativity", personName: "David Kim", personTitle: "VP Platform Engineering", toEmail: "dkim@relativity.com", emailVerified: true,
    subject: "Relativity + Devin", whyNowSignal: "Owns aiR EU data center expansion", signalUrl: "https://www.relativity.com/company/newsroom/", status: "suggested", date: today,
    body: `Hi David,\n\nSaw the aiR for Review EMEA rollout announcement and wanted to reach out, since the EU expansion looks like it runs through your platform org. We've been working with a few orgs in a similar spot like Litera, FE fundinfo, and Hippo.\n\nMulti-region rollouts with data residency requirements mean a pile of infra-as-code, config migration, and regression testing that has to be right but doesn't need your senior engineers doing it by hand.\n\nDevin, our autonomous AI software engineer, handles that work async so your platform team stays focused on the architecture.\n\nAre you open to a chat?\n\nBest,`,
  },
  {
    id: "e7", accountId: "acc-backblaze", personName: "Laura Chen", personTitle: "VP Platform Engineering", toEmail: "lchen@backblaze.com", emailVerified: true,
    subject: "Backblaze + Devin", whyNowSignal: "SREcon talk on drive-fleet software maintenance cost", signalUrl: "https://www.usenix.org/srecon", status: "suggested", date: today,
    body: `Hi Laura,\n\nCaught your SREcon talk on shard-level reliability tooling, the point about the operational cost of drive-fleet software maintenance stuck with me. We've been working with a few infrastructure orgs like NVIDIA, Cloudflare, and Cisco.\n\nWith the CoreWeave capacity buildout ahead, that maintenance load only grows.\n\nDevin, our autonomous AI software engineer, takes exactly that kind of work async: reliability tooling upkeep, dependency updates, and test coverage across the fleet software. Your team stays on the buildout.\n\nAre you open to a chat?\n\nBest,`,
  },
  {
    id: "e8", accountId: "acc-liveramp", personName: "Nina Patel", personTitle: "VP Engineering, Identity", toEmail: "npatel@liveramp.com", emailVerified: false,
    subject: "Quick one, Nina", whyNowSignal: "14 senior platform roles posted, legacy identity migration signal", signalUrl: "https://liveramp.com/careers/", status: "suggested", date: today,
    body: `Hi Nina,\n\nThe wave of senior platform postings at LiveRamp caught my eye, they read like a migration off legacy identity infrastructure is underway. We've been working with a few orgs in a similar spot like AngelList, Hippo, and FE fundinfo.\n\nMigrations like that are exactly where hiring alone doesn't move the timeline: the work is broad, repetitive, and blocks the clean room roadmap until it's done.\n\nDevin, our autonomous AI software engineer, executes migration work async, keeping docs and tests current as the code moves. Your new hires start on the platform, not the cleanup.\n\nAre you open to a chat?\n\nBest,`,
  },
  {
    id: "e9", accountId: "acc-r365", personName: "Miguel Torres", personTitle: "VP Engineering", toEmail: "mtorres@restaurant365.com", emailVerified: true,
    subject: "Restaurant365 + Devin", whyNowSignal: "ExpandShare acquisition integration underway", signalUrl: "https://www.restaurant365.com/press/", status: "suggested", date: today,
    body: `Hi Miguel,\n\nSaw the ExpandShare acquisition and wanted to reach out. We've been working with a few orgs mid-integration like Litera, Hippo, and AngelList.\n\nFolding an acquired platform into the core suite means months of unglamorous engineering: API reconciliation, auth unification, duplicated services to retire, and a test suite that spans two codebases.\n\nDevin, our autonomous AI software engineer, takes that integration work async so your team stays focused on the combined product.\n\nAre you open to a chat?\n\nBest,`,
  },
  {
    id: "e10", accountId: "acc-relativity", personName: "Keith Carlson", personTitle: "CTO", personLinkedin: "https://www.linkedin.com/company/relativity/", toEmail: "kcarlson@relativity.com", emailVerified: true,
    subject: "Relativity + Devin", whyNowSignal: "LinkedIn post on agentic workflows in e-discovery", signalUrl: "https://www.linkedin.com/company/relativity/", status: "suggested", date: today,
    body: `Hi Keith,\n\nYour post on agentic AI in legal review lines up with a lot of what we're seeing, and I wanted to reach out. We've been working with a few orgs in a similar spot like Litera, FE fundinfo, and Hippo.\n\nAs aiR scales into EMEA, the engineering work around the AI (region rollouts, migrations, test coverage) grows faster than the model work itself.\n\nDevin, our autonomous AI software engineer, handles that supporting work async so your teams stay focused on aiR.\n\nAre you open to a chat?\n\nBest,`,
  },
];
