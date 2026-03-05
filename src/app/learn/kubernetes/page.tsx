import Link from "next/link";
import { kubernetesLessons } from "@/data/lessons";
import UserProfileStrip from "@/components/UserProfileStrip";

export default function KubernetesTrackPage() {
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
          {kubernetesLessons.map((lesson) => (
            <li key={lesson.id}>
              <Link
                href={`/learn/kubernetes/${lesson.id}`}
                className="block p-4 rounded-lg border border-gray-700 bg-[#161b22] hover:border-[#3fb950]/50 text-white"
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
