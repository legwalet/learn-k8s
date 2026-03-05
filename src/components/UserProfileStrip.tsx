"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useUserProgress } from "@/components/UserProgressContext";

export default function UserProfileStrip() {
  const { profile, status, signup, logout } = useUserProgress();
  const [nameInput, setNameInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleCreateProfile = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed) {
      setError("Enter a name to create your profile.");
      return;
    }
    signup(trimmed);
    setNameInput("");
    setError(null);
  };

  if (status === "loading") {
    return (
      <div className="mb-4 rounded-lg border border-gray-800 bg-[#0d1117] px-4 py-3 text-xs text-gray-400">
        Loading your learning journey…
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mb-4 rounded-lg border border-[#3fb950]/40 bg-[#0d1117] px-4 py-3 text-xs text-gray-200">
        <p className="mb-2 text-[13px] font-semibold text-[#3fb950]">
          Create your learning profile
        </p>
        <p className="mb-2 text-gray-400">
          Sign up locally to track your journey, complete assessments, and earn points and badges.
          Everything is stored in this browser only.
        </p>
        <form onSubmit={handleCreateProfile} className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Your name or nickname"
            className="flex-1 rounded-md border border-gray-700 bg-black/40 px-2 py-1.5 text-xs text-gray-100 outline-none focus:border-[#3fb950]"
          />
          <button
            type="submit"
            className="mt-1 inline-flex items-center justify-center rounded-md bg-[#238636] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#2ea043] sm:mt-0"
          >
            Sign up
          </button>
        </form>
        {error && <p className="mt-1 text-[11px] text-red-400">{error}</p>}
        <p className="mt-2 text-[11px] text-gray-500">
          No email, no password — this is a local profile for practice only.
        </p>
      </div>
    );
  }

  const badgeCount = profile.badges.length;

  return (
    <div className="mb-4 flex flex-col gap-2 rounded-lg border border-[#3fb950]/40 bg-[#020409] px-4 py-3 text-xs text-gray-200 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <p className="text-[13px] font-semibold text-[#3fb950]">
          Hi, {profile.name}!{" "}
          <span className="text-[11px] text-gray-400">
            {profile.points} pts · {profile.completed.length} completed
          </span>
        </p>
        <p className="text-[11px] text-gray-400">
          {badgeCount === 0 && "Start a lesson or assessment to earn your first badge."}
          {badgeCount > 0 && (
            <>
              Badges:{" "}
              <span className="text-gray-200">
                {profile.badges.map((b) => b.label).join(", ")}
              </span>
            </>
          )}
        </p>
        <div className="flex flex-wrap gap-3 mt-1">
          <Link
            href="/journey"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-[#58a6ff] hover:underline"
          >
            Journey (progress) →
          </Link>
          <Link
            href="/assessments"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-[#3fb950] hover:underline"
          >
            Assessments & tests →
          </Link>
        </div>
      </div>
      <button
        type="button"
        onClick={logout}
        className="self-start rounded-md border border-gray-700 px-2 py-1 text-[11px] text-gray-400 hover:border-gray-500 hover:text-white sm:self-auto"
      >
        Log out
      </button>
    </div>
  );
}

