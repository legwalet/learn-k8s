export default function CodingLessonLoading() {
  return (
    <main className="min-h-screen bg-[#0d1117] px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-5xl animate-pulse space-y-4">
        <div className="h-4 w-28 rounded bg-gray-800" />
        <div className="h-8 w-2/3 max-w-lg rounded bg-gray-800" />
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="h-[min(360px,50vh)] min-h-[200px] rounded-lg bg-gray-800/80" />
          <div className="h-[240px] rounded-lg bg-gray-800/80" />
        </div>
      </div>
    </main>
  );
}
