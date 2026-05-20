"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import SimulatedTerraformTerminal from "@/components/SimulatedTerraformTerminal";
import { useLessonAssistantContext } from "@/components/GlobalAssistantShell";
import { terraformLessons } from "@/data/terraformLessons";
import { useUserProgress } from "@/components/UserProgressContext";
import { getNextIncompleteTerraformJourneyHref } from "@/data/terraformScenarios";

const CodeEditorClient = dynamic(() => import("@/components/CodeEditor"), {
  ssr: false,
  loading: () => (
    <div className="h-full min-h-[200px] animate-pulse rounded-lg border border-gray-800 bg-[#0d1117]" />
  ),
});

type AssessmentTask = { id: string; label: string };

function normalizeCommand(cmd: string): string {
  let cleaned = cmd.trim();
  if (cleaned.startsWith("$")) cleaned = cleaned.slice(1).trim();
  return cleaned.toLowerCase().replace(/\s+/g, " ");
}

function commandMatchesTask(taskId: string, normalized: string): boolean {
  if (taskId === "tf-init") return normalized === "terraform init";
  if (taskId === "tf-plan") return normalized === "terraform plan";
  if (taskId === "tf-apply") return normalized === "terraform apply" || normalized === "terraform apply -auto-approve";
  if (taskId === "tf-validate") return normalized === "terraform validate";
  if (taskId === "tf-fmt") return normalized === "terraform fmt";
  return false;
}

function getAssessmentTasksForLesson(lessonId: string): AssessmentTask[] {
  if (lessonId === "intro") {
    return [
      { id: "tf-init", label: "Run terraform init to initialize the workspace." },
      { id: "tf-plan", label: "Run terraform plan to preview changes." },
    ];
  }
  if (lessonId === "first-resource") {
    return [
      { id: "has-resource", label: "Keep a resource block in your HCL (resource \"…\")." },
      { id: "tf-validate", label: "Run terraform validate to check syntax." },
    ];
  }
  if (lessonId === "variables") {
    return [
      { id: "has-variable", label: "Include a variable block in your configuration." },
      { id: "has-output", label: "Include an output block in your configuration." },
      { id: "tf-fmt", label: "Run terraform fmt to format the file." },
    ];
  }
  if (lessonId === "plan-apply") {
    return [
      { id: "tf-plan", label: "Run terraform plan before applying." },
      { id: "tf-apply", label: "Run terraform apply to apply changes (simulated)." },
    ];
  }
  return [];
}

