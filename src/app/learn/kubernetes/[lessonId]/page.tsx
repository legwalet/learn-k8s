"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import K8ArchitectureViz from "@/components/K8ArchitectureViz";
import DragDropAssessment from "@/components/DragDropAssessment";
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

const SimulatedK8TerminalClient = dynamic(
  () => import("@/components/SimulatedK8Terminal"),
  {
    ssr: false,
  }
);

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

  // Automatically mark this assessment complete when all interactive tasks are done.
  useEffect(() => {
    if (!lesson) return;
    if (!profile) return;
    if (isCompleted) return;
    if (!allTasksDone) return;

    markCompleted({
      id: journeyId,
      kind: "assessment",
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
      <div className="relative max-w-5xl mx-auto px-6 py-6">
        <Link
          href="/learn/kubernetes"
          className="text-gray-400 hover:text-white text-sm mb-4 inline-block"
        >
          ← Kubernetes
        </Link>

        <h1 className="text-2xl font-bold text-white mb-1">{lesson.title}</h1>
        <p className="text-gray-400 text-sm mb-2">{lesson.description}</p>
        {isLearningOnlyLesson && (
          <div className="mb-4 rounded-lg border border-[#58a6ff]/30 bg-[#050810] px-3 py-2 text-xs text-gray-300">
            <p>
              This lesson is concept-first. Mark it complete when you finish reading/practicing to
              unlock the next checkpoint.
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
          <div className="mb-4 rounded-lg border border-[#3fb950]/40 bg-[#050810] px-3 py-2 text-xs text-gray-200">
            <p className="text-[11px] text-gray-300">
              This page is for **learning** how Pod YAML works. When you&apos;re ready to be tested,
              use the separate{" "}
              <Link
                href="/assessments/pod-yaml"
                className="text-[#3fb950] hover:underline font-medium"
              >
                Pod YAML deployment assessment
              </Link>{" "}
              to complete the real-life scenario and earn points.
            </p>
          </div>
        )}
        {assessmentTasks.length > 0 && (
          <div className="mb-4 flex flex-col gap-2 rounded-lg border border-[#3fb950]/40 bg-[#050810] px-3 py-2 text-xs text-gray-200">
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
                  ? "Assessment passed"
                  : allTasksDone
                    ? "All tasks complete — saving…"
                    : "Assessment in progress"}
              </span>
              <span className="text-[11px] text-gray-400">
                Tasks completed: {completedCount} / {totalTasks}
              </span>
            </div>
            <p className="text-[11px] text-gray-400">
              Scenario: you are on call for a real cluster. Use{" "}
              <code className="text-[#3fb950]">kubectl</code> in the terminal to
              investigate what&apos;s running, just like you would in production.
              The assessment is only passed once all tasks below are completed.
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
              title="Drag and drop assessment"
              subtitle="Match each task with the correct kubectl command. Tasks unlock one-by-one."
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

        <div
          className="prose prose-invert prose-sm max-w-none mb-6 p-4 rounded-lg bg-[#161b22] border border-gray-700 text-gray-300"
          dangerouslySetInnerHTML={{
            __html: lesson.instructions
              .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
              .replace(/`(.*?)`/g, "<code class='text-[#3fb950]'>$1</code>"),
          }}
        />

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
              <SimulatedK8TerminalClient onCommand={(cmd: string) => handleKubectlCommand(cmd)} />
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
