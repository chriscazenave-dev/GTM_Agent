"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Check, X, Pencil, ExternalLink, ShieldCheck, ShieldAlert, Sparkles, RotateCcw,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { SuggestedEmail } from "@/lib/types";
import PageHeader from "@/components/PageHeader";

export default function SuggestedPG() {
  const { emails, accounts, writingLearnings, update, hydrated } = useStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftBody, setDraftBody] = useState("");
  const [draftFeedback, setDraftFeedback] = useState("");

  const accountName = (id: string) => accounts.find((a) => a.id === id)?.name ?? "Unknown";

  const suggested = useMemo(() => emails.filter((e) => e.status === "suggested"), [emails]);
  const decided = useMemo(() => emails.filter((e) => e.status !== "suggested"), [emails]);

  const setStatus = (id: string, status: SuggestedEmail["status"], extras?: Partial<SuggestedEmail>) => {
    update({ emails: emails.map((e) => (e.id === id ? { ...e, status, ...extras } : e)) });
  };

  const saveEdit = (email: SuggestedEmail) => {
    const learnings = [...writingLearnings];
    if (draftFeedback.trim()) {
      learnings.push(`${new Date().toLocaleDateString()}: ${draftFeedback.trim()}`);
    }
    update({
      emails: emails.map((e) =>
        e.id === email.id ? { ...e, body: draftBody, editedBody: draftBody, status: "edited" as const, feedback: draftFeedback.trim() || e.feedback } : e
      ),
      writingLearnings: learnings,
    });
    setEditingId(null);
    setDraftFeedback("");
  };

  const restoreAll = () => {
    update({ emails: emails.map((e) => ({ ...e, status: "suggested" as const })) });
  };

  if (!hydrated) return null;

  return (
    <div className="px-8 py-8 max-w-5xl">
      <PageHeader
        title="Suggested PG"
        subtitle="Up to 10 pipeline generation emails a day. Approve, reject, or edit — the agent learns your voice.">
        <button
          onClick={restoreAll}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-300 bg-white text-gray-600 hover:border-gray-500"
        >
          <RotateCcw size={12} />
          Reset queue
        </button>
      </PageHeader>

      {writingLearnings.length > 0 && (
        <div className="mb-6 bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-gray-500 mb-2">
            <Sparkles size={13} className="text-amber-600" />
            What the agent has learned about your writing
          </div>
          <ul className="space-y-1">
            {writingLearnings.slice(-5).map((l, i) => (
              <li key={i} className="text-xs text-gray-600">• {l}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="text-xs font-black uppercase tracking-wide text-gray-500 mb-3">
        Today&apos;s queue · {suggested.length} remaining
      </div>

      <div className="space-y-4">
        {suggested.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm bg-white border border-dashed border-gray-300 rounded-xl">
            Queue cleared. New suggestions arrive tomorrow morning.
          </div>
        )}
        {suggested.map((e) => (
          <article key={e.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden animate-fade-up">
            <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2 flex-wrap">
              <Link
                href={`/org-charts/${e.accountId}`}
                className="text-xs font-black uppercase tracking-wide text-gray-900 bg-gray-100 px-2 py-0.5 rounded hover:bg-gray-200"
              >
                {accountName(e.accountId)}
              </Link>
              <span className="text-sm font-bold text-gray-900">{e.personName}</span>
              <span className="text-xs text-gray-500">{e.personTitle}</span>
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto ${
                e.emailVerified ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
              }`}>
                {e.emailVerified ? <ShieldCheck size={11} /> : <ShieldAlert size={11} />}
                {e.toEmail} {e.emailVerified ? "" : "(pattern-derived, verify first)"}
              </span>
            </div>

            <div className="px-5 py-2.5 bg-amber-50 border-b border-amber-100 flex items-start gap-2">
              <Sparkles size={13} className="text-amber-600 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-900">
                <span className="font-bold">Why now: </span>{e.whyNowSignal}
                {e.signalUrl && (
                  <a href={e.signalUrl} target="_blank" rel="noreferrer" className="ml-2 inline-flex items-center gap-0.5 underline">
                    source <ExternalLink size={10} />
                  </a>
                )}
              </p>
            </div>

            {e.feedback && (
              <div className="px-5 py-2 bg-sky-50 border-b border-sky-100 text-xs text-sky-900">
                <span className="font-bold">Agent note: </span>{e.feedback}
              </div>
            )}

            <div className="px-5 py-4">
              <div className="text-xs text-gray-400 font-semibold mb-1">Subject: <span className="text-gray-700">{e.subject}</span></div>
              {editingId === e.id ? (
                <div className="space-y-3">
                  <textarea
                    value={draftBody}
                    onChange={(ev) => setDraftBody(ev.target.value)}
                    rows={12}
                    className="w-full text-sm text-gray-800 border border-gray-300 rounded-lg p-3 font-mono leading-relaxed focus:outline-none focus:border-gray-500"
                  />
                  <input
                    value={draftFeedback}
                    onChange={(ev) => setDraftFeedback(ev.target.value)}
                    placeholder="What did you change and why? (teaches the agent your voice)"
                    className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-gray-500"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(e)}
                      className="px-4 py-1.5 rounded-lg text-xs font-bold bg-gray-900 text-white hover:bg-gray-700"
                    >
                      Save edit
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-4 py-1.5 rounded-lg text-xs font-bold border border-gray-300 text-gray-600 hover:border-gray-500"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">{e.body}</pre>
              )}
            </div>

            {editingId !== e.id && (
              <div className="px-5 py-3 border-t border-gray-100 flex items-center gap-2">
                <button
                  onClick={() => setStatus(e.id, "approved")}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  <Check size={13} /> Approve & queue send
                </button>
                <button
                  onClick={() => setStatus(e.id, "rejected")}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-white border border-gray-300 text-gray-600 hover:border-red-400 hover:text-red-600"
                >
                  <X size={13} /> Reject
                </button>
                <button
                  onClick={() => { setEditingId(e.id); setDraftBody(e.body); }}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-white border border-gray-300 text-gray-600 hover:border-gray-500"
                >
                  <Pencil size={13} /> Edit with agent
                </button>
              </div>
            )}
          </article>
        ))}
      </div>

      {decided.length > 0 && (
        <div className="mt-10">
          <div className="text-xs font-black uppercase tracking-wide text-gray-500 mb-3">Decided today</div>
          <div className="space-y-2">
            {decided.map((e) => (
              <div key={e.id} className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 flex items-center gap-3 text-sm">
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                  e.status === "approved" ? "bg-emerald-100 text-emerald-800"
                  : e.status === "edited" ? "bg-sky-100 text-sky-800"
                  : "bg-red-100 text-red-700"
                }`}>
                  {e.status}
                </span>
                <span className="font-bold text-gray-900">{e.personName}</span>
                <span className="text-gray-500 text-xs">{accountName(e.accountId)} · {e.subject}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
