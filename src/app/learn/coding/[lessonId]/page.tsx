"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { codingLessons } from "@/data/lessons";
import { getCurrentTask } from "@/lib/sequentialTasks";
import QuestProgressPanel from "@/components/QuestProgressPanel";
import { useLessonAssistantContext } from "@/components/GlobalAssistantShell";
import { useUserProgress } from "@/components/UserProgressContext";

const CodeEditorClient = dynamic(() => import("@/components/CodeEditor"), {
  ssr: false,
  loading: () => (
    <div className="rounded-lg border border-gray-800 bg-[#0d1117] h-full min-h-[200px] animate-pulse" />
  ),
});

const WebContainerTerminalClient = dynamic(
  () => import("@/components/WebContainerTerminal"),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-lg border border-gray-800 bg-[#0d1117] h-[240px] flex items-center justify-center text-xs text-gray-500">
        Booting interactive terminal…
      </div>
    ),
  }
);

type CodingAssessmentTask = {
  id: string;
  label: string;
};

function getCodingAssessmentTasks(lessonId: string): CodingAssessmentTask[] {
  if (lessonId === "hello") {
    return [
      {
        id: "run-once",
        label:
          "Run the program at least once from the editor, like shipping your very first script.",
      },
      {
        id: "prints-hello-world",
        label:
          'Make sure your code actually prints "Hello, World!" to the console.',
      },
    ];
  }

  if (lessonId === "variables") {
    return [
      {
        id: "uses-variables",
        label:
          "Declare variables for a name and a count (for example, a username and number of pods).",
      },
      {
        id: "logs-variables",
        label:
          "Log both variables so the output clearly shows the name and the count.",
      },
    ];
  }

  if (lessonId === "functions") {
    return [
      {
        id: "defines-greet",
        label:
          "Define a function greet(name) that returns a greeting string for that name.",
      },
      {
        id: "calls-greet",
        label:
          "Call greet at least twice with different names, like real users of your app.",
      },
    ];
  }

  return [];
}

function updateTaskStatusForLesson(
  lessonId: string,
  code: string,
  hasJustRun: boolean,
  prev: Record<string, boolean>
): Record<string, boolean> {
  const next = { ...prev };
  const trimmed = code.trim();

  if (lessonId === "hello") {
    if (hasJustRun) {
      next["run-once"] = true;
      if (/hello,\s*world!?/i.test(trimmed) || /"Hello, World!?"/.test(trimmed)) {
        next["prints-hello-world"] = true;
      }
    }
  }

  if (lessonId === "variables") {
    if (/\b(const|let)\s+name\b/.test(trimmed) && /\b(const|let)\s+count\b/.test(trimmed)) {
      next["uses-variables"] = true;
    }
    if (
      /console\.log\([^)]*name[^)]*\)/.test(trimmed) &&
      /console\.log\([^)]*count[^)]*\)/.test(trimmed)
    ) {
      next["logs-variables"] = true;
    }
  }

  if (lessonId === "functions") {
    if (/function\s+greet\s*\(\s*name\s*\)/.test(trimmed)) {
      next["defines-greet"] = true;
    }
    const greetCalls = trimmed.match(/greet\([^)]*\)/g) ?? [];
    if (greetCalls.length >= 2) {
      next["calls-greet"] = true;
    }
  }

  return next;
}

function evaluateSingleTask(
  taskId: string,
  lessonId: string,
  code: string,
  hasJustRun: boolean
): boolean {
  const status = updateTaskStatusForLesson(lessonId, code, hasJustRun, {});
  return !!status[taskId];
}

