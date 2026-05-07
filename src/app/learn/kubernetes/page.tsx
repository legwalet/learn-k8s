"use client";

import Link from "next/link";
import { kubernetesLessons } from "@/data/lessons";
import UserProfileStrip from "@/components/UserProfileStrip";
import { useUserProgress } from "@/components/UserProgressContext";
import {
  kubernetesJourneySteps,
  kubernetesScenarios,
  type KubernetesJourneyStep,
} from "@/data/kubernetesScenarios";

export default function KubernetesTrackPage() {
  const { profile } = useUserProgress();
  const getStepCompletionId = (step: KubernetesJourneyStep): string =>
    step.type === "lesson" ? `kubernetes:${step.lessonId}` : `scenario:${step.scenarioId}`;

  const isStepUnlocked = (index: number): boolean => {
    if (index === 0) return true;
    if (!profile) return false;
    const previous = kubernetesJourneySteps[index - 1];
    return profile.completed.some((item) => item.id === getStepCompletionId(previous));
  };

  return (
    <main className="min-h-screen bg-[#0d1117]">
      <div className="max-w-4xl mx-auto px-6 py-8">
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
          {kubernetesJourneySteps.map((step, index) => {
            const unlocked = isStepUnlocked(index);
            if (step.type === "lesson") {
              const lesson = kubernetesLessons.find((item) => item.id === step.lessonId);
              if (!lesson) return null;
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
                        Complete the previous checkpoint to unlock this lesson.
                      </span>
                    </div>
                  )}
                </li>
              );
            }

            const scenario = kubernetesScenarios.find((item) => item.id === step.scenarioId);
            if (!scenario) return null;
            return (
              <li key={`scenario-${scenario.id}`}>
                {unlocked ? (
                  <Link
                    href={`/assessments/scenarios/${scenario.id}`}
                    className="block rounded-lg border border-[#3fb950]/40 bg-[#102118]/30 p-4 text-white hover:border-[#3fb950]/70"
                  >
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-[#3fb950]">
                      Interactive checkpoint
                    </span>
                    <span className="mt-1 block font-medium">{scenario.title}</span>
                    <span className="mt-1 block text-sm text-gray-400">
                      {scenario.description}
                    </span>
                  </Link>
                ) : (
                  <div className="block rounded-lg border border-gray-800 bg-[#11161d] p-4 text-gray-500">
                    <span className="font-medium">🔒 {scenario.title}</span>
                    <span className="mt-1 block text-sm">
                      Complete the previous step to unlock this checkpoint.
                    </span>
                  </div>
                )}
              </li>
            );
          }).filter(Boolean)}
        </ul>
        <section className="mt-8">
          <h2 className="mb-2 text-lg font-semibold text-white">More Scenario Practice</h2>
          <p className="mb-3 text-xs text-gray-400">
            Extra interactive scenarios are available in Assessments for additional real-world
            drills.
          </p>
          <Link
            href="/assessments"
            className="inline-flex rounded bg-[#1f6feb] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#388bfd]"
          >
            Open all scenarios →
          </Link>
        </section>
      </div>
    </main>
  );
}
