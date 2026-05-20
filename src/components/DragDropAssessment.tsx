"use client";

import { useCallback, useEffect, useState } from "react";

type DragDropOption = {
  id: string;
  label: string;
};

type DragDropTask = {
  id: string;
  label: string;
};

type DragDropAssessmentProps = {
  title: string;
  subtitle?: string;
  /** `lesson` = copy for /learn/kubernetes pages; `exam` = exam pages */
  variant?: "lesson" | "exam";
  options: DragDropOption[];
  tasks: DragDropTask[];
  completedTaskIds: Record<string, boolean>;
  currentTaskId: string | null;
  feedback?: string | null;
  onTaskMatched: (taskId: string, optionId: string) => void;
};

/** Touch-first devices: HTML5 drag on buttons breaks tap/click (especially iOS Safari). */
function useTouchPrimary() {
  const [touchPrimary, setTouchPrimary] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: none), (pointer: coarse)");
    const update = () => setTouchPrimary(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return touchPrimary;
}

export default function DragDropAssessment({
  title,
  subtitle,
  variant = "exam",
  options,
  tasks,
  completedTaskIds,
  currentTaskId,
  feedback,
  onTaskMatched,
}: DragDropAssessmentProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const touchPrimary = useTouchPrimary();
  const dragEnabled = !touchPrimary;

  const selectedOption = options.find((o) => o.id === selectedOptionId);

  const handleOptionActivate = useCallback((optionId: string) => {
    setSelectedOptionId((prev) => (prev === optionId ? null : optionId));
  }, []);

  const handleTaskActivate = useCallback(
    (taskId: string, isCurrent: boolean) => {
      if (!isCurrent || !selectedOptionId) return;
      onTaskMatched(taskId, selectedOptionId);
      setSelectedOptionId(null);
    },
    [onTaskMatched, selectedOptionId]
  );

  const currentDropHint =
    variant === "lesson"
      ? "Tap to match this lesson step."
      : "Tap to match this task.";

  const lockedHint =
    variant === "lesson"
      ? "Complete the current lesson step first."
      : "Locked until the current task is complete.";

  return (
    <div className="rounded-lg border border-[#3fb950]/30 bg-[#050810] p-3 touch-manipulation">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">{title}</p>
      {subtitle && <p className="mt-1 text-[11px] text-gray-500">{subtitle}</p>}
      <p className="mt-1 text-[10px] text-gray-500">
        {touchPrimary
          ? "Tap a command to select it, then tap the highlighted step below."
          : "Drag a command onto the current step, or tap to select then tap the step."}
      </p>

      {touchPrimary && selectedOption && (
        <p
          className="mt-2 rounded-md border border-[#58a6ff]/50 bg-[#0f1726] px-2.5 py-2 text-[11px] text-[#c9d1d9]"
          role="status"
          aria-live="polite"
        >
          Selected:{" "}
          <span className="font-mono text-[#58a6ff]">{selectedOption.label}</span>
          {" — "}
          tap the step marked with ➡️ below. Tap the command again to change your pick.
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-2" role="list" aria-label="Commands">
        {options.map((option) => {
          const isSelected = selectedOptionId === option.id;
          return (
            <button
              key={option.id}
              type="button"
              role="listitem"
              draggable={dragEnabled}
              aria-pressed={isSelected}
              onClick={() => handleOptionActivate(option.id)}
              onDragStart={(event) => {
                if (!dragEnabled) {
                  event.preventDefault();
                  return;
                }
                event.dataTransfer.setData("assessment-option-id", option.id);
                event.dataTransfer.effectAllowed = "move";
              }}
              className={`inline-flex min-h-[44px] w-full sm:w-auto max-w-full items-center justify-start gap-2 rounded-full border px-3 py-2.5 text-[11px] font-mono select-none active:scale-[0.98] ${
                isSelected
                  ? "border-[#58a6ff] bg-[#0f1726] text-white ring-2 ring-[#58a6ff]/40"
                  : "border-gray-700 bg-[#0d1117] text-gray-300 hover:border-gray-500 active:bg-[#161b22]"
              }`}
            >
              <span className="shrink-0 text-[10px]" aria-hidden>
                {touchPrimary ? (isSelected ? "✓" : "○") : "⇄"}
              </span>
              <span className="break-all text-left">{option.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 space-y-2" role="list" aria-label="Steps">
        {tasks.map((task) => {
          const done = !!completedTaskIds[task.id];
          const isCurrent = !done && currentTaskId === task.id;
          const canAcceptTap = isCurrent && !!selectedOptionId;
          const showDropTarget = isCurrent && (selectedOptionId || dragEnabled);

          return (
            <div
              key={task.id}
              role="listitem"
              tabIndex={canAcceptTap ? 0 : undefined}
              aria-disabled={!isCurrent}
              aria-label={
                done
                  ? `Completed: ${task.label}`
                  : isCurrent
                    ? `Current step: ${task.label}`
                    : `Locked: ${task.label}`
              }
              className={`rounded-md border p-3 transition-colors ${
                done
                  ? "border-[#3fb950]/60 bg-[#102118]"
                  : isCurrent
                    ? "border-[#58a6ff]/60 bg-[#0f1726]"
                    : "border-gray-800 bg-[#11161d]"
              } ${
                canAcceptTap
                  ? "cursor-pointer ring-2 ring-[#58a6ff]/50 active:bg-[#152238]"
                  : isCurrent && touchPrimary && !selectedOptionId
                    ? "ring-1 ring-[#58a6ff]/25"
                    : ""
              }`}
              onClick={() => handleTaskActivate(task.id, isCurrent)}
              onKeyDown={(event) => {
                if (!canAcceptTap) return;
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  handleTaskActivate(task.id, isCurrent);
                }
              }}
              onDragOver={(event) => {
                if (isCurrent && dragEnabled) event.preventDefault();
              }}
              onDrop={(event) => {
                if (!isCurrent || !dragEnabled) return;
                event.preventDefault();
                const optionId = event.dataTransfer.getData("assessment-option-id");
                if (!optionId) return;
                onTaskMatched(task.id, optionId);
                setSelectedOptionId(null);
              }}
            >
              <p className="text-[11px] leading-relaxed">
                {done ? "✅ " : isCurrent ? "➡️ " : "🔒 "}
                <span className={done || isCurrent ? "text-gray-200" : "text-gray-500"}>
                  {task.label}
                </span>
              </p>
              <p className="mt-1 text-[10px] text-gray-500">
                {done
                  ? "Completed"
                  : isCurrent
                    ? showDropTarget
                      ? touchPrimary
                        ? canAcceptTap
                          ? currentDropHint
                          : "Select a command above, then tap here."
                        : variant === "lesson"
                          ? "Drop the matching kubectl command here for this lesson step."
                          : "Drop the matching command here."
                      : lockedHint
                    : lockedHint}
              </p>
            </div>
          );
        })}
      </div>

      {feedback && (
        <p className="mt-2 text-[11px] text-gray-400" role="status" aria-live="polite">
          {feedback}
        </p>
      )}
    </div>
  );
}
