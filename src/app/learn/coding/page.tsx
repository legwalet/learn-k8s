import Link from "next/link";
import { codingLessons } from "@/data/lessons";
import UserProfileStrip from "@/components/UserProfileStrip";

export default function CodingTrackPage() {
  return (
    <main className="min-h-screen bg-[#0d1117]">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Link
          href="/"
          className="text-gray-400 hover:text-white text-sm mb-6 inline-block"
        >
          ← Home
        </Link>
        <div className="mb-6 p-4 rounded-lg border border-[#3fb950]/40 bg-[#0d1117] text-gray-300 text-sm">
          <strong className="text-[#3fb950]">Looking for Kubernetes?</strong> This section is optional JavaScript/Node.js. For K8 lessons (kubectl, Pods, YAML),{" "}
          <Link href="/" className="text-[#58a6ff] hover:underline">go to the home page</Link> and use the &quot;Kubernetes lessons — start here&quot; list.
        </div>
        <UserProfileStrip />
        <h1 className="text-3xl font-bold text-white mb-2">Learn to Code</h1>
        <p className="text-gray-400 mb-8">
          JavaScript & Node.js with a live terminal. Run code and see output in your browser.
        </p>
        <ul className="space-y-3">
          {codingLessons.map((lesson) => (
            <li key={lesson.id}>
              <Link
                href={`/learn/coding/${lesson.id}`}
                className="block p-4 rounded-lg border border-gray-700 bg-[#161b22] hover:border-[#58a6ff]/50 text-white"
              >
                <span className="font-medium">{lesson.title}</span>
                <span className="text-gray-400 text-sm block mt-1">
                  {lesson.description}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
