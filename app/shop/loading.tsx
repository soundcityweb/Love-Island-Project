export default function ShopLoading() {
  return (
    <main className="bg-background">
        <section className="bg-foreground px-4 md:px-8 pb-14 pt-16 lg:px-12 lg:pb-20 lg:pt-24">
          <div className="mx-auto max-w-7xl">
            <div className="h-4 w-32 animate-pulse rounded bg-primary/20" />
            <div className="mt-3 h-10 w-64 animate-pulse rounded bg-primary-foreground/20" />
            <div className="mt-4 h-5 max-w-2xl animate-pulse rounded bg-primary-foreground/10" />
          </div>
        </section>

        <section className="border-b border-border bg-card px-4 md:px-8 py-5 lg:px-12">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <div className="h-5 w-24 animate-pulse rounded bg-muted" />
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          </div>
        </section>

        <section className="px-4 md:px-8 py-16 md:py-24 lg:px-12">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
                  <div className="aspect-square animate-pulse bg-muted" />
                  <div className="flex flex-1 flex-col gap-2 px-4 pb-5 pt-4">
                    <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                    <div className="h-5 w-full animate-pulse rounded bg-muted" />
                    <div className="h-6 w-24 animate-pulse rounded bg-muted" />
                    <div className="mt-4 h-10 w-full animate-pulse rounded-full bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
    </main>
  )
}
