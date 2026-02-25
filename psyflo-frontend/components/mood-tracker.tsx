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

interface AIAnalysis {
  emotions: string[]
  supportiveMessage: string
  suggestion: string | null
}

export function MoodTracker() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null)
  const [note, setNote] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null)
  const { addMood } = useMood()

  const handleSubmit = async () => {
    if (selectedMood === null) return
    
    setIsAnalyzing(true)
    
    // Always get AI analysis for the mood (with or without note)
    try {
      const response = await fetch("/api/ai/analyze-mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          note: note.trim() || `I'm feeling ${selectedMood <= 4 ? 'low' : selectedMood >= 7 ? 'good' : 'okay'} today.`, 
          moodValue: selectedMood 
        }),
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.analysis) {
          setAiAnalysis(data.analysis)
        }
      }
    } catch (error) {
      console.error("Failed to analyze mood:", error)
      // Set a fallback analysis
      setAiAnalysis({
        emotions: selectedMood <= 4 ? ["challenged", "reflective"] : selectedMood >= 7 ? ["positive", "hopeful"] : ["balanced", "calm"],
        supportiveMessage: selectedMood <= 4 
          ? "It's okay to have difficult days. Taking time to check in with yourself is an important step." 
          : selectedMood >= 7 
            ? "Wonderful! Your positive energy is something to celebrate. Keep nurturing what brings you joy."
            : "You're in a balanced space right now. This is a good time for self-reflection or trying something new.",
        suggestion: selectedMood <= 4 
          ? "Consider a short breathing exercise to help ease any tension."
          : selectedMood >= 7
            ? "Share your positivity with someone you care about today."
            : "A mindful walk could help maintain this sense of balance."
      })
    }
    
    // Add mood after AI analysis starts (now async with Firestore)
    await addMood(selectedMood, note)
    
    setIsAnalyzing(false)
    setIsSubmitted(true)
    
    // Show the result longer so user can read AI feedback
    setTimeout(() => {
      setIsSubmitted(false)
      setSelectedMood(null)
      setNote("")
      setAiAnalysis(null)
    }, 5000)
  }

  const selectedMoodData = selectedMood !== null ? moodLabels.find((m) => m.value === selectedMood) : null

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>How are you feeling?</CardTitle>
          <span className="inline-flex items-center gap-1 text-xs bg-linear-to-r from-blue-500/10 to-purple-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            AI
          </span>
        </div>
        <CardDescription>Track your mood and get AI-powered insights</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isSubmitted ? (
          <div className="text-center py-6">
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
            <p className="text-sm text-muted-foreground mb-4">Thank you for checking in</p>
            
            {/* AI Analysis Response */}
            {aiAnalysis && (
              <div className="mt-4 p-4 rounded-lg bg-linear-to-br from-blue-500/5 to-purple-500/5 border border-blue-500/20 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">AI Insight</span>
                </div>
                
                {aiAnalysis.emotions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {aiAnalysis.emotions.map((emotion, i) => (
                      <span key={i} className="text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                        {emotion}
                      </span>
                    ))}
                  </div>
                )}
                
                <p className="text-sm text-foreground">{aiAnalysis.supportiveMessage}</p>
                
                {aiAnalysis.suggestion && (
                  <p className="text-sm text-muted-foreground mt-2 italic">
                    Suggestion: {aiAnalysis.suggestion}
                  </p>
                )}
              </div>
            )}
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
                Add a note (AI will provide personalized feedback)
              </label>
              <Textarea
                id="mood-note"
                placeholder="What's contributing to how you feel today?"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="resize-none"
                rows={3}
              />
              {note.length > 0 && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <svg className="w-3 h-3 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                  AI will analyze your note and provide supportive feedback
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={selectedMood === null || isAnalyzing}
              className="w-full"
            >
              {isAnalyzing ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Analyzing with AI...
                </span>
              ) : (
                "Log Mood"
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
