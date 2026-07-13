"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ExternalLink, TrendingUp, Rocket, Users, UserPlus, Wrench,
  DollarSign, Handshake, Sparkles, UserMinus, RefreshCw, BellRing,
} from "lucide-react";
import LinkedInIcon from "@/components/LinkedInIcon";
import { useStore, uid } from "@/lib/store";
import { NewsCategory, NewsItem } from "@/lib/types";
import PageHeader from "@/components/PageHeader";

const windows = [
  { label: "Past week", days: 7 },
  { label: "Past 30 days", days: 30 },
  { label: "Past 60 days", days: 60 },
] as const;

const categoryMeta: Record<NewsCategory, { label: string; icon: React.ComponentType<{ size?: number }>; classes: string }> = {
  funding: { label: "Funding", icon: DollarSign, classes: "bg-emerald-100 text-emerald-800" },
  product: { label: "Product", icon: Rocket, classes: "bg-blue-100 text-blue-800" },
  hiring: { label: "Hiring", icon: UserPlus, classes: "bg-violet-100 text-violet-800" },
  "exec-move": { label: "Exec Move", icon: Users, classes: "bg-amber-100 text-amber-800" },
  engineering: { label: "Engineering", icon: Wrench, classes: "bg-slate-200 text-slate-800" },
  "linkedin-post": { label: "Exec LinkedIn Post", icon: LinkedInIcon, classes: "bg-sky-100 text-sky-800" },
  earnings: { label: "Earnings", icon: TrendingUp, classes: "bg-emerald-100 text-emerald-800" },
  layoffs: { label: "Layoffs", icon: UserMinus, classes: "bg-rose-100 text-rose-800" },
  partnership: { label: "Partnership", icon: Handshake, classes: "bg-orange-100 text-orange-800" },
};

const signalCategories: NewsCategory[] = ["exec-move", "funding", "layoffs", "engineering"];

