"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2, Plus, Trash2, Network } from "lucide-react";
import { useStore, uid } from "@/lib/store";
import { Account, AccountType, OrgPerson } from "@/lib/types";
import PageHeader from "@/components/PageHeader";

interface PersonRow {
  name: string;
  title: string;
  layer: OrgPerson["layer"];
  reportsToIndex: number | null; // index into rows
  linkedinUrl: string;
  focusArea: string;
}

const emptyRow = (layer: OrgPerson["layer"], reportsToIndex: number | null): PersonRow => ({
  name: "", title: "", layer, reportsToIndex, linkedinUrl: "", focusArea: "",
});

const scaffoldTemplate: Array<{ title: string; layer: OrgPerson["layer"]; reportsToIndex: number | null }> = [
  { title: "CEO", layer: 1, reportsToIndex: null },
  { title: "CTO", layer: 2, reportsToIndex: 0 },
  { title: "SVP Engineering", layer: 3, reportsToIndex: 1 },
  { title: "VP Platform Engineering", layer: 4, reportsToIndex: 2 },
  { title: "VP Product Engineering", layer: 4, reportsToIndex: 2 },
  { title: "Director, Developer Productivity", layer: 5, reportsToIndex: 3 },
  { title: "Senior Manager, Platform Services", layer: 6, reportsToIndex: 5 },
];

