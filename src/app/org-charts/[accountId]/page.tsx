"use client";

import { useMemo, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft, ExternalLink, Plus, Trash2, Briefcase, X, StickyNote, LayoutGrid, GripVertical,
} from "lucide-react";
import LinkedInIcon from "@/components/LinkedInIcon";
import { useStore, uid } from "@/lib/store";
import { OrgPerson, PersonNote } from "@/lib/types";
import PageHeader from "@/components/PageHeader";

const CARD_W = 224;
const CARD_H = 108;
const H_GAP = 28;
const V_GAP = 72;
const HOLD_MS = 250;

const layerStyles: Record<number, { name: string; box: string; nameCls: string; dark?: boolean }> = {
  1: { name: "CEO", box: "bg-emerald-50 border-emerald-500", nameCls: "text-emerald-900" },
  2: { name: "CTO / CTIO", box: "bg-gray-900 border-gray-900", nameCls: "text-white", dark: true },
  3: { name: "EVP / SVP", box: "bg-indigo-50 border-indigo-400", nameCls: "text-indigo-950" },
  4: { name: "VP", box: "bg-white border-gray-300", nameCls: "text-gray-900" },
  5: { name: "Director / VP", box: "bg-orange-50 border-orange-400", nameCls: "text-orange-950" },
  6: { name: "AVP / Sr Manager", box: "bg-violet-50 border-violet-400", nameCls: "text-violet-950" },
};

const emptyForm = { name: "", title: "", layer: 4 as OrgPerson["layer"], reportsTo: "", linkedinUrl: "", focusArea: "" };

interface LayoutResult {
  auto: Map<string, { x: number; y: number }>;
  width: number;
  height: number;
}

function computeAutoLayout(people: OrgPerson[]): LayoutResult {
  const byId = new Map(people.map((p) => [p.id, p]));
  const children = new Map<string, OrgPerson[]>();
  const roots: OrgPerson[] = [];
  for (const p of people) {
    if (p.reportsTo && byId.has(p.reportsTo) && p.reportsTo !== p.id) {
      const arr = children.get(p.reportsTo) ?? [];
      arr.push(p);
      children.set(p.reportsTo, arr);
    } else {
      roots.push(p);
    }
  }
  const auto = new Map<string, { x: number; y: number }>();

  const widths = new Map<string, number>();
  const measure = (p: OrgPerson): number => {
    if (widths.has(p.id)) return widths.get(p.id)!;
    widths.set(p.id, CARD_W); // pre-set to break cycles
    const kids = children.get(p.id) ?? [];
    const w = kids.length === 0
      ? CARD_W
      : Math.max(CARD_W, kids.map(measure).reduce((a, b) => a + b, 0) + H_GAP * (kids.length - 1));
    widths.set(p.id, w);
    return w;
  };
  roots.forEach(measure);

  let maxDepth = 0;
  const place = (p: OrgPerson, left: number, depth: number) => {
    if (auto.has(p.id)) return;
    const w = widths.get(p.id) ?? CARD_W;
    auto.set(p.id, { x: left + w / 2 - CARD_W / 2, y: depth * (CARD_H + V_GAP) });
    maxDepth = Math.max(maxDepth, depth);
    let childLeft = left;
    for (const k of children.get(p.id) ?? []) {
      const kw = widths.get(k.id) ?? CARD_W;
      place(k, childLeft, depth + 1);
      childLeft += kw + H_GAP;
    }
  };

  let rootLeft = 0;
  for (const r of roots) {
    place(r, rootLeft, 0);
    rootLeft += (widths.get(r.id) ?? CARD_W) + H_GAP * 2;
  }

  const width = Math.max(rootLeft - H_GAP * 2, CARD_W);
  const height = (maxDepth + 1) * (CARD_H + V_GAP) - V_GAP;
  return { auto, width, height };
}

