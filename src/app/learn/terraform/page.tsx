"use client";

import Link from "next/link";
import { useMemo } from "react";
import { terraformLessons } from "@/data/terraformLessons";
import UserProfileStrip from "@/components/UserProfileStrip";
import { useUserProgress } from "@/components/UserProgressContext";
import {
  getTerraformTeachingTopicUnlockState,
  isTerraformJourneyStepComplete,
  terraformDifficultyOrder,
  terraformJourneySteps,
  terraformScenarios,
} from "@/data/terraformScenarios";

function displayTopicTitle(title: string): string {
  return title.replace(/^Scenario:\s*/i, "").trim() || title;
}

export default function TerraformTrackPage() {
  const { profile } = useUserProgress();
  const completedIds = useMemo(
    () => new Set(profile?.completed.map((item) => item.id) ?? []),
    [profile?.completed]
  );

  const isLessonUnlocked = (lessonId: string, lessonIndex: number): boolean => {
    if (lessonIndex === 0) return true;
    if (!profile) return false;
    const stepIndex = terraformJourneySteps.findIndex(
      (step) => step.type === "lesson" && step.lessonId === lessonId
    );
    if (stepIndex <= 0) return true;
    return terraformJourneySteps
      .slice(0, stepIndex)
      .every((step) => isTerraformJourneyStepComplete(step, completedIds));
  };

  return (
    <main className="min-h-screen bg-[#0d1117]">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
        <Link href="/" className="mb-6 inline-block text-sm text-gray-400 hover:text-white">
          ← Home
        </Link>
        <h1 className="mb-2 text-3xl font-bold text-white">Learn Terraform</h1>
        <p className="mb-8 text-gray-400">
          Infrastructure as code with HCL. Practice in the simulated terminal — no cloud account
          required for these lessons.
        </p>
        <UserProfileStrip />

        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">Lessons</h2>
          <ul className="space-y-3">
            {terraformLessons.map((lesson, index) => {
              const unlocked = isLessonUnlocked(lesson.id, index);
              return (
                <li key={lesson.id}>
                  {unlocked ? (
                    <Link
                      prefetch={false}
                      href={`/learn/terraform/${lesson.id}`}
                      className="block rounded-lg border border-gray-700 bg-[#161b22] p-4 text-white hover:border-[#d29922]/50"
                    >
                      <span className="font-medium">{lesson.title}</span>
                      <span className="mt-1 block text-sm text-gray-400">{lesson.description}</span>
                    </Link>
                  ) : (
                    <div className="rounded-lg border border-gray-800 bg-[#11161d] p-4 text-gray-500">
                      <span className="font-medium">🔒 {lesson.title}</span>
                      <span className="mt-1 block text-sm">
                        Complete required Terraform scenarios to unlock this lesson.
                      </span>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="mb-2 text-lg font-semibold text-white">Terraform scenarios</h2>
          <p className="mb-4 text-xs text-gray-400">
            Practice real-world workflows step by step. Finish each scenario to unlock the next. For
            graded exams, see{" "}
            <Link href="/exams" className="text-[#58a6ff] hover:underline">
              Exams
            </Link>
            .
          </p>
          <div className="space-y-6">
            {terraformDifficultyOrder.map((difficulty) => {
              const topics = terraformScenarios.filter((s) => s.difficulty === difficulty);
              if (topics.length === 0) return null;
              return (
                <div key={difficulty}>
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    {difficulty}
                  </p>
                  <ul className="space-y-3">
                    {topics.map((topic) => {
                      const unlock = getTerraformTeachingTopicUnlockState(topic.id, completedIds);
                      return (
                        <li key={topic.id}>
                          {unlock.unlocked ? (
                            <Link
                              prefetch={false}
                              href={`/learn/terraform/topics/${topic.id}`}
                              className="block rounded-lg border border-gray-700 bg-[#161b22] p-4 text-white transition-colors hover:border-[#d29922]/50"
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
                                  ? `Complete "${unlock.previousTopicTitle}" first.`
                                  : "Unlock the previous scenario first."}
                              </span>
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
