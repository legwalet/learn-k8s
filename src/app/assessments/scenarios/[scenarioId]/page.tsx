"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import DragDropAssessment from "@/components/DragDropAssessment";
import { useUserProgress } from "@/components/UserProgressContext";
import {
  getKubernetesStepHref,
  getNextKubernetesStep,
  kubernetesScenarios,
} from "@/data/kubernetesScenarios";

export default function ScenarioAssessmentPage() {
  const params = useParams();
  const scenarioId = params?.scenarioId as string;
  const scenario = kubernetesScenarios.find((item) => item.id === scenarioId);
  const { profile, markCompleted } = useUserProgress();
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
  const [feedback, setFeedback] = useState<string | null>(null);

  const currentTask = useMemo(
    () => scenario?.tasks.find((task) => !completedTasks[task.id]) ?? null,
    [scenario, completedTasks]
  );
  const totalTasks = scenario?.tasks.length ?? 0;
  const completedCount = scenario?.tasks.filter((task) => completedTasks[task.id]).length ?? 0;
  const allDone = totalTasks > 0 && completedCount === totalTasks;
  const journeyId = scenario ? `scenario:${scenario.id}` : "";
  const alreadyCompleted =
    journeyId && profile ? profile.completed.some((item) => item.id === journeyId) : false;
  const nextStep = scenario
    ? getNextKubernetesStep({ type: "scenario", scenarioId: scenario.id })
    : null;

  useEffect(() => {
    if (!scenario || !profile || !allDone || alreadyCompleted) return;
    markCompleted({ id: journeyId, kind: "assessment" });
  }, [allDone, alreadyCompleted, journeyId, markCompleted, profile, scenario]);

  if (!scenario) {
    return (
      <main className="min-h-screen bg-[#0d1117] p-6">
        <Link href="/assessments" className="text-[#3fb950] hover:underline">
          ← Back to assessments
        </Link>
        <p className="mt-4 text-gray-400">Scenario not found.</p>
      </main>
    );
  }

  const handleTaskMatched = (taskId: string, optionId: string) => {
    if (!currentTask || currentTask.id !== taskId) {
      setFeedback("Complete the current unlocked task first.");
      return;
    }
    if (currentTask.acceptedCommandIds.includes(optionId)) {
      setCompletedTasks((prev) => ({ ...prev, [taskId]: true }));
      setFeedback(`Nice work. Completed: ${currentTask.label}`);
      return;
    }
    const selected = scenario.commands.find((cmd) => cmd.id === optionId)?.label ?? "That command";
    setFeedback(`${selected} does not solve this task. Try again.`);
  };

  return (
    <main className="min-h-screen bg-[#0d1117]">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <Link href="/learn/kubernetes" className="text-gray-400 hover:text-white text-sm mb-5 inline-block">
          ← Kubernetes track
        </Link>
        <h1 className="text-2xl font-bold text-white">{scenario.title}</h1>
        <p className="mt-1 text-sm text-gray-400">{scenario.description}</p>
        <span className="mt-2 inline-flex rounded-full border border-gray-700 bg-[#11161d] px-2 py-0.5 text-[11px] text-gray-300">
          Difficulty: {scenario.difficulty}
        </span>
        <p className="mt-3 rounded-lg border border-[#3fb950]/30 bg-[#050810] px-3 py-2 text-xs text-gray-300">
          {scenario.context}
        </p>

        <div className="mt-4 rounded-lg border border-[#3fb950]/40 bg-[#050810] px-3 py-2 text-xs text-gray-200">
          <span className="rounded-full bg-gray-800 px-2 py-0.5 text-[11px] text-gray-300">
            Progress: {completedCount} / {totalTasks}
          </span>
          {allDone && (
            <span className="ml-2 rounded-full bg-[#1f6f3f] px-2 py-0.5 text-[11px] text-[#c9fdd7]">
              Scenario complete
            </span>
          )}
          {allDone && nextStep && (
            <Link
              href={getKubernetesStepHref(nextStep)}
              className="ml-2 inline-flex rounded bg-[#1f6feb] px-2.5 py-1 text-[11px] font-medium text-white hover:bg-[#388bfd]"
            >
              Next step →
            </Link>
          )}
        </div>

        <div className="mt-4">
          <DragDropAssessment
            title="Interactive checkpoint"
            subtitle="Drag the right command to the current task. Complete tasks in sequence."
            options={scenario.commands}
            tasks={scenario.tasks.map((task) => ({ id: task.id, label: task.label }))}
            completedTaskIds={completedTasks}
            currentTaskId={currentTask?.id ?? null}
            feedback={feedback}
            onTaskMatched={handleTaskMatched}
          />
        </div>

        <p className="mt-4 text-xs text-gray-500">
          Tip: these checkpoints mimic real on-call decision making. Pick read-only commands first,
          then recovery commands.
        </p>
        {allDone && !nextStep && (
          <p className="mt-2 text-xs text-[#c9fdd7]">
            Journey checkpoint complete. You&apos;ve reached the final step in this Kubernetes flow.
          </p>
        )}
      </div>
    </main>
  );
}

