"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Newspaper, Mail, Network, GitBranch, Upload, Settings, Mic, Compass,
} from "lucide-react";
import { useStore } from "@/lib/store";

const navItems = [
  { href: "/", label: "News of the Day", icon: Newspaper },
  { href: "/suggested-pg", label: "Suggested PG", icon: Mail },
  { href: "/org-charts", label: "Org Charts", icon: Network },
  { href: "/breakdown", label: "Ops vs PG Breakdown", icon: GitBranch },
  { href: "/upload", label: "Upload Data", icon: Upload },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { onboarding, hydrated } = useStore();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <aside className="w-60 shrink-0 h-screen sticky top-0 flex flex-col bg-gray-50 border-r border-gray-200">
      <div className="px-5 py-5 border-b border-gray-200">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gray-900 text-white flex items-center justify-center">
            <Compass size={17} />
          </div>
          <div>
            <div className="text-sm font-black tracking-tight text-gray-900">GTM Agent</div>
            <div className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">
              Enterprise Selling
            </div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              isActive(href)
                ? "bg-gray-900 text-white"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="px-3 pb-4 space-y-1">
        {hydrated && !onboarding.completed && (
          <Link
            href="/onboarding"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 transition-colors"
          >
            <Mic size={16} />
            Finish Onboarding
          </Link>
        )}
        <Link
          href="/settings"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
            isActive("/settings")
              ? "bg-gray-900 text-white"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          <Settings size={16} />
          Settings & API Keys
        </Link>
      </div>
    </aside>
  );
}
