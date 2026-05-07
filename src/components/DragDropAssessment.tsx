"use client";

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
  return (
    <div className="rounded-lg border border-[#3fb950]/30 bg-[#050810] p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">{title}</p>
      {subtitle && <p className="mt-1 text-[11px] text-gray-500">{subtitle}</p>}

      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            draggable
            onDragStart={(event) => {
              event.dataTransfer.setData("assessment-option-id", option.id);
            }}
            className="inline-flex items-center gap-1 rounded-full border border-gray-700 bg-[#0d1117] px-3 py-1 text-[11px] font-mono text-gray-300 hover:border-gray-500 hover:text-white"
          >
            <span className="text-[10px]">⇄</span>
            <span>{option.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-3 space-y-2">
        {tasks.map((task) => {
          const done = !!completedTaskIds[task.id];
          const isCurrent = !done && currentTaskId === task.id;
          return (
            <div
              key={task.id}
              className={`rounded-md border p-2 ${
                done
                  ? "border-[#3fb950]/60 bg-[#102118]"
                  : isCurrent
                    ? "border-[#58a6ff]/60 bg-[#0f1726]"
                    : "border-gray-800 bg-[#11161d]"
              }`}
              onDragOver={(event) => {
                if (isCurrent) event.preventDefault();
              }}
              onDrop={(event) => {
                if (!isCurrent) return;
                event.preventDefault();
                const optionId = event.dataTransfer.getData("assessment-option-id");
                if (!optionId) return;
                onTaskMatched(task.id, optionId);
              }}
            >
              <p className="text-[11px]">
                {done ? "✅ " : isCurrent ? "➡️ " : "🔒 "}
                <span className={done || isCurrent ? "text-gray-200" : "text-gray-500"}>
                  {task.label}
                </span>
              </p>
              <p className="mt-1 text-[10px] text-gray-500">
                {done
                  ? "Completed"
                  : isCurrent
                    ? variant === "lesson"
                      ? "Drop the matching kubectl command here for this lesson step."
                      : "Drop the matching command here."
                    : variant === "lesson"
                      ? "Complete the current lesson step first."
                      : "Locked until the current task is complete."}
              </p>
            </div>
          );
        })}
      </div>

      {feedback && <p className="mt-2 text-[11px] text-gray-400">{feedback}</p>}
    </div>
  );
}

