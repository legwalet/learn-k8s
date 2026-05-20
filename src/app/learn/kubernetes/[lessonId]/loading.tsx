export default function KubernetesLessonLoading() {
  return (
    <main className="min-h-screen bg-[#0d1117] px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-4xl animate-pulse space-y-4">
        <div className="h-4 w-24 rounded bg-gray-800" />
        <div className="h-9 w-3/4 max-w-md rounded bg-gray-800" />
        <div className="h-20 rounded-lg bg-gray-800/80" />
        <div className="grid gap-4 md:grid-cols-[minmax(0,2fr),minmax(0,1.1fr)]">
          <div className="h-[220px] rounded-lg bg-gray-800/80" />
          <div className="h-64 rounded-lg bg-gray-800/80" />
        </div>
      </div>
    </main>
  );
}
