"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useUserProgress } from "@/components/UserProgressContext";
import { getLevelInfo } from "@/lib/level";

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
      <div className="mb-4 rounded-xl border border-gray-800 bg-[#0d1117] px-4 py-3 text-xs text-gray-400">
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-2 animate-ping rounded-full bg-[#3fb950]" />
          Loading your adventure…
        </span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="k8-pop-in mb-4 overflow-hidden rounded-xl border border-[#3fb950]/40 bg-gradient-to-br from-[#0d1117] to-[#0a1a12] px-4 py-4 text-xs text-gray-200 shadow-lg shadow-[#3fb950]/5">
        <p className="mb-1 flex items-center gap-2 text-[14px] font-bold text-[#3fb950]">
          <span className="k8-float text-lg">🎮</span> Start your quest
        </p>
        <p className="mb-3 text-gray-400">
          Create a local player profile to earn XP, level up, and collect badges as you learn.
          Everything is stored in this browser only.
        </p>
        <form onSubmit={handleCreateProfile} className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Choose a player name"
            className="flex-1 rounded-lg border border-gray-700 bg-black/40 px-3 py-2 text-xs text-gray-100 outline-none focus:border-[#3fb950]"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-1 rounded-lg bg-[#238636] px-4 py-2 text-xs font-semibold text-white transition-transform hover:scale-105 hover:bg-[#2ea043]"
          >
            ▶ Play
          </button>
        </form>
        {error && <p className="mt-1 text-[11px] text-red-400">{error}</p>}
        <p className="mt-2 text-[11px] text-gray-500">
          No email, no password. New players start at Level 1 with a 15 XP welcome bonus.
        </p>
      </div>
    );
  }

  const badgeCount = profile.badges.length;
  const level = getLevelInfo(profile.points);

  return (
    <div className="k8-pop-in mb-4 overflow-hidden rounded-xl border border-[#3fb950]/40 bg-gradient-to-br from-[#020409] via-[#08130d] to-[#020409] px-4 py-4 text-xs text-gray-200 shadow-lg shadow-black/40">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#3fb950]/50 bg-[#0d1117] text-lg font-black text-[#3fb950]">
            <span className="absolute -top-2 -right-2 rounded-full bg-[#238636] px-1.5 py-0.5 text-[9px] font-bold text-white">
              Lv {level.level}
            </span>
            {profile.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[14px] font-bold text-white">
              {profile.name}
            </p>
            <p className="text-[11px] font-medium text-[#3fb950]">{level.title}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-[#d29922]/40 bg-[#d29922]/10 px-2.5 py-1 text-[11px] font-semibold text-[#f0c674]">
            ⭐ {profile.points} XP
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-[#58a6ff]/40 bg-[#58a6ff]/10 px-2.5 py-1 text-[11px] font-semibold text-[#79c0ff]">
            ✅ {profile.completed.length} cleared
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-[#a371f7]/40 bg-[#a371f7]/10 px-2.5 py-1 text-[11px] font-semibold text-[#c9a0ff]">
            🏅 {badgeCount} badge{badgeCount === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      <div className="mt-3">
        <div className="mb-1 flex items-center justify-between text-[10px] text-gray-400">
          <span>
            Level {level.level} · {level.title}
          </span>
          <span>
            {level.isMaxLevel
              ? "MAX LEVEL"
              : `${level.xpIntoLevel} / ${level.xpForLevel} XP to Lv ${level.level + 1}`}
          </span>
        </div>
        <div className="relative h-2.5 overflow-hidden rounded-full bg-[#0d1117] ring-1 ring-inset ring-white/5">
          <div
            className="k8-xp-fill h-full rounded-full bg-gradient-to-r from-[#3fb950] via-[#56d364] to-[#d29922]"
            style={{ width: `${level.progressPct}%` }}
          />
          <div className="k8-shimmer pointer-events-none absolute inset-0" />
        </div>
      </div>

      {badgeCount > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {profile.badges.map((b) => (
            <span
              key={b.id}
              title={b.description}
              className="k8-badge-glow inline-flex items-center gap-1 rounded-full border border-[#3fb950]/30 bg-[#0d1117] px-2 py-0.5 text-[10px] text-[#c9fdd7]"
            >
              🏆 {b.label}
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-white/5 pt-3">
        <Link
          href="/journey"
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#58a6ff] hover:underline"
        >
          🧭 Your journey →
        </Link>
        <Link
          href="/exams"
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#3fb950] hover:underline"
        >
          ⚔️ Exams & tests →
        </Link>
        <button
          type="button"
          onClick={logout}
          className="ml-auto rounded-md border border-gray-700 px-2 py-1 text-[11px] text-gray-400 hover:border-gray-500 hover:text-white"
        >
          Log out
        </button>
      </div>
    </div>
  );
}

