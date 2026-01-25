"use client"

import { useState } from "react"
import { useMood } from "@/lib/mood-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

const moodLabels = [
  { value: 1, label: "Very Low", color: "bg-red-400" },
  { value: 2, label: "Low", color: "bg-red-300" },
  { value: 3, label: "Poor", color: "bg-orange-400" },
  { value: 4, label: "Below Average", color: "bg-orange-300" },
  { value: 5, label: "Neutral", color: "bg-yellow-400" },
  { value: 6, label: "Okay", color: "bg-yellow-300" },
  { value: 7, label: "Good", color: "bg-green-300" },
  { value: 8, label: "Great", color: "bg-green-400" },
  { value: 9, label: "Excellent", color: "bg-emerald-400" },
  { value: 10, label: "Amazing", color: "bg-emerald-500" },
]

export function MoodTracker() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null)
  const [note, setNote] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { addMood } = useMood()

  const handleSubmit = () => {
    if (selectedMood === null) return
    addMood(selectedMood, note)
    setIsSubmitted(true)
    setTimeout(() => {
      setIsSubmitted(false)
      setSelectedMood(null)
      setNote("")
    }, 2000)
  }

  const selectedMoodData = selectedMood !== null ? moodLabels.find((m) => m.value === selectedMood) : null

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle>How are you feeling?</CardTitle>
        <CardDescription>Track your mood to understand your emotional patterns</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isSubmitted ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-8 w-8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <p className="text-lg font-medium text-foreground">Mood logged!</p>
            <p className="text-sm text-muted-foreground">Thank you for checking in</p>
          </div>
        ) : (
          <>
            {/* Mood Scale */}
            <div className="space-y-3">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Very Low</span>
                <span>Amazing</span>
              </div>
              <div className="flex gap-1.5">
                {moodLabels.map((mood) => (
                  <button
                    type="button"
                    key={mood.value}
                    onClick={() => setSelectedMood(mood.value)}
                    className={cn(
                      "flex-1 h-12 rounded-lg transition-all",
                      mood.color,
                      selectedMood === mood.value
                        ? "ring-2 ring-offset-2 ring-primary scale-110"
                        : "opacity-60 hover:opacity-100"
                    )}
                    aria-label={`Mood ${mood.value}: ${mood.label}`}
                  />
                ))}
              </div>
              {selectedMoodData && (
                <p className="text-center text-sm font-medium">
                  {selectedMoodData.value}/10 - {selectedMoodData.label}
                </p>
              )}
            </div>

            {/* Note Input */}
            <div className="space-y-2">
              <label htmlFor="mood-note" className="text-sm font-medium text-foreground">
                Add a note (optional)
              </label>
              <Textarea
                id="mood-note"
                placeholder="What's contributing to how you feel today?"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="resize-none"
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={selectedMood === null}
              className="w-full"
            >
              Log Mood
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
