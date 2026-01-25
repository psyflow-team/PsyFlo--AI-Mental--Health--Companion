"use client"

import { useMood, type MoodEntry } from "@/lib/mood-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

function getMoodColor(value: number): string {
  if (value <= 2) return "bg-red-400"
  if (value <= 4) return "bg-orange-400"
  if (value <= 6) return "bg-yellow-400"
  if (value <= 8) return "bg-green-400"
  return "bg-emerald-500"
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays} days ago`

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function MoodEntryItem({ entry }: { entry: MoodEntry }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border/50 last:border-0">
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-lg text-white font-semibold text-sm shrink-0",
          getMoodColor(entry.value)
        )}
      >
        {entry.value}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="font-medium text-foreground">{formatDate(entry.createdAt)}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(entry.createdAt).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
        </div>
        {entry.note && (
          <p className="text-sm text-muted-foreground mt-1 truncate">{entry.note}</p>
        )}
      </div>
    </div>
  )
}

export function MoodHistory() {
  const { moods } = useMood()
  const recentMoods = moods.slice(-10).reverse()

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle>Recent Entries</CardTitle>
        <CardDescription>Your latest mood check-ins</CardDescription>
      </CardHeader>
      <CardContent>
        {recentMoods.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No mood entries yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Start tracking to see your history
            </p>
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto">
            {recentMoods.map((entry) => (
              <MoodEntryItem key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
