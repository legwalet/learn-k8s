"use client";

import Link from "next/link";
import { codingLessons, kubernetesLessons } from "@/data/lessons";
import { useUserProgress } from "@/components/UserProgressContext";
import UserProfileStrip from "@/components/UserProfileStrip";
import {
  getKubernetesTopicsInTeachingOrder,
  kubernetesScenarios,
  topicProgressId,
} from "@/data/kubernetesScenarios";

export default function JourneyPage() {
  const { profile, status } = useUserProgress();

  const isCompleted = (id: string) =>
    profile?.completed.some((item) => item.id === id) ?? false;

  return (
    <main className="min-h-screen bg-[#0d1117]">
      <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 sm:py-8">
        <Link
          href="/"
          className="text-gray-400 hover:text-white text-sm mb-6 inline-block"
        >
          ← Home
        </Link>

        <h1 className="text-3xl font-bold text-white mb-2">Your Learning Journey</h1>
        <p className="text-gray-400 mb-4 text-sm">
          Track your progress through lessons, assessments, and tests, and see the points and badges
          you earn along the way. Learning pages live under <code className="text-gray-300">Learn Kubernetes</code> and <code className="text-gray-300">Learn to Code</code>;
          assessments and tests have their own overview on the{" "}
          <code className="text-gray-300">Assessments &amp; tests</code> page.
        </p>

        <UserProfileStrip />

        {status === "loading" && (
          <p className="text-xs text-gray-500 mt-2">Loading journey…</p>
        )}

        {!profile && status === "ready" && (
          <p className="text-sm text-gray-400">
            Create a profile above to start tracking your journey. Once you&apos;re signed in, you
            can mark activities as complete and earn rewards.
          </p>
        )}

        {profile && (
          <div className="space-y-8 mt-4">
            <section>
              <h2 className="text-lg font-semibold text-white mb-2">
                Kubernetes assessments & tests
              </h2>
              <p className="text-[13px] text-gray-400 mb-3">
                These lessons act like guided assessments of your Kubernetes understanding. They are
                marked complete automatically when you finish the interactive tasks on each lesson
                page (for example, running the right <code className="text-gray-300">kubectl</code>{" "}
                commands).
              </p>
              <div className="divide-y divide-gray-800 rounded-lg border border-gray-800 bg-[#050810]">
                {kubernetesLessons.map((lesson) => {
                  const id = `kubernetes:${lesson.id}`;
                  const done = isCompleted(id);
                  return (
                    <div
                      key={lesson.id}
                      className="flex flex-col gap-2 px-4 py-3 text-sm text-gray-200 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-medium text-white">{lesson.title}</p>
                        <p className="text-[12px] text-gray-400">{lesson.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] ${
                            done
                              ? "bg-[#1f6f3f] text-[#c9fdd7]"
                              : "bg-gray-800 text-gray-300"
                          }`}
                        >
                          {done ? "Completed" : "Not completed"}
                        </span>
                        <Link
                          href={`/learn/kubernetes/${lesson.id}`}
                          className="text-[11px] text-[#58a6ff] hover:underline"
                        >
                          Open
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-2">
                Kubernetes topic practice
              </h2>
              <p className="text-[13px] text-gray-400 mb-3">
                Guided topics with simulated kubectl. Completing a topic also counts toward the
                matching scenario exam on your main journey.
              </p>
              <div className="divide-y divide-gray-800 rounded-lg border border-gray-800 bg-[#050810]">
                {getKubernetesTopicsInTeachingOrder().map((topic) => {
                  const id = topicProgressId(topic.id);
                  const done = isCompleted(id);
                  const title = topic.title.replace(/^Scenario:\s*/i, "").trim() || topic.title;
                  return (
                    <div
                      key={topic.id}
                      className="flex flex-col gap-2 px-4 py-3 text-sm text-gray-200 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-medium text-white">{title}</p>
                        <p className="text-[12px] text-gray-400">{topic.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] ${
                            done
                              ? "bg-[#1f6f3f] text-[#c9fdd7]"
                              : "bg-gray-800 text-gray-300"
                          }`}
                        >
                          {done ? "Completed" : "Not completed"}
                        </span>
                        <Link
                          href={`/learn/kubernetes/topics/${topic.id}`}
                          className="text-[11px] text-[#58a6ff] hover:underline"
                        >
                          Open
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-2">
                Kubernetes scenario exams
              </h2>
              <p className="text-[13px] text-gray-400 mb-3">
                Graded checks with drag-and-drop and a simulated terminal.
              </p>
              <div className="divide-y divide-gray-800 rounded-lg border border-gray-800 bg-[#050810]">
                {kubernetesScenarios.map((scenario) => {
                  const id = `scenario:${scenario.id}`;
                  const done = isCompleted(id);
                  return (
                    <div
                      key={scenario.id}
                      className="flex flex-col gap-2 px-4 py-3 text-sm text-gray-200 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-medium text-white">{scenario.title}</p>
                        <p className="text-[12px] text-gray-400">{scenario.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] ${
                            done
                              ? "bg-[#1f6f3f] text-[#c9fdd7]"
                              : "bg-gray-800 text-gray-300"
                          }`}
                        >
                          {done ? "Completed" : "Not completed"}
                        </span>
                        <Link
                          href={`/assessments/scenarios/${scenario.id}`}
                          className="text-[11px] text-[#58a6ff] hover:underline"
                        >
                          Open
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-2">
                Pod YAML assessment
              </h2>
              <div className="divide-y divide-gray-800 rounded-lg border border-gray-800 bg-[#050810]">
                <div className="flex flex-col gap-2 px-4 py-3 text-sm text-gray-200 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-white">Pod YAML deployment check</p>
                    <p className="text-[12px] text-gray-400">
                      Edit YAML and run kubectl apply / get pods in the simulator.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] ${
                        isCompleted("assessment:pod-yaml")
                          ? "bg-[#1f6f3f] text-[#c9fdd7]"
                          : "bg-gray-800 text-gray-300"
                      }`}
                    >
                      {isCompleted("assessment:pod-yaml") ? "Completed" : "Not completed"}
                    </span>
                    <Link
                      href="/assessments/pod-yaml"
                      className="text-[11px] text-[#58a6ff] hover:underline"
                    >
                      Open
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-2">
                Coding assignments & practice
              </h2>
              <p className="text-[13px] text-gray-400 mb-3">
                These JavaScript lessons act as coding tests. They are marked complete
                automatically once your code satisfies all tasks for that lesson and you run it from
                the editor.
              </p>
              <div className="divide-y divide-gray-800 rounded-lg border border-gray-800 bg-[#050810]">
                {codingLessons.map((lesson) => {
                  const id = `coding:${lesson.id}`;
                  const done = isCompleted(id);
                  return (
                    <div
                      key={lesson.id}
                      className="flex flex-col gap-2 px-4 py-3 text-sm text-gray-200 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-medium text-white">{lesson.title}</p>
                        <p className="text-[12px] text-gray-400">{lesson.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] ${
                            done
                              ? "bg-[#1f6f3f] text-[#c9fdd7]"
                              : "bg-gray-800 text-gray-300"
                          }`}
                        >
                          {done ? "Completed" : "Not completed"}
                        </span>
                        <Link
                          href={`/learn/coding/${lesson.id}`}
                          className="text-[11px] text-[#58a6ff] hover:underline"
                        >
                          Open
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