export default function OrgChartDetail() {
  const params = useParams<{ accountId: string }>();
  const { accounts, orgPeople, projects, update, hydrated } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [dragPos, setDragPos] = useState<Record<string, { x: number; y: number }>>({});

  const dragState = useRef<{
    id: string | null;
    holdTimer: ReturnType<typeof setTimeout> | null;
    dragging: boolean;
    startClient: { x: number; y: number };
    startPos: { x: number; y: number };
    lastPos: { x: number; y: number } | null;
  }>({ id: null, holdTimer: null, dragging: false, startClient: { x: 0, y: 0 }, startPos: { x: 0, y: 0 }, lastPos: null });

  const account = accounts.find((a) => a.id === params.accountId);
  const people = useMemo(
    () => orgPeople.filter((p) => p.accountId === params.accountId),
    [orgPeople, params.accountId]
  );
  const accountProjects = projects.filter((p) => p.accountId === params.accountId);
  const connections = people.filter((p) => p.projectConnection);

  const layout = useMemo(() => computeAutoLayout(people), [people]);

  const posOf = useCallback(
    (p: OrgPerson): { x: number; y: number } =>
      dragPos[p.id] ?? p.pos ?? layout.auto.get(p.id) ?? { x: 0, y: 0 },
    [dragPos, layout]
  );

  const canvasSize = useMemo(() => {
    let maxX = layout.width;
    let maxY = layout.height;
    for (const p of people) {
      const pos = posOf(p);
      maxX = Math.max(maxX, pos.x + CARD_W);
      maxY = Math.max(maxY, pos.y + CARD_H);
    }
    return { w: maxX + 24, h: maxY + 24 };
  }, [people, layout, posOf]);

  const persistPos = useCallback((id: string, pos: { x: number; y: number }) => {
    update({ orgPeople: orgPeople.map((p) => (p.id === id ? { ...p, pos } : p)) });
  }, [orgPeople, update]);

  if (!hydrated) return null;
  if (!account) {
    return (
      <div className="px-8 py-8">
        <Link href="/org-charts" className="text-sm text-gray-500 hover:text-gray-900">← Back to Org Charts</Link>
        <div className="mt-8 text-gray-400">Account not found.</div>
      </div>
    );
  }

  const selected = selectedId ? people.find((p) => p.id === selectedId) ?? null : null;

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
    if (selectedId === id) setSelectedId(null);
  };

  const patchPerson = (id: string, patch: Partial<OrgPerson>) => {
    update({ orgPeople: orgPeople.map((p) => (p.id === id ? { ...p, ...patch } : p)) });
  };

  const addNote = () => {
    if (!selected || !noteDraft.trim()) return;
    const note: PersonNote = { id: uid("note"), date: new Date().toISOString(), text: noteDraft.trim() };
    patchPerson(selected.id, { meetingNotes: [note, ...(selected.meetingNotes ?? [])] });
    setNoteDraft("");
  };

  const removeNote = (personId: string, noteId: string) => {
    const p = people.find((x) => x.id === personId);
    if (!p) return;
    patchPerson(personId, { meetingNotes: (p.meetingNotes ?? []).filter((n) => n.id !== noteId) });
  };

  const resetLayout = () => {
    update({ orgPeople: orgPeople.map((p) => (p.accountId === account.id ? { ...p, pos: undefined } : p)) });
    setDragPos({});
  };

  const onPointerDown = (e: React.PointerEvent, p: OrgPerson) => {
    if (e.button !== 0) return;
    const el = e.currentTarget as HTMLElement;
    el.setPointerCapture(e.pointerId);
    const start = posOf(p);
    dragState.current = {
      id: p.id,
      holdTimer: setTimeout(() => { dragState.current.dragging = true; }, HOLD_MS),
      dragging: false,
      startClient: { x: e.clientX, y: e.clientY },
      startPos: start,
      lastPos: null,
    };
  };

  const onPointerMove = (e: React.PointerEvent, p: OrgPerson) => {
    const s = dragState.current;
    if (s.id !== p.id) return;
    const dx = e.clientX - s.startClient.x;
    const dy = e.clientY - s.startClient.y;
    if (!s.dragging) {
      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
        // moved before hold completed — cancel (treat as scroll/mis-touch)
        if (s.holdTimer) clearTimeout(s.holdTimer);
        s.id = null;
      }
      return;
    }
    const next = { x: Math.max(0, s.startPos.x + dx), y: Math.max(0, s.startPos.y + dy) };
    s.lastPos = next;
    setDragPos((prev) => ({ ...prev, [p.id]: next }));
  };

  const onPointerUp = (e: React.PointerEvent, p: OrgPerson) => {
    const s = dragState.current;
    if (s.holdTimer) clearTimeout(s.holdTimer);
    if (s.id !== p.id) { s.id = null; return; }
    if (s.dragging && s.lastPos) {
      persistPos(p.id, s.lastPos);
      setDragPos((prev) => {
        const next = { ...prev };
        delete next[p.id];
        return next;
      });
    } else {
      setSelectedId(p.id);
      setNoteDraft("");
    }
    dragState.current = { id: null, holdTimer: null, dragging: false, startClient: { x: 0, y: 0 }, startPos: { x: 0, y: 0 }, lastPos: null };
    void e;
  };

  const edges = people
    .filter((p) => p.reportsTo && people.some((m) => m.id === p.reportsTo))
    .map((p) => {
      const from = posOf(people.find((m) => m.id === p.reportsTo)!);
      const to = posOf(p);
      const x1 = from.x + CARD_W / 2;
      const y1 = from.y + CARD_H;
      const x2 = to.x + CARD_W / 2;
      const y2 = to.y;
      const midY = y1 + Math.max(12, (y2 - y1) / 2);
      return { id: p.id, d: `M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}` };
    });

  return (
    <div className="px-8 py-8">
      <Link href="/org-charts" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-4">
        <ArrowLeft size={14} /> All accounts
      </Link>

      <PageHeader
        title={`${account.name} — Org Chart`}
        subtitle={`${account.industry} · ${account.employees ?? "?"} employees · ${account.hq ?? ""}. Press and hold a card to drag it. Click a card for details & meeting notes.`}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={resetLayout}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold border border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            <LayoutGrid size={13} /> Reset layout
          </button>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-gray-900 text-white hover:bg-gray-700"
          >
            <Plus size={13} /> Add person
          </button>
        </div>
      </PageHeader>

      {showAdd && (
        <div className="mb-6 bg-white border border-gray-300 rounded-xl p-5 animate-fade-up max-w-3xl">
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

      <div className="flex gap-6 items-start">
        <div className="flex-1 min-w-0 bg-white border border-gray-200 rounded-xl overflow-auto" style={{ maxHeight: "70vh" }}>
          {people.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm">
              No people mapped yet. Add people manually to start building the chart.
            </div>
          ) : (
            <div className="relative" style={{ width: canvasSize.w, height: canvasSize.h, minWidth: "100%" }}>
              <svg className="absolute inset-0 pointer-events-none" width={canvasSize.w} height={canvasSize.h}>
                {edges.map((e) => (
                  <path key={e.id} d={e.d} fill="none" stroke="#9ca3af" strokeWidth={1.5} />
                ))}
              </svg>
              {people.map((p) => {
                const pos = posOf(p);
                const style = layerStyles[p.layer];
                const isDragging = !!dragPos[p.id];
                const noteCount = p.meetingNotes?.length ?? 0;
                return (
                  <div
                    key={p.id}
                    onPointerDown={(e) => onPointerDown(e, p)}
                    onPointerMove={(e) => onPointerMove(e, p)}
                    onPointerUp={(e) => onPointerUp(e, p)}
                    className={`absolute rounded-xl border-2 p-3 select-none touch-none cursor-grab active:cursor-grabbing ${style.box} ${
                      isDragging ? "shadow-xl z-20 opacity-95" : "z-10"
                    } ${selectedId === p.id ? "ring-2 ring-sky-400 ring-offset-1" : ""}`}
                    style={{ left: pos.x, top: pos.y, width: CARD_W, height: CARD_H }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className={`font-black text-[13px] leading-tight truncate ${style.nameCls}`}>{p.name}</div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {noteCount > 0 && (
                          <span className={`inline-flex items-center gap-0.5 text-[9px] font-bold px-1 py-0.5 rounded ${style.dark ? "bg-white/20 text-white" : "bg-amber-100 text-amber-900"}`}>
                            <StickyNote size={9} /> {noteCount}
                          </span>
                        )}
                        <GripVertical size={12} className={style.dark ? "text-gray-400" : "text-gray-300"} />
                      </div>
                    </div>
                    <div className={`text-[11px] mt-0.5 leading-snug line-clamp-2 ${style.dark ? "text-gray-200" : "text-gray-600"}`}>{p.title}</div>
                    <div className={`text-[10px] mt-1 truncate ${style.dark ? "text-gray-400" : "text-gray-400"}`}>
                      {p.focusArea ?? `Reports to: ${managerName(p.reportsTo)}`}
                    </div>
                    {p.addedManually && (
                      <span className="absolute bottom-1.5 right-2 text-[8px] font-bold uppercase bg-sky-100 text-sky-800 px-1 py-0.5 rounded">you added</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {selected && (
          <aside className="w-80 shrink-0 bg-white border border-gray-200 rounded-xl p-5 sticky top-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-black text-gray-900 leading-tight">{selected.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">{selected.title}</div>
              </div>
              <button onClick={() => setSelectedId(null)} className="text-gray-400 hover:text-gray-700"><X size={16} /></button>
            </div>

            <div className="mt-3 space-y-1.5 text-xs text-gray-600">
              {selected.focusArea && <div><span className="font-bold text-gray-500">Focus:</span> {selected.focusArea}</div>}
              {selected.detail && <div><span className="font-bold text-gray-500">Detail:</span> {selected.detail}</div>}
              {selected.email && <div><span className="font-bold text-gray-500">Email:</span> {selected.email} {selected.emailStatus && <span className="text-gray-400">({selected.emailStatus})</span>}</div>}
              {selected.projectConnection && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5 text-amber-900 text-[11px]">
                  <Briefcase size={10} className="inline mr-1" />
                  {selected.projectConnection}
                  {selected.evidenceUrl && (
                    <a href={selected.evidenceUrl} target="_blank" rel="noreferrer" className="ml-1 underline inline-flex items-center gap-0.5">
                      evidence <ExternalLink size={9} />
                    </a>
                  )}
                </div>
              )}
              {selected.linkedinUrl && (
                <a href={selected.linkedinUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sky-700 font-semibold">
                  <LinkedInIcon size={12} /> LinkedIn profile
                </a>
              )}
            </div>

            <div className="mt-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Reports to</label>
              <select
                value={selected.reportsTo ?? ""}
                onChange={(e) => patchPerson(selected.id, { reportsTo: e.target.value || null })}
                className="mt-1 w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs bg-white"
              >
                <option value="">No one (top of chart)</option>
                {people.filter((p) => p.id !== selected.id).map((p) => (
                  <option key={p.id} value={p.id}>{p.name} — {p.title}</option>
                ))}
              </select>
            </div>

            <div className="mt-5">
              <div className="flex items-center gap-1.5 mb-2">
                <StickyNote size={13} className="text-amber-600" />
                <span className="text-xs font-black text-gray-900">Meeting notes</span>
              </div>
              <textarea
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                placeholder="What did you learn in your last meeting with them?"
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:border-gray-500"
              />
              <button
                onClick={addNote}
                disabled={!noteDraft.trim()}
                className="mt-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-900 text-white hover:bg-gray-700 disabled:opacity-40"
              >
                Save note
              </button>

              <div className="mt-3 space-y-2">
                {(selected.meetingNotes ?? []).map((n) => (
                  <div key={n.id} className="bg-amber-50/70 border border-amber-100 rounded-lg px-3 py-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-amber-700">
                        {new Date(n.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                      <button onClick={() => removeNote(selected.id, n.id)} className="text-amber-400 hover:text-red-600"><Trash2 size={11} /></button>
                    </div>
                    <p className="text-xs text-gray-700 mt-1 whitespace-pre-wrap">{n.text}</p>
                  </div>
                ))}
                {(selected.meetingNotes ?? []).length === 0 && (
                  <div className="text-[11px] text-gray-400">No notes yet. Capture takeaways after every meeting.</div>
                )}
              </div>
            </div>

            <button
              onClick={() => removePerson(selected.id)}
              className="mt-5 inline-flex items-center gap-1 text-[11px] font-bold text-gray-400 hover:text-red-600"
            >
              <Trash2 size={11} /> Remove from org chart
            </button>
          </aside>
        )}
      </div>

      {accountProjects.length > 0 && (
        <div className="mt-10 max-w-6xl">
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
        <div className="mt-10 max-w-6xl">
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
