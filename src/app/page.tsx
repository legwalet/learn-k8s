import Link from "next/link";
import UserProfileStrip from "@/components/UserProfileStrip";

const primaryActions = [
  {
    href: "/learn/kubernetes",
    title: "Kubernetes Quest",
    description:
      "Master concepts, kubectl, and YAML through guided missions and a simulated cluster.",
    icon: "☸️",
    tag: "Main quest",
    glow: "from-[#3fb950]/20",
    ring: "hover:border-[#3fb950]/70 hover:shadow-[#3fb950]/20",
    accent: "text-[#3fb950]",
  },
  {
    href: "/exams",
    title: "Boss Battles",
    description:
      "Interactive exams grouped by difficulty. Prove the skills you trained in lessons.",
    icon: "⚔️",
    tag: "Challenge",
    glow: "from-[#58a6ff]/20",
    ring: "hover:border-[#58a6ff]/70 hover:shadow-[#58a6ff]/20",
    accent: "text-[#58a6ff]",
  },
  {
    href: "/journey",
    title: "Trophy Room",
    description:
      "Track XP, levels, and badges. See every lesson and exam you've conquered.",
    icon: "🏆",
    tag: "Progress",
    glow: "from-[#a371f7]/20",
    ring: "hover:border-[#a371f7]/70 hover:shadow-[#a371f7]/20",
    accent: "text-[#c9a0ff]",
  },
] as const;

const sideQuests = [
  {
    href: "/learn/terraform",
    title: "Terraform Track",
    icon: "🛠️",
    description: "Infrastructure as code — HCL lessons and real-world scenarios.",
  },
  {
    href: "/learn/coding",
    title: "Code Dojo",
    icon: "💻",
    description: "Optional JavaScript / Node track with editor and live terminal.",
  },
  {
    href: "/assessments/pod-yaml",
    title: "Pod YAML Trial",
    icon: "📦",
    description: "Standalone hands-on YAML deployment scenario.",
  },
] as const;

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0d1117] via-[#161b22] to-[#0d1117]">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-16">
        <header className="mb-10 text-center">
          <span className="k8-float mb-3 inline-block text-4xl sm:text-5xl">☸️</span>
          <h1 className="mb-3 bg-gradient-to-r from-[#3fb950] via-[#56d364] to-[#58a6ff] bg-clip-text text-3xl font-black tracking-tight text-transparent sm:text-4xl md:text-5xl">
            K8 Learn
          </h1>
          <p className="mx-auto max-w-xl text-gray-400">
            Level up your cloud-native skills. Pick a quest, earn XP, and collect badges
            as you go.
          </p>
        </header>

        <div className="mx-auto mb-10 max-w-2xl">
          <UserProfileStrip />
        </div>

        <section aria-label="Main quests">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
              Choose your quest
            </span>
            <span className="h-px flex-1 bg-gradient-to-r from-gray-700 to-transparent" />
          </div>
          <ul className="grid gap-4 sm:grid-cols-1 md:grid-cols-3">
            {primaryActions.map((item, i) => (
              <li
                key={item.href}
                className="k8-pop-in"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <Link
                  href={item.href}
                  className={`k8-quest-card group relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-700 bg-[#161b22] p-5 text-white shadow-lg shadow-black/30 ${item.ring}`}
                >
                  <div
                    className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${item.glow} to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100`}
                  />
                  <div className="relative flex items-center justify-between">
                    <span className="text-3xl transition-transform duration-200 group-hover:scale-110">
                      {item.icon}
                    </span>
                    <span className="rounded-full border border-white/10 bg-black/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                      {item.tag}
                    </span>
                  </div>
                  <span className="relative mt-3 text-lg font-bold">{item.title}</span>
                  <span className="relative mt-2 text-sm text-gray-400">{item.description}</span>
                  <span className={`relative mt-4 text-sm font-semibold ${item.accent}`}>
                    Start →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
              Side quests
            </span>
            <span className="h-px flex-1 bg-gradient-to-r from-gray-700 to-transparent" />
          </div>
          <ul className="grid gap-3 sm:grid-cols-3">
            {sideQuests.map((item, i) => (
              <li
                key={item.href}
                className="k8-pop-in"
                style={{ animationDelay: `${(i + 3) * 80}ms` }}
              >
                <Link
                  href={item.href}
                  className="k8-quest-card group flex h-full items-start gap-3 rounded-xl border border-gray-800 bg-[#11161d] p-4 text-gray-300 hover:border-gray-600"
                >
                  <span className="text-xl transition-transform duration-200 group-hover:scale-110">
                    {item.icon}
                  </span>
                  <span>
                    <span className="block font-semibold text-white">{item.title}</span>
                    <span className="mt-1 block text-xs text-gray-500">{item.description}</span>
                  </span>
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
