import Link from "next/link";
import UserProfileStrip from "@/components/UserProfileStrip";

const primaryActions = [
  {
    href: "/learn/kubernetes",
    title: "Lessons",
    description:
      "Learn Kubernetes concepts, kubectl practice, YAML, and exam prep—all in guided teaching modules.",
    icon: "☸️",
    borderClass: "hover:border-[#3fb950]/50",
    badge: "Recommended start",
  },
  {
    href: "/exams",
    title: "Exams",
    description:
      "Interactive kubectl exams grouped by difficulty. Test what you practiced in lessons.",
    icon: "📝",
    borderClass: "hover:border-[#58a6ff]/50",
  },
  {
    href: "/journey",
    title: "Journey",
    description:
      "See completed lessons and exams, points, and badges in one progress view.",
    icon: "🧭",
    borderClass: "hover:border-[#a371f7]/50",
  },
] as const;

const secondaryActions = [
  {
    href: "/learn/coding",
    title: "Learn to Code",
    description: "Optional JavaScript / Node track with editor and terminal.",
  },
  {
    href: "/assessments/pod-yaml",
    title: "Pod YAML check",
    description: "Standalone hands-on YAML deployment scenario.",
  },
] as const;

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0d1117] via-[#161b22] to-[#0d1117]">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-16">
        <header className="mb-10 text-center">
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            K8 Learn
          </h1>
          <p className="mx-auto max-w-xl text-gray-400">
            Choose where to go—lessons to study, exams to validate skills, or your journey for
            progress.
          </p>
        </header>

        <div className="mx-auto mb-10 max-w-2xl">
          <UserProfileStrip />
        </div>

        <section aria-label="Main navigation">
          <h2 className="sr-only">Main navigation</h2>
          <ul className="grid gap-4 sm:grid-cols-1 md:grid-cols-3">
            {primaryActions.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex h-full flex-col rounded-xl border border-gray-700 bg-[#161b22] p-5 text-white transition-colors ${item.borderClass}`}
                >
                  <span className="text-2xl" aria-hidden>
                    {item.icon}
                  </span>
                  {"badge" in item && item.badge && (
                    <span className="mt-2 w-fit rounded-full bg-[#1f6f3f]/40 px-2 py-0.5 text-[10px] font-medium text-[#c9fdd7]">
                      {item.badge}
                    </span>
                  )}
                  <span className="mt-3 text-lg font-semibold">{item.title}</span>
                  <span className="mt-2 text-sm text-gray-400">{item.description}</span>
                  <span className="mt-4 text-sm font-medium text-[#58a6ff]">
                    Open →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10 border-t border-gray-700 pt-8">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
            More
          </h2>
          <ul className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {secondaryActions.map((item) => (
              <li key={item.href} className="flex-1 sm:min-w-[200px] sm:max-w-sm">
                <Link
                  href={item.href}
                  className="block rounded-lg border border-gray-800 bg-[#11161d] p-4 text-gray-300 transition-colors hover:border-gray-600"
                >
                  <span className="font-medium text-white">{item.title}</span>
                  <span className="mt-1 block text-xs text-gray-500">{item.description}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <p className="mt-12 text-center text-sm text-gray-500">
          Works best in Chrome, Edge, or Safari.
        </p>
      </div>
    </main>
  );
}
