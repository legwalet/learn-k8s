"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type JourneyItemKind = "lesson" | "assessment" | "test";

export type CompletedItem = {
  id: string; // e.g. "kubernetes:intro"
  kind: JourneyItemKind;
  completedAt: string;
};

export type Badge = {
  id: string;
  label: string;
  description: string;
};

export type UserProfile = {
  id: string;
  name: string;
  points: number;
  completed: CompletedItem[];
  badges: Badge[];
};

type UserProgressContextValue = {
  profile: UserProfile | null;
  status: "loading" | "ready";
  signup: (name: string) => void;
  logout: () => void;
  markCompleted: (args: { id: string; kind: JourneyItemKind }) => void;
};

const STORAGE_KEY = "k8learn:userProfile";

const UserProgressContext = createContext<UserProgressContextValue | undefined>(
  undefined
);

export function useUserProgress() {
  const ctx = useContext(UserProgressContext);
  if (!ctx) {
    throw new Error("useUserProgress must be used within UserProgressProvider");
  }
  return ctx;
}

function createInitialProfile(name: string): UserProfile {
  return {
    id: `local-${Date.now()}`,
    name: name.trim() || "Learner",
    points: 0,
    completed: [],
    badges: [],
  };
}

function computeBadges(profile: UserProfile): Badge[] {
  const badges: Badge[] = [];
  const completedCount = profile.completed.length;
  const points = profile.points;

  if (completedCount >= 1) {
    badges.push({
      id: "first-step",
      label: "First Step",
      description: "Completed your first lesson, assessment, or test.",
    });
  }

  if (completedCount >= 3) {
    badges.push({
      id: "steady-learner",
      label: "Steady Learner",
      description: "Completed three or more learning activities.",
    });
  }

  if (completedCount >= 5) {
    badges.push({
      id: "assessment-ace",
      label: "Assessment Ace",
      description: "Completed five or more lessons, assessments, or tests.",
    });
  }

  if (points >= 100) {
    badges.push({
      id: "points-master",
      label: "Points Master",
      description: "Earned 100+ points from your journey.",
    });
  }

  return badges;
}

function awardPointsFor(kind: JourneyItemKind): number {
  switch (kind) {
    case "lesson":
      return 10;
    case "assessment":
      return 20;
    case "test":
      return 25;
    default:
      return 10;
  }
}

export function UserProgressProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [status, setStatus] = useState<"loading" | "ready">("loading");

  // Load from localStorage on first mount
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as UserProfile;
        setProfile({
          ...parsed,
          completed: parsed.completed ?? [],
          badges: parsed.badges ?? [],
        });
      }
    } catch {
      // ignore corrupted data; user can sign up again
      setProfile(null);
    } finally {
      setStatus("ready");
    }
  }, []);

  // Persist whenever profile changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!profile) {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }, [profile]);

  const signup = useCallback((name: string) => {
    const next = createInitialProfile(name);
    next.badges = computeBadges(next);
    setProfile(next);
  }, []);

  const logout = useCallback(() => {
    setProfile(null);
  }, []);

  const markCompleted = useCallback(
    ({ id, kind }: { id: string; kind: JourneyItemKind }) => {
      setProfile((current) => {
        if (!current) return current;

        const alreadyDone = current.completed.some((item) => item.id === id);
        if (alreadyDone) return current;

        const now = new Date().toISOString();
        const pointsToAdd = awardPointsFor(kind);

        const updated: UserProfile = {
          ...current,
          points: current.points + pointsToAdd,
          completed: [
            ...current.completed,
            {
              id,
              kind,
              completedAt: now,
            },
          ],
        };

        updated.badges = computeBadges(updated);

        return updated;
      });
    },
    []
  );

  return (
    <UserProgressContext.Provider
      value={{
        profile,
        status,
        signup,
        logout,
        markCompleted,
      }}
    >
      {children}
    </UserProgressContext.Provider>
  );
}

