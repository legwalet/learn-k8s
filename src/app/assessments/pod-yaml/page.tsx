"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { kubernetesLessons } from "@/data/lessons";
import { useUserProgress } from "@/components/UserProgressContext";
import { useLessonAssistantContext } from "@/components/GlobalAssistantShell";

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

type PodYamlTaskId = "label-tier-frontend" | "image-updated" | "apply-pod" | "get-pods";

type Task = {
  id: PodYamlTaskId;
  label: string;
  kind: "yaml" | "terminal";
};

const TASKS: Task[] = [
  {
    id: "label-tier-frontend",
    label:
      "Update the YAML so the pod has a metadata label tier: frontend (like tagging this pod for a frontend app).",
    kind: "yaml",
  },
  {
    id: "image-updated",
    label:
      "Update the container image to nginx:1.27-alpine so you're using a specific, modern version instead of the default tag.",
    kind: "yaml",
  },
  {
    id: "apply-pod",
    label:
      "In the terminal, simulate deploying this manifest with kubectl apply -f pod.yaml.",
    kind: "terminal",
  },
  {
    id: "get-pods",
    label:
      "In the terminal, confirm that the pod is running by using kubectl get pods.",
    kind: "terminal",
  },
];

function deriveYamlTasks(
  yaml: string,
  prev: Record<PodYamlTaskId, boolean>
): Record<PodYamlTaskId, boolean> {
  const next: Record<PodYamlTaskId, boolean> = { ...prev };
  const trimmed = yaml.trim();

  if (/tier:\s*frontend/.test(trimmed)) {
    next["label-tier-frontend"] = true;
  }

  if (/image:\s*nginx:1\.27-alpine/.test(trimmed)) {
    next["image-updated"] = true;
  }

  return next;
}

function normalize(cmd: string): string {
  let cleaned = cmd.trim();
  if (cleaned.startsWith("$")) {
    cleaned = cleaned.slice(1).trim();
  }
  return cleaned.toLowerCase().replace(/\s+/g, " ");
}

export default function PodYamlAssessmentPage() {
  const lesson = kubernetesLessons.find((l) => l.id === "pod-yaml");
  const [yaml, setYaml] = useState(lesson?.code ?? "");
  const [taskStatus, setTaskStatus] = useState<Record<PodYamlTaskId, boolean>>({
    "label-tier-frontend": false,
    "image-updated": false,
    "apply-pod": false,
    "get-pods": false,
  });
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  const { profile, markCompleted } = useUserProgress();
  const { setContext } = useLessonAssistantContext();

  useEffect(() => {
    if (!lesson) return;
    setContext(
      [
        "You are helping with a Kubernetes Pod YAML assessment inside the K8 Learn site.",
        `Base lesson title: ${lesson.title}`,
        `Description: ${lesson.description}`,
        "",
        "This page is an assessment, not the main learning page.",
        "The learner must:",
        "- Update the Pod YAML with a tier: frontend label and a specific nginx:1.27-alpine image.",
        "- Use kubectl apply -f pod.yaml and kubectl get pods in the simulated terminal.",
        "Only when all tasks are done should the assessment be considered passed.",
      ].join("\n")
    );
  }, [lesson, setContext]);

  useEffect(() => {
    setTaskStatus((prev) => deriveYamlTasks(yaml, prev));
  }, [yaml]);
  const journeyId = "kubernetes:pod-yaml";
  const isCompleted =
    profile?.completed.some((item) => item.id === journeyId) ?? false;

  const totalTasks = TASKS.length;
  const completedCount = TASKS.filter((t) => taskStatus[t.id]).length;
  const allTasksDone = completedCount === totalTasks;

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

  const handleCommand = (cmd: string) => {
    setLastCommand(cmd);
    const normalized = normalize(cmd);

    setTaskStatus((prev) => {
      const next: Record<PodYamlTaskId, boolean> = { ...prev };

      if (
        normalized === "kubectl apply -f pod.yaml" ||
        normalized.startsWith("kubectl apply -f pod.yaml ")
      ) {
        next["apply-pod"] = true;
      }

      if (
        normalized === "kubectl get pods" ||
        normalized.startsWith("kubectl get pods ")
      ) {
        next["get-pods"] = true;
      }

      return next;
    });
  };

  if (!lesson) {
    return (
      <main className="min-h-screen bg-[#0d1117] p-6">
        <Link href="/assessments" className="text-[#3fb950] hover:underline">
          ← Back to assessments
        </Link>
        <p className="text-gray-400 mt-4">Pod YAML assessment not available.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0d1117]">
      <div className="max-w-5xl mx-auto px-6 py-6">
        <Link
          href="/assessments"
          className="text-gray-400 hover:text-white text-sm mb-4 inline-block"
        >
          ← Assessments & tests
        </Link>

        <h1 className="text-2xl font-bold text-white mb-1">
          Pod YAML deployment assessment
        </h1>
        <p className="text-gray-400 text-sm mb-2">
          Real-life scenario: you&apos;re preparing a Pod manifest for a frontend app, and you need
          to tag it correctly and deploy it safely to a cluster.
        </p>

        <p className="text-[12px] text-gray-500 mb-4">
          Use the separate{" "}
          <Link
            href="/learn/kubernetes/pod-yaml"
            className="text-[#3fb950] hover:underline"
          >
            Pod YAML learning page
          </Link>{" "}
          to review the concept. This page only checks whether you can update the YAML and use{" "}
          <code className="text-[#3fb950]">kubectl</code> commands to deploy and verify it.
        </p>

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
          {!profile && (
            <p className="text-[11px] text-yellow-400">
              Create a learning profile on the home page to save your result and earn points and
              badges. You can still practice without it.
            </p>
          )}
          <ul className="mt-1 space-y-1">
            {TASKS.map((task) => (
              <li key={task.id} className="flex items-start gap-2">
                <span className="mt-[2px] text-[11px]">
                  {taskStatus[task.id] ? "✅" : "⬜"}
                </span>
                <span className="text-[11px] text-gray-200">{task.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid gap-4 mb-4 md:grid-cols-[minmax(0,2fr),minmax(0,1.1fr)]">
          <div className="min-w-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Pod YAML (assessment copy)</span>
            </div>
            <div className="h-[260px]">
              <CodeEditorClient
                value={yaml}
                onChange={setYaml}
                language="yaml"
                readOnly={false}
              />
            </div>
            <p className="mt-2 text-[11px] text-gray-500">
              Edit this YAML to satisfy the tasks above. In a real cluster you would save it as{" "}
              <code className="text-[#3fb950]">pod.yaml</code> and run{" "}
              <code className="text-[#3fb950]">kubectl apply -f pod.yaml</code>, then check it with{" "}
              <code className="text-[#3fb950]">kubectl get pods</code>.
            </p>
          </div>

          <div className="space-y-3 min-w-0">
            <div>
              <SimulatedK8TerminalClient onCommand={handleCommand} />
            </div>
            {lastCommand && (
              <p className="text-[11px] text-gray-500">
                Last command you ran:{" "}
                <span className="inline-flex items-center rounded-full border border-gray-700 bg-[#161b22] px-2 py-0.5 font-mono text-[11px] text-[#3fb950]">
                  {lastCommand}
                </span>
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

