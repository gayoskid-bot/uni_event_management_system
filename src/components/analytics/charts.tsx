"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  AreaChart,
  Area,
  Cell,
} from "recharts"

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

function ChartTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number; payload: { label: string } }[] }) {
  if (!active || !payload?.length) return null
  const entry = payload[0]
  return (
    <div className="rounded-md border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="font-medium">{entry.payload.label}</p>
      <p className="text-muted-foreground">{entry.value.toLocaleString()}</p>
    </div>
  )
}

export function CategoryBarChart({
  data,
}: {
  data: { label: string; value: number }[]
}) {
  const height = Math.max(160, data.length * 44)
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 28, bottom: 4, left: 4 }}>
        <CartesianGrid horizontal={false} stroke="var(--border)" strokeDasharray="3 3" />
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="label"
          width={100}
          tickLine={false}
          axisLine={false}
          tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
        />
        <Tooltip cursor={{ fill: "var(--accent)" }} content={<ChartTooltip />} />
        <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={20}>
          {data.map((entry, index) => (
            <Cell key={entry.label} fill={CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
          <LabelList
            dataKey="value"
            position="right"
            style={{ fill: "var(--foreground)", fontSize: 12, fontWeight: 500 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function RegistrationsTrendChart({
  data,
}: {
  data: { label: string; value: number }[]
}) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -20 }}>
        <defs>
          <linearGradient id="registrationsFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
          interval="preserveStartEnd"
        />
        <YAxis
          allowDecimals={false}
          tickLine={false}
          axisLine={false}
          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
          width={28}
        />
        <Tooltip cursor={{ stroke: "var(--chart-1)", strokeWidth: 1 }} content={<ChartTooltip />} />
        <Area
          type="monotone"
          dataKey="value"
          stroke="var(--chart-1)"
          strokeWidth={2}
          fill="url(#registrationsFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
