"use client"

import Link from "next/link"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import type { MerchAnalyticsData } from "@/app/admin/(shell)/analytics/page"

// ----- Helpers ----- //

function formatCurrency(amount: number) {
  if (amount >= 1_000_000) return `₦${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `₦${(amount / 1_000).toFixed(1)}K`
  return `₦${amount.toLocaleString("en-NG")}`
}

function formatFullCurrency(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// ----- Stat Card ----- //

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-black tabular-nums text-foreground">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  )
}

// ----- Period Selector ----- //

const PERIODS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
] as const

function PeriodSelector({ current }: { current: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card p-1">
      {PERIODS.map((p) => (
        <Link
          key={p.value}
          href={`/admin/analytics?period=${p.value}`}
          className={`rounded-md px-3 py-1.5 text-xs font-bold transition-colors ${
            current === p.value
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {p.label}
        </Link>
      ))}
    </div>
  )
}

// ----- Empty State ----- //

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
      <p className="text-sm font-medium text-foreground">No analytics data available yet.</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Analytics will appear once paid orders come in.
      </p>
    </div>
  )
}

// ----- Main Component ----- //

interface Props {
  analytics: MerchAnalyticsData | null
  currentPeriod: "daily" | "weekly" | "monthly"
}

export function MerchAnalyticsDashboard({ analytics, currentPeriod }: Props) {
  if (!analytics) return <EmptyState />

  const orderStatusEntries = Object.entries(analytics.ordersByStatus)

  return (
    <div className="space-y-8">
      {/* Period selector */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{currentPeriod}</span> view
        </p>
        <PeriodSelector current={currentPeriod} />
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Revenue"
          value={formatFullCurrency(analytics.totalRevenue)}
          sub="from paid + shipped orders"
        />
        <StatCard
          label="Total Orders"
          value={analytics.totalOrders.toLocaleString("en-NG")}
          sub="paid, shipped, delivered"
        />
        <StatCard
          label="Top Product"
          value={analytics.topProducts[0]?.name ?? "—"}
          sub={analytics.topProducts[0] ? `${analytics.topProducts[0].unitsSold} units sold` : undefined}
        />
        <StatCard
          label="Low Stock Items"
          value={analytics.lowStockProducts.length.toString()}
          sub="need restocking soon"
        />
      </div>

      {/* Revenue over time chart */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Revenue Over Time
        </h2>
        {analytics.revenueOverTime.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">No revenue data for this period.</p>
        ) : (
          <div className="mt-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.revenueOverTime} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => {
                    const d = new Date(v)
                    return currentPeriod === "daily"
                      ? `${d.getDate()}/${d.getMonth() + 1}`
                      : currentPeriod === "weekly"
                      ? `Wk ${d.getDate()}/${d.getMonth() + 1}`
                      : d.toLocaleDateString("en-NG", { month: "short", year: "2-digit" })
                  }}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => formatCurrency(v)}
                  width={70}
                />
                <Tooltip
                  formatter={(value: number) => [formatFullCurrency(value), "Revenue"]}
                  labelFormatter={(label) => new Date(label).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "hsl(var(--primary))" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top products chart */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Top Selling Products
          </h2>
          {analytics.topProducts.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">No sales data yet.</p>
          ) : (
            <div className="mt-6 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analytics.topProducts.slice(0, 6)}
                  layout="vertical"
                  margin={{ top: 0, right: 20, bottom: 0, left: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={110}
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v: string) => v.length > 14 ? v.slice(0, 14) + "…" : v}
                  />
                  <Tooltip
                    formatter={(value: number) => [value, "Units sold"]}
                  />
                  <Bar dataKey="unitsSold" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Order status breakdown */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Orders by Status
          </h2>
          {orderStatusEntries.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">No order data yet.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {orderStatusEntries.map(([status, count]) => (
                <li key={status} className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-muted/30">
                  <span className="text-sm font-medium capitalize text-card-foreground">{status}</span>
                  <span className="font-mono text-sm font-bold text-muted-foreground">{count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Low stock table */}
      {analytics.lowStockProducts.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-900/40 dark:bg-amber-950/20">
          <h2 className="text-sm font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
            Low Stock Alert ({analytics.lowStockProducts.length})
          </h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-bold text-amber-600 dark:text-amber-400">
                  <th className="pb-2">Product</th>
                  <th className="pb-2 text-right">Stock</th>
                  <th className="pb-2 text-right">Threshold</th>
                </tr>
              </thead>
              <tbody>
                {analytics.lowStockProducts.map((p) => (
                  <tr key={p.id} className="border-t border-amber-200/50 dark:border-amber-900/30">
                    <td className="py-2 font-medium text-card-foreground">{p.name}</td>
                    <td className={`py-2 text-right font-mono font-bold ${p.stock === 0 ? "text-red-600" : "text-amber-600"}`}>
                      {p.stock === 0 ? "Out of stock" : p.stock}
                    </td>
                    <td className="py-2 text-right text-muted-foreground">{p.lowStockThreshold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
