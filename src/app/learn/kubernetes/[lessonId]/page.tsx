"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import K8ArchitectureViz from "@/components/K8ArchitectureViz";
import DragDropAssessment from "@/components/DragDropAssessment";
import SimulatedK8Terminal from "@/components/SimulatedK8Terminal";
import { useLessonAssistantContext } from "@/components/GlobalAssistantShell";
import { kubernetesLessons } from "@/data/lessons";
import { useUserProgress } from "@/components/UserProgressContext";
import {
  getKubernetesStepHref,
  getNextKubernetesStep,
} from "@/data/kubernetesScenarios";

const CodeEditorClient = dynamic(() => import("@/components/CodeEditor"), {
  ssr: false,
  loading: () => (
    <div className="rounded-lg border border-gray-800 bg-[#0d1117] h-full min-h-[200px] animate-pulse" />
  ),
});

type AssessmentTask = {
  id: string;
  label: string;
};

type AssessmentCommandOption = {
  id: string;
  label: string;
};

function getAssessmentTasksForLesson(lessonId: string): AssessmentTask[] {
  // Only some lessons are treated as interactive assessments for now.
  if (lessonId === "kubectl-get") {
    return [
      {
        id: "pods",
        label: "Use kubectl to see which Pods are running (kubectl get pods).",
      },
      {
        id: "nodes",
        label:
          "Check the nodes in the cluster, like an on-call engineer verifying capacity (kubectl get nodes).",
      },
      {
        id: "deployments",
        label:
          "List Deployments to confirm your app is rolled out correctly (kubectl get deployments).",
      },
    ];
  }

  if (lessonId === "intro") {
    return [
      {
        id: "pods",
        label:
          "Run kubectl get pods to connect the concepts on this page to real workloads.",
      },
      {
        id: "nodes",
        label: "Run kubectl get nodes to see the machines behind the cluster.",
      },
    ];
  }

  return [];
}

function normalizeCommand(cmd: string): string {
  let cleaned = cmd.trim();
  if (cleaned.startsWith("$")) {
    cleaned = cleaned.slice(1).trim();
  }
  return cleaned.toLowerCase().replace(/\s+/g, " ");
}

function commandMatchesTask(taskId: string, normalized: string): boolean {
  if (taskId === "pods") {
    return (
      normalized === "kubectl get pods" || normalized.startsWith("kubectl get pods ")
    );
  }
  if (taskId === "nodes") {
    return (
      normalized === "kubectl get nodes" || normalized.startsWith("kubectl get nodes ")
    );
  }
  if (taskId === "deployments") {
    return (
      normalized === "kubectl get deployments" ||
      normalized === "kubectl get deployment" ||
      normalized.startsWith("kubectl get deployments ") ||
      normalized.startsWith("kubectl get deployment ")
    );
  }
  return false;
}

function getAssessmentCommandOptions(lessonId: string): AssessmentCommandOption[] {
  if (lessonId === "intro") {
    return [
      { id: "pods", label: "kubectl get pods" },
      { id: "nodes", label: "kubectl get nodes" },
    ];
  }
  if (lessonId === "kubectl-get") {
    return [
      { id: "pods", label: "kubectl get pods" },
      { id: "nodes", label: "kubectl get nodes" },
      { id: "deployments", label: "kubectl get deployments" },
    ];
  }
  return [];
}

/** Same shell as interactive practice modules — keeps lesson reading + practice visually consistent. */
const lessonScenarioPanelClass =
  "mb-4 flex flex-col gap-2 rounded-lg border border-[#3fb950]/40 bg-[#050810] px-3 py-2 text-xs text-gray-200";

