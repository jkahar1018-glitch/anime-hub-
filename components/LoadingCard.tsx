export default function LoadingCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl bg-gray-900 shadow-lg">
      <div className="h-80 w-full bg-gray-800" />

      <div className="space-y-4 p-4">
        <div className="h-6 w-3/4 rounded bg-gray-700" />
        <div className="h-4 w-1/2 rounded bg-gray-700" />
        <div className="h-10 w-full rounded-lg bg-gray-700" />
      </div>
    </div>
  );
}