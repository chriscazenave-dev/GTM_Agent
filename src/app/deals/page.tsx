"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronDown, ChevronRight, Plus, Trash2, AlertTriangle, CalendarClock,
  CheckCircle2, Circle, Network, History,
} from "lucide-react";
import { useStore, uid } from "@/lib/store";
import {
  Opportunity, OrgPerson, ForecastCategory, MeddpiccKey, MapMilestone, NextStep,
} from "@/lib/types";
import PageHeader from "@/components/PageHeader";

const STAGES = [
  "Discovery", "Pilot Scoping", "Technical Validation", "Evaluation",
  "Vendor of Choice", "Negotiation", "Closed Won", "Closed Lost",
];

const FORECAST: { id: ForecastCategory; label: string; cls: string }[] = [
  { id: "commit", label: "Commit", cls: "bg-emerald-100 text-emerald-800" },
  { id: "best-case", label: "Best Case", cls: "bg-sky-100 text-sky-800" },
  { id: "pipeline", label: "Pipeline", cls: "bg-gray-100 text-gray-600" },
];

const MEDDPICC: { key: MeddpiccKey; label: string }[] = [
  { key: "metrics", label: "Metrics" },
  { key: "economicBuyer", label: "Economic Buyer" },
  { key: "decisionCriteria", label: "Decision Criteria" },
  { key: "decisionProcess", label: "Decision Process" },
  { key: "paperProcess", label: "Paper Process" },
  { key: "identifiedPain", label: "Identified Pain" },
  { key: "champion", label: "Champion" },
  { key: "competition", label: "Competition" },
];

function parseAmount(a: string): number {
  const m = a.replace(/[$,\s]/g, "").match(/^([\d.]+)([kKmM]?)$/);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  return m[2].toLowerCase() === "m" ? n * 1_000_000 : m[2].toLowerCase() === "k" ? n * 1_000 : n;
}

