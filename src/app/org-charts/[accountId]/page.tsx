"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft, ExternalLink, Plus, Trash2, ArrowUpDown, Briefcase, X,
} from "lucide-react";
import LinkedInIcon from "@/components/LinkedInIcon";
import { useStore, uid } from "@/lib/store";
import { OrgPerson } from "@/lib/types";
import PageHeader from "@/components/PageHeader";

const layerStyles: Record<number, { name: string; box: string; nameCls: string }> = {
  1: { name: "CEO", box: "bg-emerald-50 border-emerald-500", nameCls: "text-emerald-900" },
  2: { name: "CTO / CTIO", box: "bg-gray-900 border-gray-900", nameCls: "text-white" },
  3: { name: "EVP / SVP", box: "bg-indigo-50 border-indigo-400", nameCls: "text-indigo-950" },
  4: { name: "VP", box: "bg-white border-gray-300", nameCls: "text-gray-900" },
  5: { name: "Director / VP", box: "bg-orange-50 border-orange-400", nameCls: "text-orange-950" },
  6: { name: "AVP / Sr Manager", box: "bg-violet-50 border-violet-400", nameCls: "text-violet-950" },
};

const emptyForm = { name: "", title: "", layer: 4 as OrgPerson["layer"], reportsTo: "", linkedinUrl: "", focusArea: "" };

