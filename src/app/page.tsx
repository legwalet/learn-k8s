import Link from "next/link";
import { kubernetesLessons } from "@/data/lessons";
import UserProfileStrip from "@/components/UserProfileStrip";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0d1117] via-[#161b22] to-[#0d1117]">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-4">
            K8 Learn
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Learn <strong className="text-[#3fb950]">Kubernetes</strong> (K8s) with interactive lessons. Practice{" "}
            <code className="text-[#58a6ff] font-mono">kubectl</code>, write YAML, and understand pods, deployments, and services — all in your browser.
          </p>
        </header>

        <div className="max-w-2xl mx-auto">
          <UserProfileStrip />
        </div>

        {/* Kubernetes lessons — main content */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
            <span>☸️</span> Kubernetes lessons — start here
          </h2>
          <p className="text-gray-400 text-sm mb-6">
            Click a lesson to open it. Each has a simulated terminal where you can type <code className="text-gray-500">kubectl</code> commands and see example output.
          </p>
          <ul className="space-y-3">
            {kubernetesLessons.map((lesson, i) => (
              <li key={lesson.id}>
                <Link
                  href={`/learn/kubernetes/${lesson.id}`}
                  className="block p-4 rounded-xl border border-gray-700 bg-[#161b22] hover:border-[#3fb950]/50 text-white"
                >
                  <span className="text-gray-500 font-mono text-sm mr-2">{i + 1}.</span>
                  <span className="font-semibold">{lesson.title}</span>
                  <span className="text-gray-400 text-sm block mt-1 ml-6">{lesson.description}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Optional: coding & assessments */}
        <section className="border-t border-gray-700 pt-8 space-y-3">
          <h2 className="text-lg font-semibold text-gray-400">Optional</h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/learn/coding"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-700 bg-[#161b22]/80 hover:border-[#58a6ff]/50 text-gray-300 text-sm"
            >
              <span>💻</span> Learn to Code (JavaScript / Node.js)
            </Link>
            <Link
              href="/assessments"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-700 bg-[#161b22]/80 hover:border-[#3fb950]/50 text-gray-300 text-sm"
            >
              <span>✅</span> Assessments & tests
            </Link>
          </div>
        </section>

        <p className="text-center text-gray-500 text-sm mt-12">
          Built for teaching Kubernetes. Works in Chrome, Edge, or Safari.
        </p>
      </div>
    </main>
  );
}