export default function NewsOfTheDay() {
  const { news, accounts, apiKeys, update, hydrated } = useStore();
  const [windowDays, setWindowDays] = useState<number>(30);
  const [accountFilter, setAccountFilter] = useState<string>("all");
  const [execOnly, setExecOnly] = useState(false);
  const [now] = useState(() => Date.now());
  const [refreshing, setRefreshing] = useState(false);
  const [refreshMsg, setRefreshMsg] = useState("");

  const refreshResearch = async () => {
    setRefreshing(true);
    setRefreshMsg("");
    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          exaKey: apiKeys.exa,
          accounts: accounts.map((a) => ({ id: a.id, name: a.name, domain: a.domain })),
        }),
      });
      const data: { ok: boolean; message?: string; items?: Omit<NewsItem, "id">[] } = await res.json();
      if (!data.ok) {
        setRefreshMsg(data.message ?? "Research unavailable.");
      } else {
        const existing = new Set(news.map((n) => n.url));
        const fresh: NewsItem[] = (data.items ?? [])
          .filter((i) => !existing.has(i.url))
          .map((i) => ({ ...i, id: uid("news") }));
        update({ news: [...fresh, ...news] });
        setRefreshMsg(fresh.length > 0 ? `Added ${fresh.length} new item${fresh.length > 1 ? "s" : ""} from live research.` : "No new items found — you're up to date.");
      }
    } catch {
      setRefreshMsg("Research request failed. Check your connection and Exa key.");
    }
    setRefreshing(false);
  };

  const filtered = useMemo(() => {
    const cutoff = now - windowDays * 24 * 60 * 60 * 1000;
    return news
      .filter((n) => new Date(n.date).getTime() >= cutoff)
      .filter((n) => accountFilter === "all" || n.accountId === accountFilter)
      .filter((n) => !execOnly || n.category === "linkedin-post" || n.category === "exec-move")
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [news, windowDays, accountFilter, execOnly, now]);

  const accountName = (id: string) => accounts.find((a) => a.id === id)?.name ?? "Unknown";

  const signals = useMemo(() => {
    const cutoff = now - 7 * 24 * 60 * 60 * 1000;
    return news.filter((n) => signalCategories.includes(n.category) && new Date(n.date).getTime() >= cutoff);
  }, [news, now]);

  if (!hydrated) return null;

  return (
    <div className="px-8 py-8 max-w-5xl">
      <PageHeader
        title="News of the Day"
        subtitle={`Deep research across your ${accounts.length} accounts. No ocean boiling, just signal.`}
      >
        <button
          onClick={refreshResearch}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-gray-900 text-white hover:bg-gray-700 disabled:opacity-50"
        >
          <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} /> {refreshing ? "Researching…" : "Refresh research"}
        </button>
      </PageHeader>

      {refreshMsg && (
        <div className="mb-4 text-xs text-gray-600 bg-gray-100 border border-gray-200 rounded-lg px-3 py-2">{refreshMsg}</div>
      )}

      {signals.length > 0 && (
        <div className="mb-4 flex items-start gap-2 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
          <BellRing size={14} className="text-rose-600 mt-0.5 shrink-0" />
          <div className="text-xs text-rose-900">
            <span className="font-black">{signals.length} signal{signals.length > 1 ? "s" : ""} this week: </span>
            {signals.slice(0, 3).map((s, i) => (
              <span key={s.id}>{i > 0 && " · "}{accountName(s.accountId)} — {categoryMeta[s.category].label.toLowerCase()}</span>
            ))}
            {signals.length > 3 && ` · +${signals.length - 3} more below`}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 mb-6">
        {windows.map((w) => (
          <button
            key={w.days}
            onClick={() => setWindowDays(w.days)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors ${
              windowDays === w.days
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-600 border-gray-300 hover:border-gray-500"
            }`}
          >
            {w.label}
          </button>
        ))}
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <select
          value={accountFilter}
          onChange={(e) => setAccountFilter(e.target.value)}
          className="px-3 py-1.5 rounded-full text-xs font-bold border border-gray-300 bg-white text-gray-600"
        >
          <option value="all">All accounts</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
        <button
          onClick={() => setExecOnly(!execOnly)}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors ${
            execOnly
              ? "bg-amber-600 text-white border-amber-600"
              : "bg-white text-gray-600 border-gray-300 hover:border-amber-500 hover:text-amber-700"
          }`}
        >
          Exec activity only
        </button>
      </div>

      <div className="space-y-4">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400 text-sm">
            No news in this window. Widen the timeframe or add accounts in Upload Data.
          </div>
        )}
        {filtered.map((n) => {
          const meta = categoryMeta[n.category];
          const Icon = meta.icon;
          return (
            <article
              key={n.id}
              className="bg-white border border-gray-200 rounded-xl p-5 animate-fade-up hover:border-gray-400 transition-colors"
            >
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Link
                  href={`/org-charts/${n.accountId}`}
                  className="text-xs font-black uppercase tracking-wide text-gray-900 bg-gray-100 px-2 py-0.5 rounded hover:bg-gray-200"
                >
                  {accountName(n.accountId)}
                </Link>
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.classes}`}>
                  <Icon size={11} />
                  {meta.label}
                </span>
                <span className="text-xs text-gray-400 ml-auto">
                  {new Date(n.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </span>
              </div>
              <h2 className="text-base font-bold text-gray-900 leading-snug">{n.headline}</h2>
              {n.execName && (
                <div className="text-xs text-sky-800 font-semibold mt-1">
                  {n.execName} · {n.execTitle}
                </div>
              )}
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">{n.summary}</p>
              <div className="mt-3 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                <Sparkles size={14} className="text-amber-600 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-900 leading-relaxed">
                  <span className="font-bold">Why it matters: </span>
                  {n.whyItMatters}
                </p>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <a
                  href={n.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-900"
                >
                  <ExternalLink size={12} />
                  {n.source}
                </a>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
