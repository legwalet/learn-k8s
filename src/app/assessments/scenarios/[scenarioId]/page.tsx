"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import SimulatedK8Terminal from "@/components/SimulatedK8Terminal";
import SimulatedTerraformTerminal from "@/components/SimulatedTerraformTerminal";
import { useUserProgress } from "@/components/UserProgressContext";
import { findScenarioById, getScenarioJourneyId } from "@/data/scenarioLookup";
import { getNextIncompleteJourneyHref } from "@/data/kubernetesScenarios";
import { getNextIncompleteTerraformJourneyHref } from "@/data/terraformScenarios";
import { getCurrentTask } from "@/lib/sequentialTasks";

const DragDropAssessmentClient = dynamic(
  () => import("@/components/DragDropAssessment"),
  {
    ssr: false,
    loading: () => (
      <div className="mb-4 rounded-lg border border-gray-800 bg-[#0d1117] min-h-[120px] animate-pulse" />
    ),
  }
);

type CommandLike = { id: string; label: string };
type TaskLike = { id: string; label: string; acceptedCommandIds: string[] };

function normalizeCommand(cmd: string): string {
  let cleaned = cmd.trim();
  if (cleaned.startsWith("$")) cleaned = cleaned.slice(1).trim();
  return cleaned.toLowerCase().replace(/\s+/g, " ");
}

function normalizedMatchesAcceptedCommand(
  normalizedCmd: string,
  commandId: string,
  commands: CommandLike[]
): boolean {
  const meta = commands.find((c) => c.id === commandId);
  if (!meta) return false;
  const lc = meta.label.trim().toLowerCase().replace(/\s+/g, " ");
  if (normalizedCmd === lc) return true;
  const noAngle = lc.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  if (noAngle.length > 0 && normalizedCmd.startsWith(noAngle)) return true;
  const prefix = lc.split("<")[0]?.trim().replace(/\s+/g, " ") ?? "";
  return prefix.length > 0 && normalizedCmd.startsWith(prefix);
}

function terminalMatchesTask(
  normalizedCmd: string,
  task: TaskLike,
  commands: CommandLike[]
): boolean {
  return task.acceptedCommandIds.some((id) =>
    normalizedMatchesAcceptedCommand(normalizedCmd, id, commands)
  );
}

