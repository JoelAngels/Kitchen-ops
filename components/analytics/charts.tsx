"use client"

import { motion } from "motion/react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { formatNumber } from "@/lib/format"
import { formatKES } from "@/lib/tamu-data"

const compactKES = (v: number) =>
  v >= 1000 ? `${Math.round(v / 1000)}k` : String(v)

const revenueConfig = {
  revenue: { label: "Revenue", color: "var(--chart-1)" },
  orders: { label: "Orders", color: "var(--chart-1)" },
} satisfies ChartConfig

export function RevenueAreaChart({
  data,
}: {
  data: { label: string; revenue: number }[]
}) {
  return (
    <ChartContainer
      config={revenueConfig}
      className="aspect-auto h-[260px] w-full"
    >
      <AreaChart data={data} margin={{ left: 0, right: 8, top: 8 }}>
        <defs>
          <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-revenue)"
              stopOpacity={0.28}
            />
            <stop
              offset="95%"
              stopColor="var(--color-revenue)"
              stopOpacity={0.02}
            />
          </linearGradient>
        </defs>
        <CartesianGrid
          vertical={false}
          strokeDasharray="3 3"
          strokeOpacity={0.6}
        />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={24}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={40}
          tickFormatter={compactKES}
        />
        <ChartTooltip
          cursor={{ strokeDasharray: "4 4" }}
          content={
            <ChartTooltipContent
              indicator="line"
              formatter={(value) => (
                <span className="flex w-full justify-between gap-4">
                  <span className="text-muted-foreground">Revenue</span>
                  <span className="font-mono font-medium tabular-nums">
                    {formatKES(Number(value))}
                  </span>
                </span>
              )}
            />
          }
        />
        <Area
          dataKey="revenue"
          type="monotone"
          fill="url(#fillRevenue)"
          stroke="var(--color-revenue)"
          strokeWidth={2}
          animationDuration={900}
          animationEasing="ease-out"
          activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--background)" }}
        />
      </AreaChart>
    </ChartContainer>
  )
}

export function SimpleBarChart({
  data,
  dataKey,
  label,
  money = false,
}: {
  data: Record<string, string | number>[]
  dataKey: string
  label: string
  money?: boolean
}) {
  const config = {
    [dataKey]: { label, color: "var(--chart-1)" },
  } satisfies ChartConfig
  return (
    <ChartContainer config={config} className="aspect-auto h-[240px] w-full">
      <BarChart
        data={data}
        margin={{ left: 0, right: 8, top: 8 }}
        barCategoryGap="22%"
      >
        <CartesianGrid
          vertical={false}
          strokeDasharray="3 3"
          strokeOpacity={0.6}
        />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={8}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={40}
          tickFormatter={money ? compactKES : undefined}
        />
        <ChartTooltip
          cursor={{ fill: "var(--muted)", opacity: 0.6 }}
          content={
            <ChartTooltipContent
              formatter={(value) => (
                <span className="flex w-full justify-between gap-4">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-mono font-medium tabular-nums">
                    {money
                      ? formatKES(Number(value))
                      : formatNumber(Number(value))}
                  </span>
                </span>
              )}
            />
          }
        />
        <Bar
          dataKey={dataKey}
          fill={`var(--color-${dataKey})`}
          radius={[4, 4, 0, 0]}
          animationDuration={800}
        />
      </BarChart>
    </ChartContainer>
  )
}

/** Ranked horizontal bars, direct-labelled; one hue because it encodes magnitude, not identity. */
export function ShareBars({
  rows,
}: {
  rows: { name: string; value: number; share: number }[]
}) {
  const max = Math.max(...rows.map((r) => r.share), 0.0001)
  return (
    <ul className="flex flex-col gap-3.5">
      {rows.map((row, i) => (
        <li
          key={row.name}
          className="group flex flex-col gap-1.5"
          title={`${row.name}: ${formatKES(row.value)}`}
        >
          <div className="flex items-baseline justify-between gap-2 text-sm">
            <span className="font-medium">{row.name}</span>
            <span className="text-muted-foreground tabular-nums">
              {formatKES(row.value)}{" "}
              <span className="text-xs">· {Math.round(row.share * 100)}%</span>
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-chart-1 transition-[filter] group-hover:brightness-110"
              initial={{ width: 0 }}
              animate={{ width: `${(row.share / max) * 100}%` }}
              transition={{
                delay: 0.1 + i * 0.06,
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1],
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}
