"use client";

import Link from "next/link";
import type { ReactNode } from "react";

export type QuestTask = { id: string; label: string };
export type QuestTheme = "k8" | "terraform" | "coding";

type ThemeStyle = {
  accent: string;
  border: string;
  bar: string;
  chip: string;
  currentRow: string;
  glow: string;
};

const THEMES: Record<QuestTheme, ThemeStyle> = {
  k8: {
    accent: "text-[#3fb950]",
    border: "border-[#3fb950]/40",
    bar: "from-[#3fb950] via-[#56d364] to-[#3fb950]",
    chip: "border-[#3fb950]/40 bg-[#3fb950]/10 text-[#7ee787]",
    currentRow: "border-[#3fb950]/50 bg-[#3fb950]/10",
    glow: "shadow-[#3fb950]/10",
  },
  terraform: {
    accent: "text-[#d29922]",
    border: "border-[#d29922]/40",
    bar: "from-[#d29922] via-[#f0c674] to-[#d29922]",
    chip: "border-[#d29922]/40 bg-[#d29922]/10 text-[#f0c674]",
    currentRow: "border-[#d29922]/50 bg-[#d29922]/10",
    glow: "shadow-[#d29922]/10",
  },
  coding: {
    accent: "text-[#58a6ff]",
    border: "border-[#58a6ff]/40",
    bar: "from-[#58a6ff] via-[#79c0ff] to-[#58a6ff]",
    chip: "border-[#58a6ff]/40 bg-[#58a6ff]/10 text-[#79c0ff]",
    currentRow: "border-[#58a6ff]/50 bg-[#58a6ff]/10",
    glow: "shadow-[#58a6ff]/10",
  },
};

interface QuestProgressPanelProps {
  theme?: QuestTheme;
  title?: string;
  tasks: QuestTask[];
  completedTasks: Record<string, boolean>;
  currentTaskId: string | null;
  isCompleted: boolean;
  xpReward?: number;
  feedback?: string | null;
  nextHref?: string | null;
  intro?: ReactNode;
}

export default function QuestProgressPanel({
  theme = "k8",
  title = "Quest",
  tasks,
  completedTasks,
  currentTaskId,
  isCompleted,
  xpReward = 10,
  feedback,
  nextHref,
  intro,
}: QuestProgressPanelProps) {
  if (tasks.length === 0) return null;

  const style = THEMES[theme];
  const total = tasks.length;
  const completedCount = tasks.filter((t) => completedTasks[t.id]).length;
  const allDone = completedCount === total;
  const progressPct = Math.round((completedCount / total) * 100);
  const cleared = allDone || isCompleted;

  return (
    <div
      className={`k8-pop-in mb-4 overflow-hidden rounded-xl border ${style.border} bg-gradient-to-br from-[#050810] to-[#0a0f17] px-4 py-3 text-xs text-gray-200 shadow-lg ${style.glow}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-base">{cleared ? "🏆" : "🎯"}</span>
          <span className={`text-[13px] font-bold ${style.accent}`}>{title}</span>
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${style.chip}`}
        >
          ⭐ +{xpReward} XP
        </span>
      </div>

      {intro && <div className="mt-2 text-[11px] text-gray-400">{intro}</div>}

      <div className="mt-3">
        <div className="mb-1 flex items-center justify-between text-[10px] text-gray-400">
          <span>
            {cleared ? "Quest cleared" : "Progress"}
          </span>
          <span className="font-semibold text-gray-300">
            {completedCount} / {total} steps
          </span>
        </div>
        <div className="relative h-2.5 overflow-hidden rounded-full bg-[#0d1117] ring-1 ring-inset ring-white/5">
          <div
            className={`k8-xp-fill h-full rounded-full bg-gradient-to-r ${style.bar}`}
            style={{ width: `${progressPct}%` }}
          />
          {!cleared && completedCount > 0 && (
            <div className="k8-shimmer pointer-events-none absolute inset-0" />
          )}
        </div>
      </div>

      <ul className="mt-3 space-y-1.5">
        {tasks.map((task, index) => {
          const done = completedTasks[task.id];
          const isCurrent = !done && currentTaskId === task.id;
          return (
            <li
              key={task.id}
              className={`flex items-start gap-2 rounded-lg border px-2.5 py-1.5 transition-colors ${
                isCurrent
                  ? `${style.currentRow}`
                  : done
                    ? "border-transparent bg-white/[0.02]"
                    : "border-transparent opacity-70"
              }`}
            >
              <span className="mt-[1px] text-[12px]">
                {done ? "✅" : isCurrent ? "➡️" : "🔒"}
              </span>
              <span
                className={`text-[11px] ${
                  done
                    ? "text-gray-300 line-through decoration-gray-600"
                    : isCurrent
                      ? "font-medium text-white"
                      : "text-gray-500"
                }`}
              >
                <span className="mr-1 text-gray-500">Step {index + 1}.</span>
                {task.label}
              </span>
            </li>
          );
        })}
      </ul>

      {cleared ? (
        <div
          className={`k8-pop-in mt-3 flex flex-wrap items-center gap-2 rounded-lg border ${style.border} bg-black/30 px-3 py-2`}
        >
          <span className="text-base">🎉</span>
          <span className={`text-[12px] font-semibold ${style.accent}`}>
            Quest complete! +{xpReward} XP earned.
          </span>
          {nextHref && (
            <Link
              href={nextHref}
              className="ml-auto inline-flex items-center gap-1 rounded-lg bg-[#1f6feb] px-3 py-1.5 text-[11px] font-semibold text-white transition-transform hover:scale-105 hover:bg-[#388bfd]"
            >
              Next quest →
            </Link>
          )}
        </div>
      ) : (
        feedback && (
          <p className="mt-2 text-[11px] text-gray-400">{feedback}</p>
        )
      )}
    </div>
  );
}
