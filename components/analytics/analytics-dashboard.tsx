"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import {
  ArrowDownRightIcon,
  ArrowUpRightIcon,
  ChartColumnIcon,
  DownloadIcon,
  FileSpreadsheetIcon,
  StoreIcon,
  TimerIcon,
} from "lucide-react"
import { toast } from "sonner"

import {
  RevenueAreaChart,
  ShareBars,
  SimpleBarChart,
} from "@/components/analytics/charts"
import { useAppState } from "@/components/app-state-provider"
import { AnimatedNumber } from "@/components/motion/animated-number"
import { Reveal, RevealItem } from "@/components/motion/reveal"
import { LineTabs } from "@/components/line-tabs"
import { PageHeader } from "@/components/page-header"
import { Segmented } from "@/components/segmented"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  RANGE_OPTIONS,
  getAnalytics,
  type AnalyticsData,
  type Range,
  type Scope,
} from "@/lib/analytics-mock"
import { formatNumber } from "@/lib/format"
import { MENU_CATEGORIES, formatKES } from "@/lib/tamu-data"
import { cn } from "@/lib/utils"

type Tab = "sales" | "trends" | "boh"
type SalesView = "summary" | "types" | "payments"

export function AnalyticsDashboard() {
  const { branch } = useAppState()
  const [scope, setScope] = React.useState<Scope>("branch")
  const [range, setRange] = React.useState<Range>("today")
  const [tab, setTab] = React.useState<Tab>("sales")

  const data = React.useMemo(
    () => getAnalytics(branch.id, scope, range),
    [branch.id, scope, range]
  )
  const rangeLabel = RANGE_OPTIONS.find((o) => o.value === range)!.label
  const where = scope === "all" ? "All branches" : branch.name

  const exportFile = (kind: "Excel" | "PDF") =>
    toast.promise(new Promise((res) => setTimeout(res, 1200)), {
      loading: `Preparing ${kind} export…`,
      success: `${where} · ${rangeLabel} exported to ${kind}`,
      error: "Export failed",
    })

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 p-4 lg:p-8">
      <PageHeader
        icon={ChartColumnIcon}
        title="Analytics"
        description="Sales, trends and kitchen performance"
        back={{ href: "/admin", label: "Back to Admin" }}
        actions={
          <>
            <Button variant="outline" onClick={() => exportFile("Excel")}>
              <FileSpreadsheetIcon />
              Export Excel
            </Button>
            <Button onClick={() => exportFile("PDF")}>
              <DownloadIcon />
              Export PDF
            </Button>
          </>
        }
      />

      {/* One row of filters above all charts */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex flex-wrap items-center gap-3 rounded-2xl border bg-card p-3 shadow-xs"
      >
        <div className="flex items-center gap-2 text-sm">
          <StoreIcon className="size-4 text-muted-foreground" />
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={where}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="font-medium"
            >
              {where}
            </motion.span>
          </AnimatePresence>
        </div>
        <Segmented<Scope>
          ariaLabel="Scope"
          size="sm"
          value={scope}
          onChange={setScope}
          options={[
            { value: "branch", label: "This branch" },
            { value: "all", label: "All branches" },
          ]}
        />
        <div className="ml-auto max-w-full overflow-x-auto">
          <Segmented<Range>
            ariaLabel="Date range"
            size="sm"
            value={range}
            onChange={setRange}
            options={RANGE_OPTIONS.map((o) => ({
              value: o.value,
              label: o.label,
            }))}
          />
        </div>
      </motion.div>

      <LineTabs<Tab>
        value={tab}
        onChange={setTab}
        options={[
          { value: "sales", label: "Sales" },
          { value: "trends", label: "Trends" },
          { value: "boh", label: "BOH Stations" },
        ]}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          {tab === "sales" && <SalesTab data={data} rangeLabel={rangeLabel} />}
          {tab === "trends" && <TrendsTab data={data} />}
          {tab === "boh" && <BohTab data={data} />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function Delta({ value }: { value: number }) {
  const up = value >= 0
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-medium tabular-nums",
        up ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
      )}
    >
      {up ? (
        <ArrowUpRightIcon className="size-3" />
      ) : (
        <ArrowDownRightIcon className="size-3" />
      )}
      {Math.abs(value)}%
    </span>
  )
}