export default function CodingLessonPage() {
  const params = useParams();
  const lessonId = params?.lessonId as string;
  const lesson = codingLessons.find((l) => l.id === lessonId);
  const [code, setCode] = useState(lesson?.code ?? "");
  const runFromEditorRef = useRef<((code: string) => void) | null>(null);
  const { setContext } = useLessonAssistantContext();
  const { profile, markCompleted } = useUserProgress();
  const [taskStatus, setTaskStatus] = useState<Record<string, boolean>>({});
  const [assessmentMessage, setAssessmentMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!lesson) return;
    setContext(
      [
        "You are helping with a JavaScript / Node.js coding lesson inside the K8 Learn site.",
        `Lesson title: ${lesson.title}`,
        `Description: ${lesson.description}`,
        "",
        "Instructions (markdown-like):",
        lesson.instructions,
      ].join("\n")
    );
  }, [lesson, setContext]);

  useEffect(() => {
    if (!lesson) return;
    setCode(lesson.code);
    setTaskStatus({});
    setAssessmentMessage(null);
  }, [lesson]);

  const journeyId = lesson ? `coding:${lesson.id}` : "";
  const isCompleted =
    journeyId && profile
      ? profile.completed.some((item) => item.id === journeyId)
      : false;

  const assessmentTasks = useMemo(
    () => (lesson ? getCodingAssessmentTasks(lesson.id) : []),
    [lesson]
  );
  const totalTasks = assessmentTasks.length;
  const completedCount = assessmentTasks.filter((t) => taskStatus[t.id]).length;
  const allTasksDone = totalTasks > 0 && completedCount === totalTasks;
  const currentTask = getCurrentTask(assessmentTasks, taskStatus);

  useEffect(() => {
    if (!lesson || assessmentTasks.length === 0 || !isCompleted) return;
    setTaskStatus((prev) => {
      const next = { ...prev };
      for (const t of assessmentTasks) next[t.id] = true;
      return next;
    });
  }, [lesson, assessmentTasks, isCompleted]);

  const handleRun = useCallback(() => {
    runFromEditorRef.current?.(code);
    if (!lesson) return;
    if (assessmentTasks.length === 0) {
      setAssessmentMessage(null);
      return;
    }

    if (!currentTask) {
      setAssessmentMessage("All tasks passed for this coding assessment. Great job!");
      return;
    }

    const passedCurrentTask = evaluateSingleTask(currentTask.id, lesson.id, code, true);
    if (!passedCurrentTask) {
      setAssessmentMessage(`Finish the current task first: ${currentTask.label}`);
      return;
    }

    setTaskStatus((prev) => ({ ...prev, [currentTask.id]: true }));
    const nextCompletedCount = completedCount + 1;
    if (nextCompletedCount === assessmentTasks.length) {
      setAssessmentMessage("All tasks passed for this coding assessment. Great job!");
    } else {
      setAssessmentMessage(
        `Task complete. Move to the next requirement (${nextCompletedCount}/${assessmentTasks.length}).`
      );
    }
  }, [assessmentTasks.length, code, completedCount, currentTask, lesson]);

  // Automatically mark this coding lesson as a passed assignment/test when all tasks are done.
  useEffect(() => {
    if (!lesson) return;
    if (!profile) return;
    if (isCompleted) return;
    if (!allTasksDone) return;

    markCompleted({
      id: journeyId,
      kind: "test",
    });
  }, [allTasksDone, isCompleted, journeyId, lesson, markCompleted, profile]);

  if (!lesson) {
    return (
      <main className="min-h-screen bg-[#0d1117] p-6">
        <Link href="/learn/coding" className="text-[#58a6ff] hover:underline">
          ← Back to Coding
        </Link>
        <p className="text-gray-400 mt-4">Lesson not found.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0d1117]">
      <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6">
        <Link
          href="/learn/coding"
          className="text-gray-400 hover:text-white text-sm mb-4 inline-block"
        >
          ← Coding
        </Link>
        <div className="mb-4 p-3 rounded-lg border border-[#3fb950]/40 bg-[#161b22]/80 text-gray-300 text-sm">
          <strong className="text-[#3fb950]">This is the JavaScript track.</strong> For Kubernetes (kubectl, Pods, YAML):{" "}
          <Link href="/" className="text-[#58a6ff] hover:underline">Home → Kubernetes lessons</Link>
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">{lesson.title}</h1>
        <p className="text-gray-400 text-sm mb-2">{lesson.description}</p>
        <QuestProgressPanel
          theme="coding"
          title="Code challenge"
          tasks={assessmentTasks}
          completedTasks={taskStatus}
          currentTaskId={currentTask?.id ?? null}
          isCompleted={isCompleted}
          xpReward={25}
          feedback={assessmentMessage}
          intro={
            <>
              <span className="font-semibold text-gray-300">Scenario: </span>
              Imagine you&apos;re adding a small feature to a real app. Use the editor and terminal
              to satisfy each requirement below, then run your code from the editor.
            </>
          }
        />

        <div
          className="prose prose-invert prose-sm max-w-none mb-6 p-4 rounded-lg bg-[#161b22] border border-gray-700 text-gray-300"
          dangerouslySetInnerHTML={{
            __html: lesson.instructions.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/`(.*?)`/g, "<code class='text-[#58a6ff]'>$1</code>"),
          }}
        />

        <div className="grid gap-4 mb-4 md:grid-cols-[minmax(0,2fr),minmax(0,1.1fr)]">
          <div className="min-w-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Editor</span>
              <button
                type="button"
                onClick={handleRun}
                className="px-3 py-1.5 rounded bg-[#238636] hover:bg-[#2ea043] text-white text-sm font-medium"
              >
                Run
              </button>
            </div>
            <div className="h-[220px]">
              <CodeEditorClient
                value={code}
                onChange={setCode}
                language="javascript"
              />
            </div>
          </div>

          <div className="space-y-3 min-w-0">
            <div>
              <WebContainerTerminalClient
                key={lesson.id}
                initialCode={code}
                onRunFromEditor={(run) => {
                  runFromEditorRef.current = run;
                }}
              />
            </div>
          </div>
        </div>

        {lesson.hint && (
          <p className="text-gray-500 text-sm">
            💡 {lesson.hint}
          </p>
        )}
      </div>
    </main>
  );
}
