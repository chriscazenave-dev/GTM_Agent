"use client";

import Link from "next/link";
import { ShieldCheck, ShieldAlert, Network, Target, Users } from "lucide-react";
import LinkedInIcon from "@/components/LinkedInIcon";
import { useStore } from "@/lib/store";
import PageHeader from "@/components/PageHeader";

export default function Breakdown() {
  const { accounts, opportunities, orgPeople, emails, hydrated } = useStore();

  if (!hydrated) return null;

  const opps = accounts.filter((a) => a.type === "opportunity");
  const pg = accounts.filter((a) => a.type === "pg");

  const peopleFor = (accountId: string) => orgPeople.filter((p) => p.accountId === accountId);
  const execsFor = (accountId: string) => peopleFor(accountId).filter((p) => p.layer <= 4);

  return (
    <div className="px-8 py-8 max-w-6xl">
      <PageHeader
        title="Ops vs PG Breakdown"
        subtitle="Active opportunities need multi-threading depth. PG accounts need the right first exec."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Active Opportunities</div>
          <div className="text-3xl font-black text-gray-900 mt-1">{opps.length}</div>
          <div className="text-xs text-gray-500 mt-1">{opportunities.length} open opps in pipeline</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">PG Targets</div>
          <div className="text-3xl font-black text-gray-900 mt-1">{pg.length}</div>
          <div className="text-xs text-gray-500 mt-1">{emails.filter((e) => e.status === "suggested").length} suggested emails pending</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Execs Mapped</div>
          <div className="text-3xl font-black text-gray-900 mt-1">{orgPeople.filter((p) => p.layer <= 4).length}</div>
          <div className="text-xs text-gray-500 mt-1">across {accounts.length} accounts</div>
        </div>
      </div>

      <section className="mb-10">
        <h2 className="text-lg font-black text-gray-900 mb-1 flex items-center gap-2">
          <Network size={17} /> Active Opportunities — Multi-thread these
        </h2>
        <p className="text-xs text-gray-500 mb-4">
          Single-threaded deals die. For each opp, here are the execs to add to the thread with best-known emails.
        </p>
        <div className="space-y-4">
          {opps.map((a) => {
            const opp = opportunities.find((o) => o.accountId === a.id);
            const execs = execsFor(a.id);
            const threaded = 1;
            const target = Math.max(3, execs.length);
            return (
              <div key={a.id} className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <Link href={`/org-charts/${a.id}`} className="font-black text-gray-900 hover:underline">{a.name}</Link>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">{a.stage}</span>
                  <span className="text-xs text-gray-500">{a.amount} · closes {a.closeDate}</span>
                  <span className="ml-auto text-xs text-gray-500 inline-flex items-center gap-1">
                    <Users size={12} /> Threading: <span className="font-bold text-gray-900">{threaded}/{target} contacts engaged</span>
                  </span>
                </div>
                {opp?.nextStep && (
                  <div className="mt-2 text-xs text-gray-600"><span className="font-bold">Next step:</span> {opp.nextStep}</div>
                )}
                <div className="mt-3 overflow-x-auto">
                  {execs.length > 0 ? (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">
                          <th className="py-2 pr-4">Exec to thread</th>
                          <th className="py-2 pr-4">Why them</th>
                          <th className="py-2 pr-4">Email</th>
                          <th className="py-2">LinkedIn</th>
                        </tr>
                      </thead>
                      <tbody>
                        {execs.map((p) => (
                          <tr key={p.id} className="border-b border-gray-50 last:border-0">
                            <td className="py-2 pr-4">
                              <span className="font-bold text-gray-900">{p.name}</span>
                              <div className="text-xs text-gray-500">{p.title}</div>
                            </td>
                            <td className="py-2 pr-4 text-xs text-gray-600">{p.projectConnection ?? p.focusArea ?? "Org influence"}</td>
                            <td className="py-2 pr-4">
                              {p.email ? (
                                <span className={`inline-flex items-center gap-1 text-xs font-semibold ${p.emailStatus === "verified" ? "text-emerald-800" : "text-amber-800"}`}>
                                  {p.emailStatus === "verified" ? <ShieldCheck size={11} /> : <ShieldAlert size={11} />}
                                  {p.email}
                                </span>
                              ) : (
                                <span className="text-xs text-gray-400">Enrich via Apollo</span>
                              )}
                            </td>
                            <td className="py-2">
                              {p.linkedinUrl ? (
                                <a href={p.linkedinUrl} target="_blank" rel="noreferrer" className="text-sky-700"><LinkedInIcon size={14} /></a>
                              ) : (
                                <span className="text-xs text-gray-300">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-xs text-gray-400">No execs mapped yet — build the org chart first.</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-black text-gray-900 mb-1 flex items-center gap-2">
          <Target size={17} /> PG Accounts — Land the first exec
        </h2>
        <p className="text-xs text-gray-500 mb-4">
          For net-new accounts, one great personalized email beats ten generic ones. Best entry point per account:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {pg.map((a) => {
            const execs = execsFor(a.id);
            const best = execs.find((p) => p.projectConnection) ?? execs[0];
            const pendingEmails = emails.filter((e) => e.accountId === a.id && e.status === "suggested").length;
            return (
              <div key={a.id} className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-center gap-2">
                  <Link href={`/org-charts/${a.id}`} className="font-black text-gray-900 hover:underline">{a.name}</Link>
                  <span className="text-xs text-gray-500">{a.industry}</span>
                  {pendingEmails > 0 && (
                    <Link href="/suggested-pg" className="ml-auto text-[10px] font-black uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full hover:bg-amber-200">
                      {pendingEmails} draft{pendingEmails > 1 ? "s" : ""} ready
                    </Link>
                  )}
                </div>
                {best ? (
                  <div className="mt-3 bg-gray-50 rounded-lg px-3 py-2.5">
                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Best entry point</div>
                    <div className="font-bold text-sm text-gray-900">{best.name}</div>
                    <div className="text-xs text-gray-500">{best.title}</div>
                    {best.projectConnection && (
                      <div className="text-xs text-amber-900 mt-1">{best.projectConnection}</div>
                    )}
                  </div>
                ) : (
                  <div className="mt-3 text-xs text-gray-400">No execs mapped yet — build the org chart first.</div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
