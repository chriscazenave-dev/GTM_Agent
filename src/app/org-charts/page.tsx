"use client";

import Link from "next/link";
import { Network, Users, Briefcase, ChevronRight } from "lucide-react";
import { useStore } from "@/lib/store";
import PageHeader from "@/components/PageHeader";

export default function OrgChartsIndex() {
  const { accounts, orgPeople, hydrated } = useStore();

  if (!hydrated) return null;

  return (
    <div className="px-8 py-8 max-w-5xl">
      <PageHeader
        title="Org Charts"
        subtitle="Deep-wiki for the people side of every account. Six layers deep, from CEO to senior manager."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {accounts.map((a) => {
          const people = orgPeople.filter((p) => p.accountId === a.id);
          const connections = people.filter((p) => p.projectConnection).length;
          return (
            <Link
              key={a.id}
              href={`/org-charts/${a.id}`}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-500 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700">
                    <Network size={18} />
                  </div>
                  <div>
                    <div className="font-black text-gray-900">{a.name}</div>
                    <div className="text-xs text-gray-500">{a.industry} · {a.hq}</div>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-600" />
              </div>
              <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                <span className="inline-flex items-center gap-1">
                  <Users size={12} /> {people.length} mapped
                </span>
                <span className="inline-flex items-center gap-1">
                  <Briefcase size={12} /> {connections} project connections
                </span>
                <span className={`ml-auto text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                  a.type === "opportunity" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                }`}>
                  {a.type === "opportunity" ? "Active Opp" : "PG Target"}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
