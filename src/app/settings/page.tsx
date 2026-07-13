"use client";

import { useState } from "react";
import { KeyRound, Check, Mic } from "lucide-react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { ApiKeys } from "@/lib/types";
import PageHeader from "@/components/PageHeader";

const keyDefs: { id: keyof ApiKeys; label: string; purpose: string; placeholder: string }[] = [
  { id: "openai", label: "OpenAI API Key", purpose: "Voice transcription (Whisper), email drafting, and onboarding answer understanding.", placeholder: "sk-..." },
  { id: "x", label: "X (Twitter) API Key", purpose: "Exec social activity monitoring for News of the Day.", placeholder: "..." },
  { id: "exa", label: "Exa.ai API Key", purpose: "Deep account news research and LinkedIn people discovery for org charts.", placeholder: "..." },
  { id: "apollo", label: "Apollo.io API Key", purpose: "Contact enrichment: verified work emails for multi-threading and PG.", placeholder: "..." },
];

function mask(v: string) {
  return v.length <= 8 ? "••••••••" : `${v.slice(0, 4)}••••••••${v.slice(-4)}`;
}

export default function Settings() {
  const { apiKeys, onboarding, update, hydrated } = useStore();
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  if (!hydrated) return null;

  const save = (id: keyof ApiKeys) => {
    const v = drafts[id]?.trim();
    if (!v) return;
    update({ apiKeys: { ...apiKeys, [id]: v } });
    setDrafts({ ...drafts, [id]: "" });
  };

  return (
    <div className="px-8 py-8 max-w-3xl">
      <PageHeader
        title="Settings & API Keys"
        subtitle="Connect research and drafting providers. Keys are stored locally in your browser for now."
      />

      <div className="space-y-4">
        {keyDefs.map((k) => {
          const saved = apiKeys[k.id];
          return (
            <div key={k.id} className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-2">
                <KeyRound size={15} className="text-gray-500" />
                <h2 className="font-black text-gray-900 text-sm">{k.label}</h2>
                {saved && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full ml-auto">
                    <Check size={10} /> Connected · {mask(saved)}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1 mb-3">{k.purpose}</p>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={drafts[k.id] ?? ""}
                  onChange={(e) => setDrafts({ ...drafts, [k.id]: e.target.value })}
                  placeholder={saved ? "Replace key…" : k.placeholder}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
                />
                <button
                  onClick={() => save(k.id)}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-gray-900 text-white hover:bg-gray-700"
                >
                  Save
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center gap-2">
          <Mic size={15} className="text-gray-500" />
          <h2 className="font-black text-gray-900 text-sm">Onboarding profile</h2>
          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ml-auto ${
            onboarding.completed ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
          }`}>
            {onboarding.completed ? "Complete" : `${onboarding.answers.length}/8 answered`}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Your eight voice answers power everything: targeting, research focus, and email voice.
        </p>
        <Link href="/onboarding" className="inline-block mt-3 px-4 py-2 rounded-lg text-xs font-bold border border-gray-300 text-gray-600 hover:border-gray-500">
          {onboarding.completed ? "Review answers" : "Continue onboarding"}
        </Link>
      </div>
    </div>
  );
}
