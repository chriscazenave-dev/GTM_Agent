"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  Account, AccountIntel, Opportunity, NewsItem, OrgPerson, EngProject, SuggestedEmail,
  OnboardingState, ApiKeys,
} from "./types";
import {
  seedAccounts, seedOpportunities, seedNews, seedOrgPeople, seedProjects, seedEmails, seedIntel,
} from "./mockData";

const LS_KEY = "gtm-agent-store-v1";

interface StoreData {
  accounts: Account[];
  opportunities: Opportunity[];
  news: NewsItem[];
  orgPeople: OrgPerson[];
  projects: EngProject[];
  emails: SuggestedEmail[];
  intel: AccountIntel[];
  onboarding: OnboardingState;
  apiKeys: ApiKeys;
  writingLearnings: string[];
}

const defaultData: StoreData = {
  accounts: seedAccounts,
  opportunities: seedOpportunities,
  news: seedNews,
  orgPeople: seedOrgPeople,
  projects: seedProjects,
  emails: seedEmails,
  intel: seedIntel,
  onboarding: { completed: false, answers: [] },
  apiKeys: {},
  writingLearnings: [],
};

interface StoreContextValue extends StoreData {
  hydrated: boolean;
  update: (patch: Partial<StoreData>) => void;
  reset: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<StoreData>(defaultData);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<StoreData>;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setData({ ...defaultData, ...parsed });
      }
    } catch {
      // keep defaults
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true);
  }, []);

  const update = useCallback((patch: Partial<StoreData>) => {
    setData((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(LS_KEY, JSON.stringify(next));
      } catch {
        // storage full (e.g. audio blobs) — drop audio and retry
        try {
          const slim = {
            ...next,
            onboarding: {
              ...next.onboarding,
              answers: next.onboarding.answers.map((a) => ({ ...a, audioDataUrl: undefined })),
            },
          };
          localStorage.setItem(LS_KEY, JSON.stringify(slim));
        } catch { /* give up persisting */ }
      }
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    localStorage.removeItem(LS_KEY);
    setData(defaultData);
  }, []);

  return (
    <StoreContext.Provider value={{ ...data, hydrated, update, reset }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
