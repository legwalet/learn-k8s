"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import SimulatedTerraformTerminal from "@/components/SimulatedTerraformTerminal";
import { useUserProgress } from "@/components/UserProgressContext";
import {
  type TerraformScenarioCommand,
  type TerraformScenarioTask,
  getNextTerraformTeachingTopicHref,
  getTerraformTeachingTopicUnlockState,
  terraformScenarios,
  terraformTopicProgressId,
} from "@/data/terraformScenarios";

const DragDropAssessmentClient = dynamic(
  () => import("@/components/DragDropAssessment"),
  {
    ssr: false,
    loading: () => (
      <div className="mb-4 rounded-lg border border-gray-800 bg-[#0d1117] min-h-[120px] animate-pulse" />
    ),
  }
);

const scenarioPanel =
  "mb-4 flex flex-col gap-2 rounded-lg border border-[#d29922]/40 bg-[#050810] px-3 py-3 text-xs text-gray-200";

function displayTopicTitle(title: string): string {
  return title.replace(/^Scenario:\s*/i, "").trim() || title;
}

function normalizeCommand(cmd: string): string {
  let cleaned = cmd.trim();
  if (cleaned.startsWith("$")) cleaned = cleaned.slice(1).trim();
  return cleaned.toLowerCase().replace(/\s+/g, " ");
}

function normalizedMatchesAcceptedCommand(
  normalizedCmd: string,
  commandId: string,
  commands: TerraformScenarioCommand[]
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
  task: TerraformScenarioTask,
  commands: TerraformScenarioCommand[]
): boolean {
  return task.acceptedCommandIds.some((id) =>
    normalizedMatchesAcceptedCommand(normalizedCmd, id, commands)
  );
}

