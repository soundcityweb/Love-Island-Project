"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { AdminVotingAnalytics } from "@/app/lib/api-admin"

const BAR_COLORS = [
  "#e11d48",
  "#22c55e",
  "#eab308",
  "#3b82f6",
  "#a855f7",
  "#f97316",
  "#ec4899",
  "#14b8a6",
]

const PIE_COLORS = BAR_COLORS

function formatBucketLabel(iso: string, bucket: "hour" | "day") {
  const d = new Date(iso)
  if (bucket === "hour") {
    return d.toLocaleString("en-NG", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }
  return d.toLocaleDateString("en-NG", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function shortName(name: string, max = 12) {
  return name.length > max ? `${name.slice(0, max)}…` : name
}

interface AdminResultsChartsProps {
  analytics: AdminVotingAnalytics
}

export function AdminResultsCharts({ analytics }: AdminResultsChartsProps) {
  const barData = analytics.contestants.map((c) => ({
    name: c.name,
    short: shortName(c.name, 14),
    votes: c.votes,
  }))

  const pieData = analytics.contestants.map((c) => ({
    name: c.name,
    value: c.votes,
    percentage: c.percentage,
  }))

  const lineData = analytics.timeSeries.map((t) => ({
    label: formatBucketLabel(t.bucketStart, analytics.timeSeriesBucket),
    votes: t.count,
  }))

  const hasContestants = analytics.contestants.length > 0
  const trendLabel =
    analytics.timeSeriesBucket === "hour"
      ? "Votes by hour"
      : "Votes by day"

  return (
    <div className="space-y-8">
      {/* Total — emphasized */}
      <div className="rounded-xl border border-border bg-gradient-to-br from-muted/60 to-muted/20 px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Total votes
        </p>
        <p className="mt-1 text-4xl font-black tabular-nums text-foreground">
          {analytics.totalVotes.toLocaleString()}
        </p>
      </div>

      {!hasContestants ? (
        <p className="text-center text-sm text-muted-foreground">
          Charts will appear once votes are recorded for this event.
        </p>
      ) : (
        <>
          <section aria-labelledby="votes-bar-heading">
            <h2
              id="votes-bar-heading"
              className="mb-3 text-sm font-semibold text-foreground"
            >
              Votes per islander
            </h2>
            <div className="h-[min(360px,70vw)] w-full min-h-[260px] rounded-lg border border-border bg-card p-2 sm:p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barData}
                  margin={{ top: 8, right: 8, left: 0, bottom: 48 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="short"
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    interval={0}
                    angle={-30}
                    textAnchor="end"
                    height={56}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    allowDecimals={false}
                    width={40}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [value.toLocaleString(), "Votes"]}
                    labelFormatter={(_, payload) =>
                      payload?.[0]?.payload?.name ?? ""
                    }
                  />
                  <Bar dataKey="votes" radius={[4, 4, 0, 0]}>
                    {barData.map((_, i) => (
                      <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section aria-labelledby="votes-pie-heading">
            <h2
              id="votes-pie-heading"
              className="mb-3 text-sm font-semibold text-foreground"
            >
              Share of votes (%)
            </h2>
            <div className="mx-auto h-[min(380px,85vw)] w-full max-w-lg min-h-[280px] rounded-lg border border-border bg-card p-2 sm:p-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={88}
                    paddingAngle={1}
                    label={({ name, percent }) =>
                      `${shortName(name, 10)} ${(percent * 100).toFixed(1)}%`
                    }
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number, name: string, item: { payload?: { percentage?: number } }) => [
                      `${Number(value).toLocaleString()} (${item?.payload?.percentage?.toFixed(1) ?? 0}%)`,
                      name,
                    ]}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "12px" }}
                    formatter={(value) => shortName(String(value), 18)}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section aria-labelledby="votes-trend-heading">
            <h2
              id="votes-trend-heading"
              className="mb-3 text-sm font-semibold text-foreground"
            >
              {trendLabel}
            </h2>
            <p className="mb-2 text-xs text-muted-foreground">
              Cumulative voting activity over the event window (bucket:{" "}
              {analytics.timeSeriesBucket}).
            </p>
            {lineData.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
                No vote timestamps available yet.
              </p>
            ) : (
              <div className="h-[min(320px,65vw)] w-full min-h-[220px] rounded-lg border border-border bg-card p-2 sm:p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                      interval="preserveStartEnd"
                      minTickGap={24}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      allowDecimals={false}
                      width={36}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(v: number) => [v.toLocaleString(), "Votes in period"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="votes"
                      stroke="#e11d48"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
