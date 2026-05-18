export default function AdminProductsLoading() {
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2">
        <div className="h-3 w-10 animate-pulse rounded bg-muted" />
        <div className="h-3 w-2 animate-pulse rounded bg-muted" />
        <div className="h-3 w-20 animate-pulse rounded bg-muted" />
      </div>
      {/* Title skeleton */}
      <div>
        <div className="h-7 w-56 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-4 w-96 animate-pulse rounded bg-muted" />
      </div>
      <div>
        <div className="space-y-6">
          {/* Stats row */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-card px-5 py-4">
                <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                <div className="mt-3 h-7 w-12 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-9 w-24 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
            <div className="flex items-center gap-3">
              <div className="h-9 w-60 animate-pulse rounded-lg bg-muted" />
              <div className="h-9 w-36 animate-pulse rounded-lg bg-muted" />
            </div>
          </div>

          {/* Table skeleton */}
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            {/* Header row */}
            <div className="border-b border-border px-4 py-3">
              <div className="flex items-center gap-4">
                <div className="h-4 w-10 animate-pulse rounded bg-muted" />
                <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                <div className="ml-auto h-4 w-20 animate-pulse rounded bg-muted" />
                <div className="h-4 w-16 animate-pulse rounded bg-muted" />
                <div className="h-4 w-14 animate-pulse rounded bg-muted" />
                <div className="h-4 w-14 animate-pulse rounded bg-muted" />
                <div className="h-4 w-16 animate-pulse rounded bg-muted" />
              </div>
            </div>
            {/* Data rows */}
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 border-b border-border px-4 py-3 last:border-0"
              >
                {/* Thumbnail */}
                <div className="h-10 w-10 flex-shrink-0 animate-pulse rounded-lg bg-muted" />
                {/* Name + ID */}
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 w-40 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                </div>
                {/* Category badge */}
                <div className="hidden h-5 w-20 animate-pulse rounded-full bg-muted md:block" />
                {/* Price */}
                <div className="hidden h-4 w-20 animate-pulse rounded bg-muted lg:block" />
                {/* Stock */}
                <div className="hidden h-4 w-16 animate-pulse rounded bg-muted lg:block" />
                {/* Sold */}
                <div className="hidden h-4 w-12 animate-pulse rounded bg-muted lg:block" />
                {/* Status toggle */}
                <div className="h-6 w-10 animate-pulse rounded-full bg-muted" />
                {/* Actions */}
                <div className="flex gap-1">
                  <div className="h-8 w-8 animate-pulse rounded-md bg-muted" />
                  <div className="h-8 w-8 animate-pulse rounded-md bg-muted" />
                </div>
              </div>
            ))}
          </div>

          {/* Footer summary */}
          <div className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-3">
            <div className="h-4 w-40 animate-pulse rounded bg-muted" />
            <div className="h-4 w-36 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </div>
    </div>
  )
}