function KpiTile({
  label,
  value,
  delta,
  format,
  hint,
}: {
  label: string
  value: number
  delta: number
  format: (n: number) => string
  hint?: string
}) {
  return (
    <RevealItem>
      <motion.div
        whileHover={{ y: -2 }}
        className="relative h-full overflow-hidden rounded-2xl border bg-card p-4 shadow-xs transition-shadow hover:shadow-md"
      >
        <div className="pointer-events-none absolute -top-10 -right-10 size-28 rounded-full bg-chart-1/10 blur-2xl" />
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{label}</span>
          <Delta value={delta} />
        </div>
        <AnimatedNumber
          value={value}
          format={format}
          className="mt-2 block text-2xl font-semibold tracking-tight tabular-nums lg:text-3xl"
        />
        {hint && (
          <span className="mt-1 block text-xs text-muted-foreground">
            {hint}
          </span>
        )}
      </motion.div>
    </RevealItem>
  )
}

function SalesTab({
  data,
  rangeLabel,
}: {
  data: AnalyticsData
  rangeLabel: string
}) {
  const [view, setView] = React.useState<SalesView>("summary")
  const [category, setCategory] = React.useState<string | null>(null)
  const items = category
    ? data.topItems.filter((i) => i.category === category)
    : data.topItems

  return (
    <div className="flex flex-col gap-5">
      <Reveal className="grid grid-cols-2 gap-3 lg:grid-cols-4" stagger={0.06}>
        <KpiTile
          label="Revenue"
          value={data.kpis.revenue.value}
          delta={data.kpis.revenue.delta}
          format={formatKES}
          hint="Gross, vs previous period"
        />
        <KpiTile
          label="Avg order"
          value={data.kpis.avgOrder.value}
          delta={data.kpis.avgOrder.delta}
          format={formatKES}
        />
        <KpiTile
          label="Orders"
          value={data.kpis.orders.value}
          delta={data.kpis.orders.delta}
          format={formatNumber}
        />
        <KpiTile
          label="Items sold"
          value={data.kpis.items.value}
          delta={data.kpis.items.delta}
          format={formatNumber}
          hint={`${(data.kpis.items.value / Math.max(data.kpis.orders.value, 1)).toFixed(1)} per order`}
        />
      </Reveal>

      <div className="grid gap-4 xl:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="xl:col-span-2"
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Revenue · {rangeLabel}</CardTitle>
              <CardDescription>
                {data.series.length > 13 ? "Per day" : "Per hour"}, completed
                orders
              </CardDescription>
            </CardHeader>
            <CardContent className="px-2 sm:px-4">
              <RevenueAreaChart data={data.series} />
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
        >
          <Card className="h-full">
            <CardHeader className="gap-3">
              <CardTitle>Breakdown</CardTitle>
              <Segmented<SalesView>
                size="sm"
                ariaLabel="Breakdown"
                value={view}
                onChange={setView}
                options={[
                  { value: "summary", label: "Order types" },
                  { value: "payments", label: "Payments" },
                ]}
              />
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                <motion.div
                  key={view}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.2 }}
                >
                  <ShareBars
                    rows={view === "payments" ? data.payments : data.orderTypes}
                  />
                </motion.div>
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.34 }}
      >
        <Card>
          <CardHeader className="gap-3">
            <CardTitle>Top items</CardTitle>
            <div className="flex flex-wrap gap-1.5">
              {[null, ...MENU_CATEGORIES].map((c) => {
                const active = category === c
                return (
                  <button
                    key={c ?? "all"}
                    onClick={() => setCategory(c)}
                    className={cn(
                      "relative isolate rounded-full border px-3 py-1 text-sm transition-colors",
                      active
                        ? "border-transparent text-background"
                        : "text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="cat-chip"
                        className="absolute inset-0 -z-10 rounded-full bg-foreground"
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 38,
                        }}
                      />
                    )}
                    {c ?? "All"}
                  </button>
                )
              })}
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="pb-2 font-medium">Item</th>
                    <th className="pb-2 font-medium">Category</th>
                    <th className="pb-2 text-right font-medium">Sold</th>
                    <th className="pb-2 text-right font-medium">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout" initial={false}>
                    {items.slice(0, 8).map((item, i) => (
                      <motion.tr
                        key={item.name}
                        layout
                        initial={{ opacity: 0, x: -8 }}
                        animate={{
                          opacity: 1,
                          x: 0,
                          transition: { delay: i * 0.03 },
                        }}
                        exit={{ opacity: 0 }}
                        className="border-b last:border-0 hover:bg-muted/50"
                      >
                        <td className="py-2.5 font-medium">{item.name}</td>
                        <td className="py-2.5 text-muted-foreground">
                          {item.category}
                        </td>
                        <td className="py-2.5 text-right tabular-nums">
                          {formatNumber(item.sold)}
                        </td>
                        <td className="py-2.5 text-right font-medium tabular-nums">
                          {formatKES(item.revenue)}
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
              {items.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No sales in this category.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

function TrendsTab({ data }: { data: AnalyticsData }) {
  return (
    <Reveal className="grid gap-4 lg:grid-cols-2" stagger={0.08}>
      <RevealItem>
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Busiest hours</CardTitle>
            <CardDescription>Average orders per hour</CardDescription>
          </CardHeader>
          <CardContent className="px-2 sm:px-4">
            <SimpleBarChart
              data={data.busiestHours}
              dataKey="orders"
              label="Orders"
            />
          </CardContent>
        </Card>
      </RevealItem>
      <RevealItem>
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Revenue by weekday</CardTitle>
            <CardDescription>Average across the last 4 weeks</CardDescription>
          </CardHeader>
          <CardContent className="px-2 sm:px-4">
            <SimpleBarChart
              data={data.weekdays}
              dataKey="revenue"
              label="Revenue"
              money
            />
          </CardContent>
        </Card>
      </RevealItem>
    </Reveal>
  )
}

function BohTab({ data }: { data: AnalyticsData }) {
  return (
    <Reveal className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" stagger={0.07}>
      {data.stations.map((s) => {
        const over = s.avg > s.target
        const pct = Math.min(100, (s.avg / (s.target * 1.5)) * 100)
        return (
          <RevealItem key={s.name}>
            <div className="flex h-full flex-col gap-3 rounded-2xl border bg-card p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="font-medium">{s.name}</span>
                <TimerIcon className="size-4 text-muted-foreground" />
              </div>
              <div className="flex items-baseline gap-1">
                <AnimatedNumber
                  value={s.avg}
                  format={(n) => n.toFixed(1)}
                  className="text-3xl font-semibold tabular-nums"
                />
                <span className="text-sm text-muted-foreground">min avg</span>
              </div>
              <div className="relative h-2 rounded-full bg-muted">
                <motion.div
                  className={cn(
                    "h-full rounded-full",
                    over ? "bg-destructive" : "bg-success"
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{
                    duration: 0.9,
                    ease: [0.22, 1, 0.36, 1],
                    delay: 0.2,
                  }}
                />
                <span
                  className="absolute -top-1 h-4 w-0.5 rounded bg-foreground/60"
                  style={{ left: `${(1 / 1.5) * 100}%` }}
                  title={`Target ${s.target} min`}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span
                  className={cn(
                    "font-medium",
                    over ? "text-destructive" : "text-success"
                  )}
                >
                  {over ? "▲ Over target" : "● On target"} ({s.target} min)
                </span>
                <span className="tabular-nums">
                  {formatNumber(s.tickets)} tickets
                </span>
              </div>
            </div>
          </RevealItem>
        )
      })}
    </Reveal>
  )
}
