export default function KubernetesTopicLoading() {
  return (
    <main className="min-h-screen bg-[#0d1117] px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-4xl animate-pulse space-y-4">
        <div className="h-4 w-32 rounded bg-gray-800" />
        <div className="h-9 w-4/5 max-w-xl rounded bg-gray-800" />
        <div className="h-32 rounded-lg border border-gray-800 bg-gray-800/40" />
        <div className="h-48 rounded-lg bg-gray-800/80" />
      </div>
    </main>
  );
}