export default function NewAccountPage() {
  const router = useRouter();
  const { accounts, orgPeople, update, hydrated } = useStore();

  const [form, setForm] = useState({
    name: "", domain: "", industry: "", vertical: "", type: "pg" as AccountType,
    employees: "", hq: "", stage: "", amount: "", closeDate: "", notes: "",
  });
  const [people, setPeople] = useState<PersonRow[]>([emptyRow(1, null)]);
  const [useScaffold, setUseScaffold] = useState(true);
  const [error, setError] = useState("");

  if (!hydrated) return null;

  const setRow = (i: number, patch: Partial<PersonRow>) => {
    setPeople((rows) => rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  };

  const addRow = () => setPeople((rows) => [...rows, emptyRow(4, rows.length > 0 ? 0 : null)]);

  const removeRow = (i: number) =>
    setPeople((rows) =>
      rows
        .filter((_, idx) => idx !== i)
        .map((r) => ({
          ...r,
          reportsToIndex:
            r.reportsToIndex === null || r.reportsToIndex === i
              ? null
              : r.reportsToIndex > i
                ? r.reportsToIndex - 1
                : r.reportsToIndex,
        }))
    );

  const applyScaffold = () => {
    setPeople(scaffoldTemplate.map((t) => ({ ...emptyRow(t.layer, t.reportsToIndex), title: t.title })));
  };

  const createAccount = () => {
    if (!form.name.trim()) { setError("Account name is required."); return; }
    if (accounts.some((a) => a.name.toLowerCase() === form.name.trim().toLowerCase())) {
      setError("An account with that name already exists.");
      return;
    }
    const accountId = uid("acc");
    const account: Account = {
      id: accountId,
      name: form.name.trim(),
      domain: form.domain.trim() || `${form.name.trim().toLowerCase().replace(/\s+/g, "")}.com`,
      industry: form.industry.trim() || "—",
      vertical: form.vertical.trim() || "—",
      type: form.type,
      employees: form.employees.trim() || undefined,
      hq: form.hq.trim() || undefined,
      stage: form.type === "opportunity" ? form.stage.trim() || "Discovery" : undefined,
      amount: form.type === "opportunity" ? form.amount.trim() || undefined : undefined,
      closeDate: form.type === "opportunity" ? form.closeDate || undefined : undefined,
      notes: form.notes.trim() || undefined,
    };

    const rows = useScaffold ? people.filter((r) => r.name.trim() || r.title.trim()) : [];
    const ids = rows.map(() => uid("p"));
    const newPeople: OrgPerson[] = rows.map((r, i) => ({
      id: ids[i],
      accountId,
      name: r.name.trim() || `TBD — ${r.title.trim() || "Unknown role"}`,
      title: r.title.trim() || "Unknown title",
      layer: r.layer,
      reportsTo:
        r.reportsToIndex !== null && rows[r.reportsToIndex] !== undefined && r.reportsToIndex !== i
          ? ids[r.reportsToIndex]
          : null,
      linkedinUrl: r.linkedinUrl.trim() || undefined,
      focusArea: r.focusArea.trim() || undefined,
      addedManually: true,
    }));

    update({ accounts: [...accounts, account], orgPeople: [...orgPeople, ...newPeople] });
    router.push(`/org-charts/${accountId}`);
  };

  const rowLabel = (r: PersonRow, i: number) => `${i + 1}. ${r.name.trim() || r.title.trim() || "Unnamed"}`;

  return (
    <div className="px-8 py-8 max-w-4xl">
      <Link href="/org-charts" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-4">
        <ArrowLeft size={14} /> Back to Org Charts
      </Link>

      <PageHeader
        title="Add Account Manually"
        subtitle="Onboard an account outside of data research: enter the basics, sketch the org chart, and start working it."
      />

      <section className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Building2 size={16} className="text-gray-700" />
          <h2 className="text-sm font-black text-gray-900">Account details</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Account name *" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-500" />
          <input value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} placeholder="Domain (acme.com)" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-500" />
          <input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} placeholder="Industry" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-500" />
          <input value={form.vertical} onChange={(e) => setForm({ ...form, vertical: e.target.value })} placeholder="Vertical" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-500" />
          <input value={form.employees} onChange={(e) => setForm({ ...form, employees: e.target.value })} placeholder="Employees (e.g. 1,200)" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-500" />
          <input value={form.hq} onChange={(e) => setForm({ ...form, hq: e.target.value })} placeholder="HQ (City, ST)" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-500" />
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as AccountType })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
            <option value="pg">PG Target</option>
            <option value="opportunity">Active Opportunity</option>
          </select>
          {form.type === "opportunity" && (
            <>
              <input value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })} placeholder="Stage (e.g. Evaluation)" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-500" />
              <input value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="Amount (e.g. $250K)" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-500" />
              <input type="date" value={form.closeDate} onChange={(e) => setForm({ ...form, closeDate: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-600" />
            </>
          )}
        </div>
        <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Account notes (why this account, context, tribal knowledge…)" rows={2} className="mt-3 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-500" />
      </section>

      <section className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Network size={16} className="text-gray-700" />
            <h2 className="text-sm font-black text-gray-900">Starting org chart</h2>
          </div>
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-600">
            <input type="checkbox" checked={useScaffold} onChange={(e) => setUseScaffold(e.target.checked)} />
            Include org chart
          </label>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          Add the people you already know, or start from a standard engineering-org scaffold and fill in names as you learn them.
        </p>

        {useScaffold && (
          <>
            <button onClick={applyScaffold} className="mb-4 px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-300 text-gray-700 hover:bg-gray-100">
              Use 6-layer scaffold template
            </button>

            <div className="space-y-3">
              {people.map((r, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center border border-gray-100 rounded-lg p-2 bg-gray-50/50">
                  <input value={r.name} onChange={(e) => setRow(i, { name: e.target.value })} placeholder="Name (or leave blank = TBD)" className="sm:col-span-3 border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-gray-500" />
                  <input value={r.title} onChange={(e) => setRow(i, { title: e.target.value })} placeholder="Title" className="sm:col-span-3 border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-gray-500" />
                  <select value={r.layer} onChange={(e) => setRow(i, { layer: Number(e.target.value) as OrgPerson["layer"] })} className="sm:col-span-2 border border-gray-300 rounded-lg px-2 py-1.5 text-xs bg-white">
                    {[1, 2, 3, 4, 5, 6].map((l) => <option key={l} value={l}>Layer {l}</option>)}
                  </select>
                  <select
                    value={r.reportsToIndex === null ? "" : String(r.reportsToIndex)}
                    onChange={(e) => setRow(i, { reportsToIndex: e.target.value === "" ? null : Number(e.target.value) })}
                    className="sm:col-span-3 border border-gray-300 rounded-lg px-2 py-1.5 text-xs bg-white"
                  >
                    <option value="">Reports to no one (top)</option>
                    {people.map((other, j) => j !== i && <option key={j} value={j}>{rowLabel(other, j)}</option>)}
                  </select>
                  <button onClick={() => removeRow(i)} className="sm:col-span-1 text-gray-400 hover:text-red-600 flex justify-center">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            <button onClick={addRow} className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-300 text-gray-700 hover:bg-gray-100">
              <Plus size={12} /> Add another person
            </button>
          </>
        )}
      </section>

      {error && <div className="mb-4 px-4 py-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

      <button onClick={createAccount} className="px-5 py-2.5 rounded-lg text-sm font-bold bg-gray-900 text-white hover:bg-gray-700">
        Create account & open org chart
      </button>
    </div>
  );
}
