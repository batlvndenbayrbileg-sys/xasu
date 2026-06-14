export default function Loading() {
  return (
    <div className="pt-24 md:pt-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* header skeleton */}
        <div className="h-4 w-28 rounded bg-neutral-200/70 animate-pulse" />
        <div className="h-10 w-64 rounded-lg bg-neutral-200/70 animate-pulse mt-3" />
        {/* grid skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mt-10">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-line overflow-hidden bg-white">
              <div className="aspect-[4/3] bg-neutral-200/70 animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-4 w-3/4 rounded bg-neutral-200/70 animate-pulse" />
                <div className="h-3 w-full rounded bg-neutral-200/60 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