function fmtMoney(n: number): string {
  return n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(2)}M` : `$${Math.round(n / 1000)}K`;
}

function daysSince(iso?: string): number | null {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

interface RiskFlag {
  id: string;
  label: string;
}

function riskFlags(opp: Opportunity, people: OrgPerson[]): RiskFlag[] {
  const flags: RiskFlag[] = [];
  const touched = people.filter((p) => p.relationship && p.relationship !== "none");
  if (touched.length < 2) flags.push({ id: "single-threaded", label: "Single-threaded" });
  if (!people.some((p) => p.role === "economic-buyer")) flags.push({ id: "no-eb", label: "No economic buyer tagged" });
  const stale = daysSince(opp.lastActivity);
  if (stale === null || stale > 14) flags.push({ id: "stalled", label: `Stalled ${stale === null ? "— no activity logged" : `${stale}d`}` });
  const champ = people.find((p) => p.role === "champion");
  if (champ) {
    const dark = daysSince(champ.lastTouched);
    if (dark === null || dark > 21) flags.push({ id: "champion-dark", label: `Champion dark ${dark === null ? "" : `${dark}d`}`.trim() });
  }
  return flags;
}

export default function Deals() {
  const { accounts, opportunities, orgPeople, update, hydrated } = useStore();
  const [openId, setOpenId] = useState<string | null>(null);
  const [stepDraft, setStepDraft] = useState("");
  const [mapDraft, setMapDraft] = useState("");

  if (!hydrated) return null;

  const patchOpp = (id: string, patch: Partial<Opportunity>) => {
    update({
      opportunities: opportunities.map((o) =>
        o.id === id ? { ...o, ...patch, lastActivity: new Date().toISOString() } : o
      ),
    });
  };

  const setStage = (opp: Opportunity, stage: string) => {
    if (stage === opp.stage) return;
    patchOpp(opp.id, {
      stage,
      stageHistory: [...(opp.stageHistory ?? []), { stage, date: new Date().toISOString() }],
    });
  };

  const totals = FORECAST.map((f) => ({
    ...f,
    total: opportunities
      .filter((o) => (o.forecastCategory ?? "pipeline") === f.id && !o.stage.startsWith("Closed"))
      .reduce((sum, o) => sum + parseAmount(o.amount), 0),
  }));

  return (
    <div className="px-8 py-8 max-w-5xl">
      <PageHeader
        title="Deals"
        subtitle="Everything about your open opportunities in one place. Click a deal to work it."
      />

      <div className="grid grid-cols-3 gap-3 mb-6">
        {totals.map((t) => (
          <div key={t.id} className="bg-white border border-gray-200 rounded-xl px-4 py-3">
            <div className={`inline-block text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${t.cls}`}>
              {t.label}
            </div>
            <div className="text-2xl font-black text-gray-900 mt-1">{fmtMoney(t.total)}</div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {opportunities.map((opp) => {
          const account = accounts.find((a) => a.id === opp.accountId);
          const people = orgPeople.filter((p) => p.accountId === opp.accountId);
          const flags = riskFlags(opp, people);
          const open = openId === opp.id;
          const fc = FORECAST.find((f) => f.id === (opp.forecastCategory ?? "pipeline"))!;
          const steps = opp.nextSteps ?? [];
          const milestones = opp.map ?? [];

          return (
            <div key={opp.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => { setOpenId(open ? null : opp.id); setStepDraft(""); setMapDraft(""); }}
                className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-50"
              >
                {open ? <ChevronDown size={15} className="text-gray-400 shrink-0" /> : <ChevronRight size={15} className="text-gray-400 shrink-0" />}
                <div className="min-w-0 flex-1">
                  <div className="font-black text-sm text-gray-900 truncate">{opp.name}</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    {opp.stage} · {opp.amount} · closes {opp.closeDate}
                  </div>
                </div>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 ${fc.cls}`}>{fc.label}</span>
                {flags.length > 0 && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full shrink-0">
                    <AlertTriangle size={10} /> {flags.length} risk{flags.length > 1 ? "s" : ""}
                  </span>
                )}
              </button>

              {open && (
                <div className="border-t border-gray-100 px-5 py-5 space-y-5">
                  {flags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {flags.map((f) => (
                        <span key={f.id} className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg">
                          <AlertTriangle size={11} /> {f.label}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Stage</label>
                      <select
                        value={opp.stage}
                        onChange={(e) => setStage(opp, e.target.value)}
                        className="mt-1 w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs bg-white"
                      >
                        {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Forecast</label>
                      <select
                        value={opp.forecastCategory ?? "pipeline"}
                        onChange={(e) => patchOpp(opp.id, { forecastCategory: e.target.value as ForecastCategory })}
                        className="mt-1 w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs bg-white"
                      >
                        {FORECAST.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Close date</label>
                      <input
                        type="date"
                        value={opp.closeDate}
                        onChange={(e) => patchOpp(opp.id, { closeDate: e.target.value })}
                        className="mt-1 w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div>
                      <div className="text-xs font-black text-gray-900 mb-2">Next steps</div>
                      <div className="space-y-1.5">
                        {steps.map((s) => (
                          <div key={s.id} className="flex items-center gap-2 text-xs group">
                            <button onClick={() => patchOpp(opp.id, { nextSteps: steps.map((x) => x.id === s.id ? { ...x, done: !x.done } : x) })}>
                              {s.done ? <CheckCircle2 size={15} className="text-emerald-600" /> : <Circle size={15} className="text-gray-300" />}
                            </button>
                            <span className={s.done ? "line-through text-gray-400" : "text-gray-800"}>{s.text}</span>
                            {s.due && <span className="text-[10px] text-gray-400 inline-flex items-center gap-0.5"><CalendarClock size={10} />{s.due}</span>}
                            <button
                              onClick={() => patchOpp(opp.id, { nextSteps: steps.filter((x) => x.id !== s.id) })}
                              className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-rose-600 ml-auto"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                        {steps.length === 0 && <div className="text-[11px] text-gray-400">No next steps — a deal without a next step is a deal that&apos;s slipping.</div>}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <input
                          value={stepDraft}
                          onChange={(e) => setStepDraft(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && stepDraft.trim()) {
                              const step: NextStep = { id: uid("ns"), text: stepDraft.trim(), done: false };
                              patchOpp(opp.id, { nextSteps: [...steps, step] });
                              setStepDraft("");
                            }
                          }}
                          placeholder="Add a next step and press Enter"
                          className="flex-1 border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-gray-500"
                        />
                      </div>

                      <div className="text-xs font-black text-gray-900 mt-5 mb-2">Mutual action plan</div>
                      <div className="space-y-1.5">
                        {milestones.map((m) => (
                          <div key={m.id} className="flex items-center gap-2 text-xs group">
                            <button onClick={() => patchOpp(opp.id, { map: milestones.map((x) => x.id === m.id ? { ...x, done: !x.done } : x) })}>
                              {m.done ? <CheckCircle2 size={15} className="text-emerald-600" /> : <Circle size={15} className="text-gray-300" />}
                            </button>
                            <span className={m.done ? "line-through text-gray-400" : "text-gray-800"}>{m.title}</span>
                            <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${m.owner === "us" ? "bg-gray-900 text-white" : "bg-amber-100 text-amber-800"}`}>
                              {m.owner === "us" ? "Us" : "Them"}
                            </span>
                            {m.due && <span className="text-[10px] text-gray-400">{m.due}</span>}
                            <button
                              onClick={() => patchOpp(opp.id, { map: milestones.filter((x) => x.id !== m.id) })}
                              className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-rose-600 ml-auto"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                        {milestones.length === 0 && <div className="text-[11px] text-gray-400">No shared milestones yet.</div>}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <input
                          value={mapDraft}
                          onChange={(e) => setMapDraft(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && mapDraft.trim()) {
                              const m: MapMilestone = { id: uid("map"), title: mapDraft.trim(), owner: "us", done: false };
                              patchOpp(opp.id, { map: [...milestones, m] });
                              setMapDraft("");
                            }
                          }}
                          placeholder="Add a milestone and press Enter (toggle Us/Them after)"
                          className="flex-1 border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-gray-500"
                        />
                        <button
                          onClick={() => {
                            if (!mapDraft.trim()) return;
                            const m: MapMilestone = { id: uid("map"), title: mapDraft.trim(), owner: "customer", done: false };
                            patchOpp(opp.id, { map: [...milestones, m] });
                            setMapDraft("");
                          }}
                          className="px-3 py-1.5 rounded-lg text-[10px] font-bold border border-gray-300 text-gray-600 hover:border-gray-500 shrink-0"
                        >
                          + as Them
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-black text-gray-900 mb-2">MEDDPICC</div>
                      <div className="space-y-2">
                        {MEDDPICC.map(({ key, label }) => (
                          <div key={key}>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</label>
                            <input
                              value={opp.meddpicc?.[key] ?? ""}
                              onChange={(e) => patchOpp(opp.id, { meddpicc: { ...opp.meddpicc, [key]: e.target.value } })}
                              placeholder="—"
                              className={`mt-0.5 w-full border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-gray-500 ${
                                opp.meddpicc?.[key] ? "border-gray-300" : "border-dashed border-gray-300 bg-gray-50"
                              }`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start justify-between gap-4 pt-3 border-t border-gray-100">
                    <div className="text-[11px] text-gray-500">
                      <div className="flex items-center gap-1 font-black text-gray-700 uppercase tracking-widest text-[10px] mb-1">
                        <History size={11} /> Stage history
                      </div>
                      {(opp.stageHistory ?? []).length === 0
                        ? <span className="text-gray-400">No history logged.</span>
                        : (opp.stageHistory ?? []).map((h, i) => (
                            <span key={i}>
                              {i > 0 && <span className="text-gray-300 mx-1">→</span>}
                              {h.stage} <span className="text-gray-400">({new Date(h.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })})</span>
                            </span>
                          ))}
                    </div>
                    {account && (
                      <Link
                        href={`/org-charts/${account.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold border border-gray-300 text-gray-600 hover:border-gray-500 shrink-0"
                      >
                        <Network size={12} /> Org chart & intel
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {opportunities.length === 0 && (
          <div className="text-center py-16 text-gray-400 text-sm">
            No open opportunities. Add an account as an Active Opportunity to see it here.
            <div className="mt-3">
              <Link href="/accounts/new" className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-gray-900 text-white hover:bg-gray-700">
                <Plus size={13} /> Add account
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
