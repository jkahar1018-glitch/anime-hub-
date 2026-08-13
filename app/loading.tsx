export default function Loading() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="relative h-14 w-14">
          <div className="absolute inset-0 rounded-full border-4 border-white/10" />

          <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-white" />
        </div>

        <div className="text-center">
          <h2 className="text-lg font-semibold">
            AnimeHub
          </h2>

          <p className="mt-1 text-sm text-white/50">
            Loading...
          </p>
        </div>
      </div>
    </main>
  );
}