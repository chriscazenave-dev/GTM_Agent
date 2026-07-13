"use client";

import { useRef, useState } from "react";
import Papa from "papaparse";
import { Upload, FileSpreadsheet, Trash2, AlertTriangle, Download } from "lucide-react";
import { useStore, uid } from "@/lib/store";
import { Account, Opportunity } from "@/lib/types";
import PageHeader from "@/components/PageHeader";

const MAX_ACCOUNTS = 50;

const accountTemplate = `name,domain,industry,vertical,type,employees,hq,stage,amount,closeDate
Acme Corp,acme.com,Manufacturing Software,Software,opportunity,2000,"Austin, TX",Evaluation,$300K,2026-12-31
Globex,globex.com,Fintech,Financial Services,pg,800,"New York, NY",,,`;

const oppTemplate = `accountName,name,stage,amount,closeDate,nextStep
Acme Corp,Acme — Devin Enterprise,Evaluation,$300K,2026-12-31,Security review`;

function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

export default function UploadData() {
  const { accounts, opportunities, update, reset, hydrated } = useStore();
  const accountInput = useRef<HTMLInputElement>(null);
  const oppInput = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const parseAccounts = (file: File) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const rows = res.data.filter((r) => r.name?.trim());
        const newAccounts: Account[] = rows.map((r) => ({
          id: uid("acc"),
          name: r.name.trim(),
          domain: r.domain?.trim() ?? "",
          industry: r.industry?.trim() ?? "",
          vertical: r.vertical?.trim() ?? "",
          type: r.type?.trim().toLowerCase() === "opportunity" ? "opportunity" : "pg",
          employees: r.employees?.trim() || undefined,
          hq: r.hq?.trim() || undefined,
          stage: r.stage?.trim() || undefined,
          amount: r.amount?.trim() || undefined,
          closeDate: r.closeDate?.trim() || undefined,
        }));
        const dedup = newAccounts.filter(
          (n) => !accounts.some((a) => a.name.toLowerCase() === n.name.toLowerCase())
        );
        const combined = [...accounts, ...dedup];
        if (combined.length > MAX_ACCOUNTS) {
          setMessage({
            kind: "err",
            text: `That upload would put you at ${combined.length} accounts. This agent goes deep, not wide — cap is ${MAX_ACCOUNTS}. Trim the list and re-upload.`,
          });
          return;
        }
        update({ accounts: combined });
        setMessage({
          kind: "ok",
          text: `Added ${dedup.length} accounts (${newAccounts.length - dedup.length} duplicates skipped). Deep research will start on the next refresh.`,
        });
      },
      error: () => setMessage({ kind: "err", text: "Could not parse that CSV. Check the template format." }),
    });
  };

  const parseOpps = (file: File) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const rows = res.data.filter((r) => r.name?.trim());
        const newOpps: Opportunity[] = [];
        const missing: string[] = [];
        for (const r of rows) {
          const acc = accounts.find((a) => a.name.toLowerCase() === r.accountName?.trim().toLowerCase());
          if (!acc) {
            missing.push(r.accountName ?? "(blank)");
            continue;
          }
          newOpps.push({
            id: uid("opp"),
            accountId: acc.id,
            name: r.name.trim(),
            stage: r.stage?.trim() ?? "",
            amount: r.amount?.trim() ?? "",
            closeDate: r.closeDate?.trim() ?? "",
            nextStep: r.nextStep?.trim() || undefined,
          });
        }
        update({
          opportunities: [...opportunities, ...newOpps],
          accounts: accounts.map((a) =>
            newOpps.some((o) => o.accountId === a.id) ? { ...a, type: "opportunity" as const } : a
          ),
        });
        setMessage({
          kind: missing.length ? "err" : "ok",
          text: `Added ${newOpps.length} opportunities.${missing.length ? ` Skipped ${missing.length} rows with unknown accounts: ${missing.join(", ")}. Upload those accounts first.` : ""}`,
        });
      },
      error: () => setMessage({ kind: "err", text: "Could not parse that CSV. Check the template format." }),
    });
  };

  if (!hydrated) return null;

  return (
    <div className="px-8 py-8 max-w-5xl">
      <PageHeader
        title="Upload Data"
        subtitle={`Bring in your accounts and opportunities via CSV. Hard cap of ${MAX_ACCOUNTS} accounts — depth over breadth.`}
      />

      {message && (
        <div className={`mb-6 px-4 py-3 rounded-lg text-sm flex items-start gap-2 ${
          message.kind === "ok" ? "bg-emerald-50 border border-emerald-200 text-emerald-800" : "bg-amber-50 border border-amber-300 text-amber-900"
        }`}>
          {message.kind === "err" && <AlertTriangle size={15} className="mt-0.5 shrink-0" />}
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <FileSpreadsheet size={18} className="text-gray-700" />
            <h2 className="font-black text-gray-900">Accounts CSV</h2>
          </div>
          <p className="text-xs text-gray-500 mb-4 leading-relaxed">
            Columns: <code className="bg-gray-100 px-1 rounded">name, domain, industry, vertical, type (opportunity|pg), employees, hq, stage, amount, closeDate</code>
          </p>
          <input ref={accountInput} type="file" accept=".csv" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) parseAccounts(f); e.target.value = ""; }} />
          <div className="flex gap-2">
            <button onClick={() => accountInput.current?.click()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-gray-900 text-white hover:bg-gray-700">
              <Upload size={13} /> Upload accounts
            </button>
            <button onClick={() => downloadCsv("accounts-template.csv", accountTemplate)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold border border-gray-300 text-gray-600 hover:border-gray-500">
              <Download size={13} /> Template
            </button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <FileSpreadsheet size={18} className="text-gray-700" />
            <h2 className="font-black text-gray-900">Opportunities CSV</h2>
          </div>
          <p className="text-xs text-gray-500 mb-4 leading-relaxed">
            Columns: <code className="bg-gray-100 px-1 rounded">accountName, name, stage, amount, closeDate, nextStep</code>. Account must exist first.
          </p>
          <input ref={oppInput} type="file" accept=".csv" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) parseOpps(f); e.target.value = ""; }} />
          <div className="flex gap-2">
            <button onClick={() => oppInput.current?.click()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-gray-900 text-white hover:bg-gray-700">
              <Upload size={13} /> Upload opportunities
            </button>
            <button onClick={() => downloadCsv("opportunities-template.csv", oppTemplate)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold border border-gray-300 text-gray-600 hover:border-gray-500">
              <Download size={13} /> Template
            </button>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-black text-gray-900 mb-3">
        Current book · {accounts.length}/{MAX_ACCOUNTS} accounts
      </h2>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">
              <th className="px-4 py-2.5">Account</th>
              <th className="px-4 py-2.5">Industry</th>
              <th className="px-4 py-2.5">Type</th>
              <th className="px-4 py-2.5">Stage / Amount</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((a) => (
              <tr key={a.id} className="border-t border-gray-100">
                <td className="px-4 py-2.5">
                  <span className="font-bold text-gray-900">{a.name}</span>
                  <span className="text-xs text-gray-400 ml-2">{a.domain}</span>
                </td>
                <td className="px-4 py-2.5 text-gray-600 text-xs">{a.industry}</td>
                <td className="px-4 py-2.5">
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    a.type === "opportunity" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  }`}>
                    {a.type === "opportunity" ? "Opportunity" : "PG"}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-xs text-gray-600">
                  {a.stage ? `${a.stage} · ${a.amount ?? ""}` : "—"}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <button
                    onClick={() => update({ accounts: accounts.filter((x) => x.id !== a.id) })}
                    className="text-gray-300 hover:text-red-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={reset}
        className="mt-6 text-xs font-bold text-gray-400 hover:text-red-600"
      >
        Reset workspace to demo data
      </button>
    </div>
  );
}