export default function KubernetesLessonPage() {
  const params = useParams();
  const lessonId = params?.lessonId as string;
  const lesson = kubernetesLessons.find((l) => l.id === lessonId);
  const [code, setCode] = useState(lesson?.code ?? "");
  const [showViz, setShowViz] = useState(false);
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  const [yamlRunHint, setYamlRunHint] = useState<string | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
  const [taskFeedback, setTaskFeedback] = useState<string | null>(null);
  const { setContext } = useLessonAssistantContext();
  const { profile, markCompleted } = useUserProgress();

  useEffect(() => {
    if (!lesson) return;
    setContext(
      [
        "You are helping with a Kubernetes lesson inside the K8 Learn site.",
        `Lesson title: ${lesson.title}`,
        `Description: ${lesson.description}`,
        "",
        "Instructions (markdown-like):",
        lesson.instructions,
      ].join("\n")
    );
  }, [lesson, setContext]);

  const journeyId = lesson ? `kubernetes:${lesson.id}` : "";
  const isCompleted =
    journeyId && profile
      ? profile.completed.some((item) => item.id === journeyId)
      : false;

  const assessmentTasks = lesson ? getAssessmentTasksForLesson(lesson.id) : [];
  const assessmentOptions = lesson ? getAssessmentCommandOptions(lesson.id) : [];
  const totalTasks = assessmentTasks.length;
  const completedCount = assessmentTasks.filter((t) => completedTasks[t.id]).length;
  const allTasksDone = totalTasks > 0 && completedCount === totalTasks;
  const currentTask = assessmentTasks.find((task) => !completedTasks[task.id]) ?? null;
  const isLearningOnlyLesson = assessmentTasks.length === 0;
  const nextStep = lesson
    ? getNextKubernetesStep({ type: "lesson", lessonId: lesson.id })
    : null;

  const completeTask = (taskId: string, label: string) => {
    setCompletedTasks((prev) => ({ ...prev, [taskId]: true }));
    setTaskFeedback(`Task complete: ${label}`);
  };

  // Hydrate interactive task UI when this lesson was already saved as complete (fixes 0/X vs passed).
  useEffect(() => {
    if (!lesson) return;
    const tasks = getAssessmentTasksForLesson(lesson.id);
    if (tasks.length === 0 || !isCompleted) return;
    setCompletedTasks((prev) => {
      const next = { ...prev };
      for (const t of tasks) next[t.id] = true;
      return next;
    });
  }, [lesson?.id, isCompleted]);

  // Lessons page = lesson progress only (counts as a lesson completion, same journey id).
  useEffect(() => {
    if (!lesson) return;
    if (!profile) return;
    if (isCompleted) return;
    if (!allTasksDone) return;

    markCompleted({
      id: journeyId,
      kind: "lesson",
    });
  }, [allTasksDone, isCompleted, journeyId, markCompleted, profile, lesson]);

  const handleKubectlCommand = (cmd: string) => {
    setLastCommand(cmd);
    const normalized = normalizeCommand(cmd);

    if (assessmentTasks.length === 0) return;
    if (!currentTask) return;
    if (commandMatchesTask(currentTask.id, normalized)) {
      completeTask(currentTask.id, currentTask.label);
      return;
    }

    setTaskFeedback(
      `Finish the current task first: ${currentTask.label}`
    );
  };

  const handleDragDropMatch = (taskId: string, optionId: string) => {
    if (!currentTask || currentTask.id !== taskId) {
      setTaskFeedback("Complete the current task first.");
      return;
    }
    if (taskId === optionId) {
      completeTask(taskId, currentTask.label);
      return;
    }
    const selectedOption = assessmentOptions.find((option) => option.id === optionId)?.label;
    setTaskFeedback(
      `Not quite. ${selectedOption ?? "That command"} does not match the current task.`
    );
  };

  if (!lesson) {
    return (
      <main className="min-h-screen bg-[#0d1117] p-6">
        <Link href="/learn/kubernetes" className="text-[#3fb950] hover:underline">
          ← Back to Kubernetes
        </Link>
        <p className="text-gray-400 mt-4">Lesson not found.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0d1117]">
      <div className="relative max-w-5xl mx-auto px-4 py-6 sm:px-6">
        <Link
          href="/learn/kubernetes"
          className="text-gray-400 hover:text-white text-sm mb-4 inline-block"
        >
          ← Kubernetes
        </Link>

        <h1 className="text-2xl font-bold text-white mb-1">{lesson.title}</h1>
        <p className="text-gray-400 text-sm mb-2">{lesson.description}</p>
        {isLearningOnlyLesson && (
          <div className={`${lessonScenarioPanelClass} border-[#58a6ff]/40`}>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-gray-800 px-2 py-0.5 text-[11px] text-gray-300">
                Lesson practice
              </span>
              <span className="text-[11px] text-gray-500">
                Concept-first — no graded command checklist on this page.
              </span>
            </div>
            <p className="text-[11px] text-gray-400">
              <span className="font-semibold text-gray-300">Scenario: </span>
              Work through the lesson content below, try the YAML and terminal when it helps, then mark the lesson complete to continue your journey.
            </p>
            {profile && !isCompleted && (
              <button
                type="button"
                onClick={() => markCompleted({ id: journeyId, kind: "lesson" })}
                className="mt-2 rounded bg-[#1f6feb] px-2.5 py-1 text-[11px] font-medium text-white hover:bg-[#388bfd]"
              >
                Mark lesson complete
              </button>
            )}
            {!profile && (
              <p className="mt-2 text-[11px] text-gray-500">
                Sign in with a local profile to save completion and points.
              </p>
            )}
            {isCompleted && (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-full bg-[#1f6f3f] px-2 py-0.5 text-[11px] text-[#c9fdd7]">
                  Lesson completed
                </span>
                {nextStep && (
                  <Link
                    href={getKubernetesStepHref(nextStep)}
                    className="inline-flex rounded bg-[#1f6feb] px-2.5 py-1 text-[11px] font-medium text-white hover:bg-[#388bfd]"
                  >
                    Next step →
                  </Link>
                )}
              </div>
            )}
          </div>
        )}
        {lesson.id === "pod-yaml" && (
          <div className={lessonScenarioPanelClass}>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-gray-800 px-2 py-0.5 text-[11px] text-gray-300">
                Related exam
              </span>
            </div>
            <p className="text-[11px] text-gray-400">
              <span className="font-semibold text-gray-300">Scenario: </span>
              This page is for learning how Pod YAML works. When you want a graded check, open the{" "}
              <Link href="/assessments/pod-yaml" className="text-[#3fb950] hover:underline font-medium">
                Pod YAML deployment check
              </Link>{" "}
              under Exams.
            </p>
          </div>
        )}
        {assessmentTasks.length > 0 && (
          <div className={lessonScenarioPanelClass}>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] ${
                  isCompleted
                    ? "bg-[#1f6f3f] text-[#c9fdd7]"
                    : allTasksDone
                      ? "bg-[#1f6f3f]/80 text-[#e5ffef]"
                      : "bg-gray-800 text-gray-300"
                }`}
              >
                {isCompleted
                  ? "Lesson practice complete"
                  : allTasksDone
                    ? "All tasks complete — saving…"
                    : "Lesson practice in progress"}
              </span>
              <span className="text-[11px] text-gray-400">
                Tasks completed: {completedCount} / {totalTasks}
              </span>
            </div>
            <p className="text-[11px] text-gray-400">
              <span className="font-semibold text-gray-300">Scenario: </span>
              You are practicing on a simulated cluster as part of this lesson. Use{" "}
              <code className="text-[#3fb950]">kubectl</code> in the terminal (or drag-and-drop below)
              to complete each step in order. This lesson is marked complete once every task below is done.
            </p>
            <ul className="mt-1 space-y-1">
              {assessmentTasks.map((task) => {
                const done = completedTasks[task.id];
                const isCurrent = !done && currentTask?.id === task.id;
                return (
                  <li key={task.id} className="flex items-start gap-2">
                    <span className="mt-[2px] text-[11px]">
                      {done ? "✅" : isCurrent ? "➡️" : "🔒"}
                    </span>
                    <span
                      className={`text-[11px] ${
                        done
                          ? "text-gray-200"
                          : isCurrent
                            ? "text-[#e5ffef]"
                            : "text-gray-500"
                      }`}
                    >
                      {task.label}
                    </span>
                  </li>
                );
              })}
            </ul>
            <div className="flex flex-wrap items-center gap-2">
              {taskFeedback && <p className="text-[11px] text-gray-400">{taskFeedback}</p>}
              {(allTasksDone || isCompleted) && nextStep && (
                <Link
                  href={getKubernetesStepHref(nextStep)}
                  className="inline-flex rounded bg-[#1f6feb] px-2.5 py-1 text-[11px] font-medium text-white hover:bg-[#388bfd]"
                >
                  Next step →
                </Link>
              )}
            </div>
          </div>
        )}

        {assessmentTasks.length > 0 && assessmentOptions.length > 0 && (
          <div className="mb-4">
            <DragDropAssessment
              variant="lesson"
              title="Drag and drop lesson practice"
              subtitle="Match each lesson task with the right kubectl command. Tasks unlock one at a time."
              options={assessmentOptions}
              tasks={assessmentTasks}
              completedTaskIds={completedTasks}
              currentTaskId={currentTask?.id ?? null}
              feedback={taskFeedback}
              onTaskMatched={handleDragDropMatch}
            />
          </div>
        )}

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowViz(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-[#3fb950]/40 bg-[#161b22] px-3 py-1.5 text-xs font-medium text-[#3fb950] hover:border-[#3fb950]/70 hover:bg-[#1b242f]"
          >
            <span>🗺️</span>
            <span>Visualize cluster (pods &amp; nodes)</span>
          </button>
          <span className="text-xs text-gray-500">
            Quick mental model of nodes, pods, deployments, and services.
          </span>
        </div>

        <div className={`${lessonScenarioPanelClass} mb-6`}>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-gray-800 px-2 py-0.5 text-[11px] text-gray-300">
              Lesson content
            </span>
            <span className="text-[11px] text-gray-500">
              Read this scenario, then use the YAML editor and terminal below.
            </span>
          </div>
          <p className="text-[11px] text-gray-400">
            <span className="font-semibold text-gray-300">Scenario: </span>
            {assessmentTasks.length > 0
              ? "Study the concepts and commands in this lesson. They align with the interactive practice tasks above and the simulator below."
              : "Study the concepts and commands in this lesson. Use the YAML editor and simulated terminal below to reinforce what you read."}
          </p>
          <div
            className="lesson-instructions prose prose-invert prose-sm max-w-none mt-2 border-t border-gray-800 pt-3 text-gray-300"
            dangerouslySetInnerHTML={{
              __html: lesson.instructions
                .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                .replace(/`(.*?)`/g, "<code class='text-[#3fb950]'>$1</code>")
                .replace(/\n/g, "<br />"),
            }}
          />
        </div>

        <div className="grid gap-4 mb-4 md:grid-cols-[minmax(0,2fr),minmax(0,1.1fr)]">
          <div className="min-w-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Reference / YAML</span>
              <button
                type="button"
                onClick={() =>
                  setYamlRunHint(
                    "In a real cluster you would save this YAML to a file (for example pod.yaml) and run: kubectl apply -f pod.yaml, then check it with kubectl get pods."
                  )
                }
                className="px-3 py-1.5 rounded bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-medium"
              >
                Run
              </button>
            </div>
            <div className="h-[220px]">
              <CodeEditorClient
                value={code}
                onChange={setCode}
                language="yaml"
                readOnly={false}
              />
            </div>
            {yamlRunHint && (
              <p className="mt-2 text-xs text-gray-500">{yamlRunHint}</p>
            )}
          </div>

          <div className="space-y-3 min-w-0">
            <div>
              <SimulatedK8Terminal onCommand={(cmd: string) => handleKubectlCommand(cmd)} />
            </div>
          </div>
        </div>

        {lesson.hint && (
          <p className="text-gray-500 text-sm">💡 {lesson.hint}</p>
        )}
      </div>

      {showViz && (
        <K8ArchitectureViz
          onClose={() => setShowViz(false)}
          lastCommand={lastCommand ?? undefined}
        />
      )}
    </main>
  );
}
