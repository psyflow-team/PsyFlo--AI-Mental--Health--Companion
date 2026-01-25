"use client"

import { useMemo, useState } from "react"
import { useMood } from "@/lib/mood-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts"

type TimeRange = "7d" | "14d" | "30d"

const timeRanges: { value: TimeRange; label: string }[] = [
  { value: "7d", label: "7 Days" },
  { value: "14d", label: "14 Days" },
  { value: "30d", label: "30 Days" },
]

export function MoodChart() {
  const [timeRange, setTimeRange] = useState<TimeRange>("7d")
  const { moods, getMoodTrend, getAverageMood } = useMood()

  const chartData = useMemo(() => {
    const days = timeRange === "7d" ? 7 : timeRange === "14d" ? 14 : 30
    const recentMoods = moods.slice(-days)

    return recentMoods.map((mood) => {
      const date = new Date(mood.createdAt)
      return {
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        value: mood.value,
        note: mood.note,
      }
    })
  }, [moods, timeRange])

  const trend = getMoodTrend()
  const average = getAverageMood(timeRange === "7d" ? 7 : timeRange === "14d" ? 14 : 30)

  const trendConfig = {
    improving: { label: "Improving", color: "text-green-600", icon: "↑" },
    stable: { label: "Stable", color: "text-blue-600", icon: "→" },
    declining: { label: "Declining", color: "text-orange-600", icon: "↓" },
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Mood Trends</CardTitle>
            <CardDescription>Your emotional patterns over time</CardDescription>
          </div>
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            {timeRanges.map((range) => (
              <button
                key={range.value}
                type="button"
                onClick={() => setTimeRange(range.value)}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                  timeRange === range.value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Average Mood</p>
            <p className="text-2xl font-bold text-foreground">{average.toFixed(1)}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Trend</p>
            <p className={cn("text-2xl font-bold", trendConfig[trend].color)}>
              {trendConfig[trend].icon} {trendConfig[trend].label}
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.55 0.12 200)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="oklch(0.55 0.12 200)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
                className="fill-muted-foreground"
              />
              <YAxis
                domain={[0, 10]}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
                className="fill-muted-foreground"
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="bg-popover border border-border rounded-lg shadow-lg p-3">
                        <p className="font-medium">{data.date}</p>
                        <p className="text-primary">Mood: {data.value}/10</p>
                        {data.note && (
                          <p className="text-sm text-muted-foreground mt-1">{data.note}</p>
                        )}
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="oklch(0.55 0.12 200)"
                strokeWidth={2}
                fill="url(#moodGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
