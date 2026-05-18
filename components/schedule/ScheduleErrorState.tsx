"use client"

export function ScheduleErrorState({
  message,
  onRetry,
}: {
  message: string
  onRetry: () => void
}) {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-10 text-center"
    >
      <p className="font-medium text-destructive">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 rounded-full bg-destructive px-5 py-2 text-sm font-semibold text-destructive-foreground hover:bg-destructive/90"
      >
        Try again
      </button>
    </div>
  )
}
