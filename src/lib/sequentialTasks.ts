/** First incomplete task in list order — steps unlock one at a time. */
export function getCurrentTask<T extends { id: string }>(
  tasks: readonly T[],
  completed: Record<string, boolean>
): T | null {
  return tasks.find((task) => !completed[task.id]) ?? null;
}

export function isCurrentTask<T extends { id: string }>(
  tasks: readonly T[],
  completed: Record<string, boolean>,
  taskId: string
): boolean {
  return getCurrentTask(tasks, completed)?.id === taskId;
}
