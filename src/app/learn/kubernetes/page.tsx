"use client";

import Link from "next/link";
import { useMemo } from "react";
import { kubernetesLessons } from "@/data/lessons";
import UserProfileStrip from "@/components/UserProfileStrip";
import { useUserProgress } from "@/components/UserProgressContext";
import {
  getTeachingTopicUnlockState,
  kubernetesJourneySteps,
  kubernetesScenarios,
  type KubernetesJourneyStep,
} from "@/data/kubernetesScenarios";

/** Match lesson-card titles — scenario data uses a "Scenario: " prefix. */
function displayTopicTitle(title: string): string {
  return title.replace(/^Scenario:\s*/i, "").trim() || title;
}

export default function KubernetesTrackPage() {
  const { profile } = useUserProgress();
  const getStepCompletionId = (step: KubernetesJourneyStep): string =>
    step.type === "lesson" ? `kubernetes:${step.lessonId}` : `scenario:${step.scenarioId}`;
  const completedIds = useMemo(
    () => new Set(profile?.completed.map((item) => item.id) ?? []),
    [profile?.completed]
  );

  const isLessonUnlocked = (lessonId: string, lessonIndex: number): boolean => {
    if (lessonIndex === 0) return true;
    if (!profile) return false;
    const stepIndex = kubernetesJourneySteps.findIndex(
      (step) => step.type === "lesson" && step.lessonId === lessonId
    );
    if (stepIndex <= 0) return true;
    return kubernetesJourneySteps
      .slice(0, stepIndex)
      .every((step) => completedIds.has(getStepCompletionId(step)));
  };

  return (
    <main className="min-h-screen bg-[#0d1117]">
      <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 sm:py-8">
        <Link
          href="/"
          className="text-gray-400 hover:text-white text-sm mb-6 inline-block"
        >
          ← Home
        </Link>
        <h1 className="text-3xl font-bold text-white mb-2">Learn Kubernetes (K8s)</h1>
        <p className="text-gray-400 mb-8">
          Core concepts, <code className="text-gray-500">kubectl</code>, and YAML. Practice in the simulated terminal and use the examples with minikube or kind.
        </p>
        <UserProfileStrip />
        <ul className="space-y-3">
          {kubernetesLessons.map((lesson, index) => {
            const unlocked = isLessonUnlocked(lesson.id, index);
            return (
              <li key={`lesson-${lesson.id}`}>
                {unlocked ? (
                  <Link
                    href={`/learn/kubernetes/${lesson.id}`}
                    className="block rounded-lg border border-gray-700 bg-[#161b22] p-4 text-white hover:border-[#3fb950]/50"
                  >
                    <span className="font-medium">{lesson.title}</span>
                    <span className="mt-1 block text-sm text-gray-400">{lesson.description}</span>
                  </Link>
                ) : (
                  <div className="block rounded-lg border border-gray-800 bg-[#11161d] p-4 text-gray-500">
                    <span className="font-medium">🔒 {lesson.title}</span>
                    <span className="mt-1 block text-sm">
                      Complete required exams to unlock this lesson.
                    </span>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
        <section className="mt-8">
          <h2 className="mb-2 text-lg font-semibold text-white">Real-world topics (read first)</h2>
          <p className="mb-4 text-xs text-gray-400">
            Topics unlock in sequence: finish every practice step in the topic before yours. Use{" "}
            <Link href="/" className="text-[#58a6ff] hover:underline">
              Home → Exams
            </Link>{" "}
            when you want a graded check. Sign in so completions are saved and the chain unlocks.
          </p>
          <div className="space-y-6">
            {["Beginner", "On-call", "Production", "Security/Cost"].map((difficulty) => {
              const topics = kubernetesScenarios.filter((s) => s.difficulty === difficulty);
              if (topics.length === 0) return null;
              return (
                <div key={`topics-${difficulty}`}>
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    {difficulty}
                  </p>
                  <ul className="space-y-3">
                    {topics.map((topic) => {
                      const unlock = getTeachingTopicUnlockState(topic.id, completedIds);
                      return (
                        <li key={topic.id}>
                          {unlock.unlocked ? (
                            <Link
                              href={`/learn/kubernetes/topics/${topic.id}`}
                              className="block rounded-lg border border-gray-700 bg-[#161b22] p-4 text-white transition-colors hover:border-[#3fb950]/50"
                            >
                              <span className="font-medium">{displayTopicTitle(topic.title)}</span>
                              <span className="mt-1 block text-sm text-gray-400">
                                {topic.description}
                              </span>
                            </Link>
                          ) : (
                            <div className="rounded-lg border border-gray-800 bg-[#11161d] p-4 text-gray-500">
                              <span className="font-medium">
                                🔒 {displayTopicTitle(topic.title)}
                              </span>
                              <span className="mt-1 block text-sm text-gray-500">
                                {unlock.previousTopicTitle
                                  ? `Complete all steps correctly in "${unlock.previousTopicTitle}" to unlock this topic.`
                                  : "Unlock the previous topic in the list first."}
                              </span>
                              {!profile && (
                                <span className="mt-1 block text-[11px] text-gray-600">
                                  Sign in above so topic completions are remembered.
                                </span>
                              )}
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