export default function ScenarioAssessmentPage() {
  const params = useParams();
  const scenarioId = params?.scenarioId as string;
  const resolved = findScenarioById(scenarioId);
  const scenario = resolved?.scenario;
  const track = resolved?.track ?? "kubernetes";
  const { profile, markCompleted } = useUserProgress();
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
  const [feedback, setFeedback] = useState<string | null>(null);

  const commands = useMemo(() => scenario?.commands ?? [], [scenario?.commands]);
  const tasks = useMemo(() => scenario?.tasks ?? [], [scenario?.tasks]);

  const currentTask = getCurrentTask(tasks, completedTasks);
  const totalTasks = tasks.length;
  const completedCount = tasks.filter((task) => completedTasks[task.id]).length;
  const allDone = totalTasks > 0 && completedCount === totalTasks;
  const journeyId = scenario ? getScenarioJourneyId(track, scenario.id) : "";
  const alreadyCompleted =
    journeyId && profile ? profile.completed.some((item) => item.id === journeyId) : false;
  const completedJourneyIds = useMemo(
    () => new Set(profile?.completed.map((item) => item.id) ?? []),
    [profile?.completed]
  );
  const nextJourneyHref = scenario
    ? track === "terraform"
      ? getNextIncompleteTerraformJourneyHref(completedJourneyIds, {
          type: "scenario",
          scenarioId: scenario.id,
        })
      : getNextIncompleteJourneyHref(completedJourneyIds, {
          type: "scenario",
          scenarioId: scenario.id,
        })
    : null;

  const trackHref = track === "terraform" ? "/learn/terraform" : "/learn/kubernetes";
  const trackLabel = track === "terraform" ? "Terraform track" : "Kubernetes track";
  const accentBorder = track === "terraform" ? "border-[#d29922]" : "border-[#3fb950]";
  const accentCode = track === "terraform" ? "text-[#d29922]" : "text-[#3fb950]";

  const completeTask = useCallback((taskId: string, label: string) => {
    setCompletedTasks((prev) => ({ ...prev, [taskId]: true }));
    setFeedback(`Nice work. Completed: ${label}`);
  }, []);

  useEffect(() => {
    if (!scenario || tasks.length === 0 || !alreadyCompleted) return;
    setCompletedTasks((prev) => {
      const next = { ...prev };
      for (const t of tasks) next[t.id] = true;
      return next;
    });
  }, [scenario, tasks, alreadyCompleted]);

  useEffect(() => {
    if (!scenario || !profile || !allDone || alreadyCompleted) return;
    markCompleted({ id: journeyId, kind: "assessment" });
  }, [allDone, alreadyCompleted, journeyId, markCompleted, profile, scenario]);

  const handleTerminalCommand = useCallback(
    (cmd: string) => {
      const normalized = normalizeCommand(cmd);
      if (!currentTask) return;
      if (terminalMatchesTask(normalized, currentTask, commands)) {
        completeTask(currentTask.id, currentTask.label);
        return;
      }
      setFeedback(`Complete the current unlocked task first: ${currentTask.label}`);
    },
    [commands, completeTask, currentTask]
  );

  const handleTaskMatched = useCallback(
    (taskId: string, optionId: string) => {
      if (!currentTask || currentTask.id !== taskId) {
        setFeedback("Complete the current unlocked task first.");
        return;
      }
      if (currentTask.acceptedCommandIds.includes(optionId)) {
        completeTask(taskId, currentTask.label);
        return;
      }
      const selected = commands.find((cmd) => cmd.id === optionId)?.label ?? "That command";
      setFeedback(`${selected} does not solve this task. Try again.`);
    },
    [commands, completeTask, currentTask]
  );

  if (!scenario) {
    return (
      <main className="min-h-screen bg-[#0d1117] p-6">
        <Link href="/exams" className="text-[#3fb950] hover:underline">
          ← Back to exams
        </Link>
        <p className="mt-4 text-gray-400">Scenario not found.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0d1117]">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
        <Link href={trackHref} className="mb-5 inline-block text-sm text-gray-400 hover:text-white">
          ← {trackLabel}
        </Link>
        <h1 className="text-2xl font-bold text-white">{scenario.title}</h1>
        <p className="mt-1 text-sm text-gray-400">{scenario.description}</p>
        <span className="mt-2 inline-flex rounded-full border border-gray-700 bg-[#11161d] px-2 py-0.5 text-[11px] text-gray-300">
          Difficulty: {scenario.difficulty}
        </span>
        <p className={`mt-3 rounded-lg border ${accentBorder}/30 bg-[#050810] px-3 py-2 text-xs text-gray-300`}>
          {scenario.context}
        </p>

        <div className={`mt-4 rounded-lg border ${accentBorder}/40 bg-[#050810] px-3 py-2 text-xs text-gray-200`}>
          <span className="rounded-full bg-gray-800 px-2 py-0.5 text-[11px] text-gray-300">
            Exam progress: {completedCount} / {totalTasks}
          </span>
          {alreadyCompleted && (
            <span className="ml-2 rounded-full bg-[#1f6f3f] px-2 py-0.5 text-[11px] text-[#c9fdd7]">
              Previously passed
            </span>
          )}
          {allDone && (
            <span className="ml-2 rounded-full bg-[#1f6f3f] px-2 py-0.5 text-[11px] text-[#c9fdd7]">
              Exam passed
            </span>
          )}
          {allDone && nextJourneyHref && (
            <Link
              href={nextJourneyHref}
              className="ml-2 inline-flex rounded bg-[#1f6feb] px-2.5 py-1 text-[11px] font-medium text-white hover:bg-[#388bfd]"
            >
              Next step →
            </Link>
          )}
        </div>

        <div className="mt-4">
          <DragDropAssessmentClient
            title="Interactive exam"
            subtitle="Drag the right command to each task. Complete in sequence to pass."
            options={commands}
            tasks={tasks.map((task) => ({ id: task.id, label: task.label }))}
            completedTaskIds={completedTasks}
            currentTaskId={currentTask?.id ?? null}
            feedback={feedback}
            onTaskMatched={handleTaskMatched}
          />
        </div>

        <div className={`mt-4 rounded-lg border ${accentBorder}/40 bg-[#050810] px-3 py-3`}>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
            {track === "terraform" ? "Simulated terraform terminal" : "Simulated kubectl terminal"}
          </span>
          <p className="mt-1 text-[11px] text-gray-500">
            Type commands from the exam. Tasks unlock one at a time.
          </p>
          <div className="mt-3 min-h-[220px]">
            {track === "terraform" ? (
              <SimulatedTerraformTerminal onCommand={handleTerminalCommand} />
            ) : (
              <SimulatedK8Terminal onCommand={handleTerminalCommand} />
            )}
          </div>
        </div>

        {allDone && !nextJourneyHref && (
          <p className="mt-2 text-xs text-[#c9fdd7]">
            Final exam passed. You&apos;ve reached the end of this {track === "terraform" ? "Terraform" : "Kubernetes"} flow.
          </p>
        )}
      </div>
    </main>
  );
}