export default function KubernetesTopicTeachingPage() {
  const params = useParams();
  const topicId = params?.topicId as string;
  const topic = terraformScenarios.find((t) => t.id === topicId);
  const { profile, markCompleted } = useUserProgress();

  const completedIds = useMemo(
    () => new Set(profile?.completed.map((c) => c.id) ?? []),
    [profile?.completed]
  );

  const unlock = topic
    ? getTerraformTeachingTopicUnlockState(topic.id, completedIds)
    : { unlocked: false, previousTopicTitle: null, previousTopicId: null };

  const progressId = topic ? terraformTopicProgressId(topic.id) : "";

  const topicDone =
    progressId && profile ? profile.completed.some((item) => item.id === progressId) : false;

  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
  const [taskFeedback, setTaskFeedback] = useState<string | null>(null);

  const tasks = useMemo(() => topic?.tasks ?? [], [topic?.tasks]);
  const commands = useMemo(() => topic?.commands ?? [], [topic?.commands]);
  const totalTasks = tasks.length;
  const completedCount = tasks.filter((t) => completedTasks[t.id]).length;
  const allTasksDone = totalTasks > 0 && completedCount === totalTasks;
  const currentTask = tasks.find((task) => !completedTasks[task.id]) ?? null;

  const nextTopicHref = topic ? getNextTerraformTeachingTopicHref(topic.id) : null;

  const completeStep = useCallback((taskId: string, label: string) => {
    setCompletedTasks((prev) => ({ ...prev, [taskId]: true }));
    setTaskFeedback(`Step complete: ${label}`);
  }, []);

  useEffect(() => {
    if (!topic || tasks.length === 0 || !topicDone) return;
    setCompletedTasks((prev) => {
      const next = { ...prev };
      for (const t of tasks) next[t.id] = true;
      return next;
    });
  }, [topic, tasks, topicDone]);

  useEffect(() => {
    if (!topic || !profile || !unlock.unlocked) return;
    if (topicDone || !allTasksDone || tasks.length === 0) return;
    markCompleted({
      id: progressId,
      kind: "lesson",
    });
    // Topic practice unlocks the matching scenario step on the main Kubernetes journey.
    markCompleted({
      id: `terraform-scenario:${topic.id}`,
      kind: "assessment",
    });
  }, [
    allTasksDone,
    topic,
    profile,
    unlock.unlocked,
    topicDone,
    progressId,
    markCompleted,
    tasks.length,
  ]);

  const handleTerminalCommand = useCallback(
    (cmd: string) => {
      const normalized = normalizeCommand(cmd);
      if (!currentTask) return;
      if (terminalMatchesTask(normalized, currentTask, commands)) {
        completeStep(currentTask.id, currentTask.label);
        return;
      }
      setTaskFeedback(`Finish the current step first: ${currentTask.label}`);
    },
    [commands, completeStep, currentTask]
  );

  const handleDragDrop = useCallback(
    (taskId: string, optionId: string) => {
      if (!currentTask || currentTask.id !== taskId) {
        setTaskFeedback("Complete the current unlocked step first.");
        return;
      }
      if (currentTask.acceptedCommandIds.includes(optionId)) {
        completeStep(taskId, currentTask.label);
        return;
      }
      const lbl = commands.find((c) => c.id === optionId)?.label ?? "That command";
      setTaskFeedback(`${lbl} doesn’t match this step. Try again.`);
    },
    [commands, completeStep, currentTask]
  );

  if (!topic) {
    return (
      <main className="min-h-screen bg-[#0d1117] p-6">
        <Link href="/learn/terraform" className="text-[#d29922] hover:underline">
          ← Learn Terraform
        </Link>
        <p className="mt-4 text-gray-400">Topic not found.</p>
      </main>
    );
  }

  const title = displayTopicTitle(topic.title);

  if (!unlock.unlocked) {
    return (
      <main className="min-h-screen bg-[#0d1117]">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
          <Link
            href="/learn/terraform"
            className="mb-5 inline-block text-sm text-gray-400 hover:text-white"
          >
            ← Learn Terraform
          </Link>
          <h1 className="text-2xl font-bold text-gray-500">🔒 {title}</h1>
          <div className={`${scenarioPanel} mt-5 border-gray-700`}>
            <p className="text-sm text-gray-300">
              Complete every practice step in the previous topic correctly to unlock this one.
            </p>
            {unlock.previousTopicId && unlock.previousTopicTitle && (
              <Link
                href={`/learn/terraform/topics/${unlock.previousTopicId}`}
                className="mt-2 inline-block text-[11px] font-medium text-[#58a6ff] hover:underline"
              >
                ← Open previous topic: {unlock.previousTopicTitle}
              </Link>
            )}
            {!profile && (
              <p className="mt-2 text-[11px] text-gray-500">
                Sign in with a local profile above so completions are saved and the next topics
                unlock in order.
              </p>
            )}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0d1117]">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        <Link
          href="/learn/terraform"
          className="mb-5 inline-block text-sm text-gray-400 hover:text-white"
        >
          ← Learn Terraform
        </Link>

        <h1 className="text-2xl font-bold text-white">{title}</h1>
        <p className="mt-1 text-sm text-gray-400">{topic.description}</p>
        <span className="mt-3 inline-flex rounded-full border border-gray-700 bg-[#11161d] px-2 py-0.5 text-[11px] text-gray-300">
          {topic.difficulty} · teaching topic
        </span>

        <div className={`${scenarioPanel} mt-5`}>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
            Situation
          </span>
          <p className="text-sm leading-relaxed text-gray-300">{topic.context}</p>
        </div>

        <div className={scenarioPanel}>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
            What engineers usually verify
          </span>
          <ol className="mt-2 list-decimal space-y-2 pl-4 text-sm text-gray-300">
            {topic.tasks.map((task) => (
              <li key={task.id}>{task.label}</li>
            ))}
          </ol>
        </div>

        {tasks.length > 0 && (
          <div className={scenarioPanel}>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] ${
                  topicDone
                    ? "bg-[#1f6f3f] text-[#c9fdd7]"
                    : allTasksDone
                      ? "bg-[#1f6f3f]/80 text-[#e5ffef]"
                      : "bg-gray-800 text-gray-300"
                }`}
              >
                {topicDone
                  ? "Topic practice complete"
                  : allTasksDone
                    ? "Saving progress…"
                    : "Practice in progress"}
              </span>
              <span className="text-[11px] text-gray-400">
                Steps completed: {completedCount} / {totalTasks}
              </span>
            </div>
            <p className="text-[11px] text-gray-400">
              <span className="font-semibold text-gray-300">Scenario: </span>
              Run the right <code className="text-[#d29922]">terraform</code> command for each step in
              order. Use drag-and-drop or the simulated terminal. The next topic stays locked until
              every step here is correct.
            </p>
            <ul className="mt-1 space-y-1">
              {tasks.map((task) => {
                const done = completedTasks[task.id];
                const isCurrent = !done && currentTask?.id === task.id;
                return (
                  <li key={task.id} className="flex items-start gap-2">
                    <span className="mt-[2px] text-[11px]">
                      {done ? "✅" : isCurrent ? "➡️" : "🔒"}
                    </span>
                    <span
                      className={`text-[11px] ${
                        done ? "text-gray-200" : isCurrent ? "text-[#e5ffef]" : "text-gray-500"
                      }`}
                    >
                      {task.label}
                    </span>
                  </li>
                );
              })}
            </ul>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {taskFeedback && <p className="text-[11px] text-gray-400">{taskFeedback}</p>}
              {allTasksDone && !profile && (
                <p className="text-[11px] text-amber-300/90">
                  Sign in on Learn Terraform to save this completion and unlock the next scenario.
                </p>
              )}
              {profile && nextTopicHref && (topicDone || allTasksDone) && (
                <Link
                  href={nextTopicHref}
                  className="inline-flex rounded bg-[#1f6feb] px-2.5 py-1 text-[11px] font-medium text-white hover:bg-[#388bfd]"
                >
                  Next topic →
                </Link>
              )}
              {profile && !nextTopicHref && (topicDone || allTasksDone) && (
                <span className="text-[11px] text-[#c9fdd7]">
                  You finished the teaching topic track. Try{" "}
                  <Link href="/exams" className="underline hover:text-white">
                    Exams
                  </Link>{" "}
                  when ready.
                </span>
              )}
            </div>
          </div>
        )}

        {tasks.length > 0 && commands.length > 0 && (
          <div className="mb-4">
            <DragDropAssessmentClient
              variant="lesson"
              title="Drag and drop lesson practice"
              subtitle="Match each step with an acceptable command. One step unlocks at a time."
              options={commands}
              tasks={tasks}
              completedTaskIds={completedTasks}
              currentTaskId={currentTask?.id ?? null}
              feedback={taskFeedback}
              onTaskMatched={handleDragDrop}
            />
          </div>
        )}

        <div className={scenarioPanel}>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
            Commands to recognise
          </span>
          <p className="mt-2 text-[11px] text-gray-500">
            Names and placeholders you&apos;ll see in real clusters—you don&apos;t need to memorize
            every flag on day one.
          </p>
          <ul className="mt-2 space-y-1.5 font-mono text-[11px] text-[#d29922]">
            {topic.commands.map((cmd) => (
              <li key={cmd.id}>{cmd.label}</li>
            ))}
          </ul>
        </div>

        <div className={scenarioPanel}>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
            Try commands (simulated)
          </span>
          <p className="mt-1 text-[11px] text-gray-500">
            Type the commands above in order. Steps must be completed one at a time.
          </p>
          <div className="mt-3 min-h-[220px]">
            <SimulatedTerraformTerminal onCommand={handleTerminalCommand} />
          </div>
        </div>

        <p className="text-[11px] text-gray-500">
          When this topic feels familiar, you can optionally take the matching graded check:{" "}
          <Link
            href={`/assessments/scenarios/${topic.id}`}
            className="text-gray-400 underline hover:text-white"
          >
            exam for this topic
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