export default function OrgChartDetail() {
  const params = useParams<{ accountId: string }>();
  const { accounts, orgPeople, projects, update, hydrated } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [movingId, setMovingId] = useState<string | null>(null);

  const account = accounts.find((a) => a.id === params.accountId);
  const people = useMemo(
    () => orgPeople.filter((p) => p.accountId === params.accountId),
    [orgPeople, params.accountId]
  );
  const accountProjects = projects.filter((p) => p.accountId === params.accountId);
  const connections = people.filter((p) => p.projectConnection);

  if (!hydrated) return null;
  if (!account) {
    return (
      <div className="px-8 py-8">
        <Link href="/org-charts" className="text-sm text-gray-500 hover:text-gray-900">← Back to Org Charts</Link>
        <div className="mt-8 text-gray-400">Account not found.</div>
      </div>
    );
  }

  const managerName = (id: string | null) =>
    id ? people.find((p) => p.id === id)?.name ?? "—" : "—";

  const addPerson = () => {
    if (!form.name.trim() || !form.title.trim()) return;
    const person: OrgPerson = {
      id: uid("p"),
      accountId: account.id,
      name: form.name.trim(),
      title: form.title.trim(),
      layer: form.layer,
      reportsTo: form.reportsTo || null,
      linkedinUrl: form.linkedinUrl.trim() || undefined,
      focusArea: form.focusArea.trim() || undefined,
      addedManually: true,
    };
    update({ orgPeople: [...orgPeople, person] });
    setForm(emptyForm);
    setShowAdd(false);
  };

  const removePerson = (id: string) => {
    update({
      orgPeople: orgPeople
        .filter((p) => p.id !== id)
        .map((p) => (p.reportsTo === id ? { ...p, reportsTo: null } : p)),
    });
  };

  const movePersonUnder = (personId: string, newManagerId: string) => {
    const manager = people.find((p) => p.id === newManagerId);
    if (!manager) return;
    const newLayer = Math.min(6, manager.layer + 1) as OrgPerson["layer"];
    update({
      orgPeople: orgPeople.map((p) =>
        p.id === personId ? { ...p, reportsTo: newManagerId, layer: newLayer } : p
      ),
    });
    setMovingId(null);
  };

  return (
    <div className="px-8 py-8 max-w-6xl">
      <Link href="/org-charts" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-4">
        <ArrowLeft size={14} /> All accounts
      </Link>

      <PageHeader
        title={`${account.name} — Org Chart`}
        subtitle={`${account.industry} · ${account.employees ?? "?"} employees · ${account.hq ?? ""}. Six-layer engineering org map.`}
      >
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-gray-900 text-white hover:bg-gray-700"
        >
          <Plus size={13} /> Add person from LinkedIn
        </button>
      </PageHeader>

      {showAdd && (
        <div className="mb-6 bg-white border border-gray-300 rounded-xl p-5 animate-fade-up">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-black text-gray-900">Add a person you found</div>
            <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-700"><X size={16} /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-500" />
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Exact title" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-500" />
            <input value={form.linkedinUrl} onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })} placeholder="LinkedIn URL" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-500" />
            <input value={form.focusArea} onChange={(e) => setForm({ ...form, focusArea: e.target.value })} placeholder="Focus area (e.g. platform infra)" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-500" />
            <select value={form.layer} onChange={(e) => setForm({ ...form, layer: Number(e.target.value) as OrgPerson["layer"] })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
              {[1, 2, 3, 4, 5, 6].map((l) => (
                <option key={l} value={l}>Layer {l} — {layerStyles[l].name}</option>
              ))}
            </select>
            <select value={form.reportsTo} onChange={(e) => setForm({ ...form, reportsTo: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
              <option value="">Reports to…</option>
              {people.map((p) => (
                <option key={p.id} value={p.id}>{p.name} — {p.title}</option>
              ))}
            </select>
          </div>
          <button onClick={addPerson} className="mt-3 px-4 py-2 rounded-lg text-xs font-bold bg-gray-900 text-white hover:bg-gray-700">
            Add to org chart
          </button>
        </div>
      )}

      {movingId && (
        <div className="mb-4 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 flex items-center gap-2">
          <ArrowUpDown size={14} />
          Moving <span className="font-bold">{managerName(movingId)}</span> — click a new manager below.
          <button onClick={() => setMovingId(null)} className="ml-auto text-amber-700 hover:text-amber-900 font-bold">Cancel</button>
        </div>
      )}

      <div className="space-y-6">
        {[1, 2, 3, 4, 5, 6].map((layer) => {
          const layerPeople = people.filter((p) => p.layer === layer);
          if (layerPeople.length === 0) return null;
          const style = layerStyles[layer];
          return (
            <section key={layer}>
              <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                Layer {layer} · {style.name}
              </div>
              <div className="flex flex-wrap gap-3">
                {layerPeople.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => movingId && movingId !== p.id && movePersonUnder(movingId, p.id)}
                    className={`w-64 rounded-xl border-2 p-3.5 ${style.box} ${
                      movingId && movingId !== p.id ? "cursor-pointer ring-2 ring-amber-400 ring-offset-1" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className={`font-black text-sm leading-tight ${style.nameCls}`}>
                        {p.name}
                        {p.addedManually && (
                          <span className="ml-1.5 text-[9px] font-bold uppercase bg-sky-100 text-sky-800 px-1 py-0.5 rounded align-middle">you added</span>
                        )}
                      </div>
                      {p.linkedinUrl && (
                        <a href={p.linkedinUrl} target="_blank" rel="noreferrer" className={layer === 2 ? "text-sky-300" : "text-sky-700"}>
                          <LinkedInIcon size={13} />
                        </a>
                      )}
                    </div>
                    <div className={`text-xs mt-0.5 ${layer === 2 ? "text-gray-200" : "text-gray-600"}`}>{p.title}</div>
                    {p.focusArea && (
                      <div className={`text-[11px] mt-1 ${layer === 2 ? "text-gray-300" : "text-gray-500"}`}>{p.focusArea}{p.detail ? ` · ${p.detail}` : ""}</div>
                    )}
                    <div className={`text-[10px] mt-2 ${layer === 2 ? "text-gray-400" : "text-gray-400"}`}>
                      Reports to: {managerName(p.reportsTo)}
                    </div>
                    {p.projectConnection && (
                      <div className="mt-2 text-[11px] bg-amber-100/80 text-amber-900 rounded px-2 py-1 leading-snug">
                        <Briefcase size={10} className="inline mr-1" />
                        {p.projectConnection}
                        {p.evidenceUrl && (
                          <a href={p.evidenceUrl} target="_blank" rel="noreferrer" className="ml-1 underline inline-flex items-center gap-0.5">
                            evidence <ExternalLink size={9} />
                          </a>
                        )}
                      </div>
                    )}
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={(ev) => { ev.stopPropagation(); setMovingId(p.id); }}
                        className={`text-[10px] font-bold inline-flex items-center gap-0.5 ${layer === 2 ? "text-gray-300 hover:text-white" : "text-gray-400 hover:text-gray-700"}`}
                      >
                        <ArrowUpDown size={10} /> Move
                      </button>
                      <button
                        onClick={(ev) => { ev.stopPropagation(); removePerson(p.id); }}
                        className={`text-[10px] font-bold inline-flex items-center gap-0.5 ${layer === 2 ? "text-gray-300 hover:text-red-300" : "text-gray-400 hover:text-red-600"}`}
                      >
                        <Trash2 size={10} /> Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
        {people.length === 0 && (
          <div className="text-center py-16 text-gray-400 text-sm bg-white border border-dashed border-gray-300 rounded-xl">
            No people mapped yet. The agent will build a 6-layer starting point once research keys are connected, or add people manually.
          </div>
        )}
      </div>

      {accountProjects.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-black text-gray-900 mb-3">Key Engineering Projects</h2>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">
                  <th className="px-4 py-2.5">Project</th>
                  <th className="px-4 py-2.5">Description & Source</th>
                  <th className="px-4 py-2.5">Devin Value Attach</th>
                </tr>
              </thead>
              <tbody>
                {accountProjects.map((p) => (
                  <tr key={p.id} className="border-t border-gray-100 align-top">
                    <td className="px-4 py-3 font-bold text-gray-900">{p.name}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {p.description}{" "}
                      <a href={p.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 text-gray-500 underline">
                        source <ExternalLink size={10} />
                      </a>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{p.devinValueAttach}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {connections.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-black text-gray-900 mb-1">Project–Person Connections</h2>
          <p className="text-xs text-gray-500 mb-3">The money section: leaders publicly tied to projects, with evidence links for hyper-personalized outreach.</p>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">
                  <th className="px-4 py-2.5">Person</th>
                  <th className="px-4 py-2.5">Project Connection</th>
                  <th className="px-4 py-2.5">Public Evidence</th>
                </tr>
              </thead>
              <tbody>
                {connections.map((p) => (
                  <tr key={p.id} className="border-t border-gray-100 align-top">
                    <td className="px-4 py-3">
                      <span className="font-bold text-gray-900">{p.name}</span>
                      <div className="text-xs text-gray-500">{p.title}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{p.projectConnection}</td>
                    <td className="px-4 py-3">
                      {p.evidenceUrl ? (
                        <a href={p.evidenceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sky-800 underline text-xs font-semibold">
                          View evidence <ExternalLink size={11} />
                        </a>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
