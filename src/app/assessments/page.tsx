import Link from "next/link";
import { kubernetesLessons, codingLessons } from "@/data/lessons";
import UserProfileStrip from "@/components/UserProfileStrip";

export default function AssessmentsPage() {
  const kubernetesAssessmentIds = new Set(["intro", "kubectl-get"]);
  const codingAssessmentIds = new Set(["hello", "variables", "functions"]);

  return (
    <main className="min-h-screen bg-[#0d1117]">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Link
          href="/"
          className="text-gray-400 hover:text-white text-sm mb-6 inline-block"
        >
          ← Home
        </Link>

        <h1 className="text-3xl font-bold text-white mb-2">Assessments & tests</h1>
        <p className="text-gray-400 mb-4 text-sm">
          Use these when you want to **check understanding**. Learning pages focus on explaining
          ideas. Assessment pages focus on doing tasks that the program can verify automatically.
        </p>

        <UserProfileStrip />

        <div className="mt-4 space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-white mb-2">
              Kubernetes assessments
            </h2>
            <p className="text-[13px] text-gray-400 mb-3">
              Scenario-based checks using the simulated{" "}
              <code className="text-gray-300">kubectl</code> terminal. These map to specific
              Kubernetes lessons but focus on whether you can **use** the commands in a realistic
              situation.
            </p>
            <ul className="space-y-3">
              {kubernetesLessons
                .filter((lesson) => kubernetesAssessmentIds.has(lesson.id))
                .map((lesson) => (
                  <li key={lesson.id}>
                    <Link
                      href={`/learn/kubernetes/${lesson.id}`}
                      className="block rounded-lg border border-gray-700 bg-[#161b22] p-4 hover:border-[#3fb950]/60 text-white"
                    >
                      <p className="font-medium">{lesson.title}</p>
                      <p className="text-[13px] text-gray-400 mt-1">
                        {lesson.description}
                      </p>
                      <p className="mt-2 text-[11px] text-gray-500">
                        Learning content is at the top of the page. The **assessment section** is
                        clearly labeled and must be completed for this to count as passed.
                      </p>
                    </Link>
                  </li>
                ))}
              <li>
                <Link
                  href="/assessments/pod-yaml"
                  className="block rounded-lg border border-gray-700 bg-[#161b22] p-4 hover:border-[#3fb950]/60 text-white"
                >
                  <p className="font-medium">Pod YAML deployment check</p>
                  <p className="text-[13px] text-gray-400 mt-1">
                    Update a Pod manifest with labels and a specific image, then simulate deploying
                    and verifying it with kubectl apply and kubectl get pods.
                  </p>
                  <p className="mt-2 text-[11px] text-gray-500">
                    Use the &quot;Your first Pod YAML&quot; learning page to review the concept,
                    then come here to run the assessment.
                  </p>
                </Link>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">
              Coding tests
            </h2>
            <p className="text-[13px] text-gray-400 mb-3">
              Realistic coding tasks using the editor and live terminal. These reuse the same
              lessons, but the **test section** checks your code and only passes when all tasks are
              satisfied.
            </p>
            <ul className="space-y-3">
              {codingLessons
                .filter((lesson) => codingAssessmentIds.has(lesson.id))
                .map((lesson) => (
                  <li key={lesson.id}>
                    <Link
                      href={`/learn/coding/${lesson.id}`}
                      className="block rounded-lg border border-gray-700 bg-[#161b22] p-4 hover:border-[#58a6ff]/60 text-white"
                    >
                      <p className="font-medium">{lesson.title}</p>
                      <p className="text-[13px] text-gray-400 mt-1">
                        {lesson.description}
                      </p>
                      <p className="mt-2 text-[11px] text-gray-500">
                        Use the top of the page to review the concept. The **coding test panel**
                        below is what the program uses to mark this as passed.
                      </p>
                    </Link>
                  </li>
                ))}
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}

