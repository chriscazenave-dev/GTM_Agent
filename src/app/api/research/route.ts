import { NextRequest, NextResponse } from "next/server";
import { NewsCategory } from "@/lib/types";

interface ExaResult {
  title?: string;
  url?: string;
  publishedDate?: string;
  text?: string;
}

interface ResearchItem {
  accountId: string;
  headline: string;
  summary: string;
  source: string;
  url: string;
  date: string;
  category: NewsCategory;
  whyItMatters: string;
}

const categoryRules: { category: NewsCategory; pattern: RegExp; why: string }[] = [
  { category: "layoffs", pattern: /\b(layoff|layoffs|workforce reduction|job cuts|restructuring)\b/i, why: "Cost pressure — 'do more with less' is exactly the Devin pitch. Time outreach carefully and lead with efficiency." },
  { category: "exec-move", pattern: /\b(appoints?|hires?|joins as|named|new (cto|cio|ceo|vp)|steps down|departs)\b/i, why: "Exec change resets priorities — new leaders make platform decisions in their first 90 days." },
  { category: "funding", pattern: /\b(raises?|funding|series [a-f]|investment round|valuation)\b/i, why: "Fresh capital means budget for engineering velocity — strike while spend is unlocked." },
  { category: "earnings", pattern: /\b(earnings|quarterly results|q[1-4] (fy)?\d{2,4}|revenue (grew|declined)|guidance)\b/i, why: "Earnings language reveals where the pressure is — mine it for the ROI narrative." },
  { category: "engineering", pattern: /\b(migration|platform|kubernetes|tech stack|rewrit|refactor|infrastructure|developer productivity)\b/i, why: "Tech-stack movement creates repetitive engineering work — the ideal Devin wedge." },
  { category: "hiring", pattern: /\b(hiring|job openings|recruiting|open roles)\b/i, why: "Hiring signals unmet engineering demand — position Devin as capacity without headcount." },
  { category: "partnership", pattern: /\b(partners? with|partnership|alliance|integration with)\b/i, why: "New partnerships create integration work — new code to write and maintain." },
];

function classify(text: string): { category: NewsCategory; why: string } {
  for (const rule of categoryRules) {
    if (rule.pattern.test(text)) return { category: rule.category, why: rule.why };
  }
  return { category: "product", why: "Account activity worth knowing before your next touchpoint." };
}

export async function POST(req: NextRequest) {
  const body: {
    exaKey?: string;
    accounts?: { id: string; name: string; domain: string }[];
  } = await req.json();

  const exaKey = body.exaKey || process.env.EXA_API_KEY;
  const accounts = (body.accounts ?? []).slice(0, 10);

  if (!exaKey) {
    return NextResponse.json(
      { ok: false, reason: "no-key", message: "No Exa key configured. Add one in Settings to enable live research." },
      { status: 200 }
    );
  }
  if (accounts.length === 0) {
    return NextResponse.json({ ok: false, reason: "no-accounts", message: "No accounts to research." }, { status: 200 });
  }

  const items: ResearchItem[] = [];
  const errors: string[] = [];

  await Promise.all(
    accounts.map(async (acc) => {
      try {
        const res = await fetch("https://api.exa.ai/search", {
          method: "POST",
          headers: { "content-type": "application/json", "x-api-key": exaKey },
          body: JSON.stringify({
            query: `${acc.name} (${acc.domain}) news: executive change, funding, layoffs, engineering, earnings`,
            numResults: 5,
            type: "auto",
            category: "news",
            startPublishedDate: new Date(Date.now() - 60 * 86_400_000).toISOString(),
            contents: { text: { maxCharacters: 500 } },
          }),
        });
        if (!res.ok) {
          errors.push(`${acc.name}: Exa returned ${res.status}`);
          return;
        }
        const data: { results?: ExaResult[] } = await res.json();
        for (const r of data.results ?? []) {
          if (!r.title || !r.url) continue;
          const { category, why } = classify(`${r.title} ${r.text ?? ""}`);
          let source = "web";
          try { source = new URL(r.url).hostname.replace(/^www\./, ""); } catch { /* keep default */ }
          items.push({
            accountId: acc.id,
            headline: r.title,
            summary: (r.text ?? "").slice(0, 280),
            source,
            url: r.url,
            date: r.publishedDate ?? new Date().toISOString(),
            category,
            whyItMatters: why,
          });
        }
      } catch {
        errors.push(`${acc.name}: request failed`);
      }
    })
  );

  return NextResponse.json({ ok: true, items, errors });
}