function deriveHclTasks(lessonId: string, code: string): Partial<Record<string, boolean>> {
  const t = code.trim();
  const out: Partial<Record<string, boolean>> = {};
  if (lessonId === "first-resource" && /resource\s+"/.test(t)) out["has-resource"] = true;
  if (lessonId === "variables") {
    if (/variable\s+"/.test(t)) out["has-variable"] = true;
    if (/output\s+"/.test(t)) out["has-output"] = true;
  }
  return out;
}

const panelClass =
  "mb-4 flex flex-col gap-2 rounded-lg border border-[#d29922]/40 bg-[#050810] px-3 py-2 text-xs text-gray-200";

export default function TerraformLessonPage() {
  const params = useParams();
  const lessonId = params?.lessonId as string;
  const lesson = terraformLessons.find((l) => l.id === lessonId);
  const [code, setCode] = useState(lesson?.code ?? "");
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
  const [taskFeedback, setTaskFeedback] = useState<string | null>(null);
  const { setContext } = useLessonAssistantContext();
  const { profile, markCompleted } = useUserProgress();

  useEffect(() => {
    if (!lesson) return;
    setContext(
      [
        "You are helping with a Terraform lesson inside the K8 Learn site.",
        `Lesson title: ${lesson.title}`,
        `Description: ${lesson.description}`,
        "",
        "Instructions:",
        lesson.instructions,
      ].join("\n")
    );
  }, [lesson, setContext]);

  useEffect(() => {
    if (!lesson) return;
    setCode(lesson.code);
    setCompletedTasks({});
    setTaskFeedback(null);
  }, [lesson]);

  const journeyId = lesson ? `terraform:${lesson.id}` : "";
  const isCompleted =
    journeyId && profile ? profile.completed.some((item) => item.id === journeyId) : false;

  const assessmentTasks = lesson ? getAssessmentTasksForLesson(lesson.id) : [];
  const totalTasks = assessmentTasks.length;
  const completedCount = assessmentTasks.filter((t) => completedTasks[t.id]).length;
  const allTasksDone = totalTasks > 0 && completedCount === totalTasks;
  const currentTask = assessmentTasks.find((task) => !completedTasks[task.id]) ?? null;

  const completedJourneyIds = useMemo(
    () => new Set(profile?.completed.map((item) => item.id) ?? []),
    [profile?.completed]
  );
  const nextJourneyHref = lesson
    ? getNextIncompleteTerraformJourneyHref(completedJourneyIds, {
        type: "lesson",
        lessonId: lesson.id,
      })
    : null;

  useEffect(() => {
    if (!lesson || assessmentTasks.length === 0 || !isCompleted) return;
    setCompletedTasks((prev) => {
      const next = { ...prev };
      for (const t of assessmentTasks) next[t.id] = true;
      return next;
    });
  }, [lesson, assessmentTasks, isCompleted]);

  useEffect(() => {
    if (!lesson || assessmentTasks.length === 0) return;
    const hclTasks = deriveHclTasks(lesson.id, code);
    if (Object.keys(hclTasks).length === 0) return;
    setCompletedTasks((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const [id, done] of Object.entries(hclTasks)) {
        if (done && !next[id]) {
          next[id] = true;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [lesson, code, assessmentTasks.length]);

  useEffect(() => {
    if (!lesson || !profile || isCompleted || !allTasksDone) return;
    markCompleted({ id: journeyId, kind: "lesson" });
  }, [allTasksDone, isCompleted, journeyId, markCompleted, profile, lesson]);

  const handleCommand = (cmd: string) => {
    if (!currentTask) return;
    const normalized = normalizeCommand(cmd);
    if (commandMatchesTask(currentTask.id, normalized)) {
      setCompletedTasks((prev) => ({ ...prev, [currentTask.id]: true }));
      setTaskFeedback(`Task complete: ${currentTask.label}`);
      return;
    }
    setTaskFeedback(`Finish the current task first: ${currentTask.label}`);
  };

  if (!lesson) {
    return (
      <main className="min-h-screen bg-[#0d1117] p-6">
        <Link href="/learn/terraform" className="text-[#d29922] hover:underline">
          ← Terraform
        </Link>
        <p className="mt-4 text-gray-400">Lesson not found.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0d1117]">
      <div className="relative mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <Link href="/learn/terraform" className="mb-4 inline-block text-sm text-gray-400 hover:text-white">
          ← Terraform
        </Link>
        <h1 className="mb-1 text-2xl font-bold text-white">{lesson.title}</h1>
        <p className="mb-4 text-sm text-gray-400">{lesson.description}</p>

        {assessmentTasks.length > 0 && (
          <div className={panelClass}>
            <span className="text-[11px] text-gray-400">
              Tasks: {completedCount} / {totalTasks}
              {isCompleted ? " · Lesson complete" : ""}
            </span>
            <ul className="mt-1 space-y-1">
              {assessmentTasks.map((task) => {
                const done = completedTasks[task.id];
                const isCurrent = !done && currentTask?.id === task.id;
                return (
                  <li key={task.id} className="flex gap-2 text-[11px]">
                    <span>{done ? "✅" : isCurrent ? "➡️" : "🔒"}</span>
                    <span className={done || isCurrent ? "text-gray-200" : "text-gray-500"}>
                      {task.label}
                    </span>
                  </li>
                );
              })}
            </ul>
            {taskFeedback && <p className="text-[11px] text-gray-400">{taskFeedback}</p>}
            {(allTasksDone || isCompleted) && nextJourneyHref && (
              <Link
                href={nextJourneyHref}
                className="mt-2 inline-flex rounded bg-[#1f6feb] px-2.5 py-1 text-[11px] font-medium text-white hover:bg-[#388bfd]"
              >
                Next step →
              </Link>
            )}
          </div>
        )}

        <div
          className="prose prose-invert prose-sm mb-6 max-w-none rounded-lg border border-gray-700 bg-[#161b22] p-4 text-gray-300"
          dangerouslySetInnerHTML={{
            __html: lesson.instructions
              .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
              .replace(/`(.*?)`/g, "<code class='text-[#d29922]'>$1</code>")
              .replace(/\n/g, "<br />"),
          }}
        />

        <div className="mb-4 grid gap-4 md:grid-cols-[minmax(0,2fr),minmax(0,1.1fr)]">
          <div className="min-w-0">
            <span className="mb-2 block text-sm text-gray-400">HCL configuration</span>
            <div className="h-[220px]">
              <CodeEditorClient value={code} onChange={setCode} language="hcl" />
            </div>
          </div>
          <div className="min-w-0">
            <SimulatedTerraformTerminal onCommand={handleCommand} />
          </div>
        </div>

        {lesson.hint && <p className="text-sm text-gray-500">💡 {lesson.hint}</p>}
      </div>
    </main>
  );
}
