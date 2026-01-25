"use client"

import React from "react"
import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useMood } from "@/lib/mood-context"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { recommendations, getRecommendationsForMood, type Recommendation } from "@/lib/recommendations"
import { Skeleton } from "@/components/ui/skeleton"

interface AIRecommendation {
  id: string
  title: string
  description: string
  type: "breathing" | "meditation" | "activity" | "journaling"
  duration: string
  isAI?: boolean
}

interface AIResponse {
  insight: string
  recommendations: AIRecommendation[]
  avgMood: string
  trend: string
}

const typeFilters = [
  { value: "all", label: "All" },
  { value: "ai", label: "AI Powered" },
  { value: "breathing", label: "Breathing" },
  { value: "meditation", label: "Meditation" },
  { value: "activity", label: "Activities" },
  { value: "journaling", label: "Journaling" },
]

const typeIcons: Record<string, React.ReactNode> = {
  breathing: (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22c4.97 0 9-2.24 9-5s-4.03-5-9-5-9 2.24-9 5 4.03 5 9 5z" />
      <path d="M12 12V2" />
    </svg>
  ),
  meditation: (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  ),
  activity: (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  ),
  journaling: (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
}

function AIBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-xs bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full border border-blue-500/20">
      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
      AI Generated
    </span>
  )
}

function RecommendationCard({ recommendation, isAI }: { recommendation: AIRecommendation | Recommendation; isAI: boolean }) {
  const [isStarted, setIsStarted] = useState(false)

  return (
    <Card className={cn(
      "border-border/50 transition-all hover:shadow-md",
      isAI && "ring-2 ring-blue-500/20 bg-gradient-to-br from-blue-500/5 to-purple-500/5"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg",
              isAI ? "bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-blue-600 dark:text-blue-400" : "bg-primary/10 text-primary"
            )}>
              {typeIcons[recommendation.type]}
            </div>
            <div>
              <CardTitle className="text-base">{recommendation.title}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground capitalize">{recommendation.type}</span>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground">{recommendation.duration}</span>
              </div>
            </div>
          </div>
          {isAI && <AIBadge />}
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="mb-4">{recommendation.description}</CardDescription>
        <Button
          onClick={() => setIsStarted(!isStarted)}
          variant={isStarted ? "secondary" : "default"}
          size="sm"
          className="w-full"
        >
          {isStarted ? "Started - Mark Complete" : "Try Now"}
        </Button>
      </CardContent>
    </Card>
  )
}

function LoadingSkeleton() {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-12 w-full mb-4" />
        <Skeleton className="h-9 w-full" />
      </CardContent>
    </Card>
  )
}

export default function RecommendationsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const { moods, getAverageMood } = useMood()
  const router = useRouter()
  const [selectedType, setSelectedType] = useState("all")
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState(false)

  const fetchAIRecommendations = useCallback(async () => {
    setAiLoading(true)
    setAiError(false)
    try {
      const response = await fetch("/api/ai/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moods,
          userName: user?.name,
        }),
      })
      
      if (!response.ok) throw new Error("Failed to fetch")
      
      const data = await response.json()
      setAiResponse(data)
    } catch (error) {
      console.error("Failed to fetch AI recommendations:", error)
      setAiError(true)
    } finally {
      setAiLoading(false)
    }
  }, [moods, user?.name])

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, authLoading, router])

  useEffect(() => {
    if (isAuthenticated && moods.length > 0) {
      fetchAIRecommendations()
    }
  }, [isAuthenticated, moods.length, fetchAIRecommendations])

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  const currentMoodAvg = Math.round(getAverageMood(7))
  const staticRecs = getRecommendationsForMood(currentMoodAvg)

  // Combine AI recommendations with static ones
  const allRecommendations: (AIRecommendation | Recommendation)[] = [
    ...(aiResponse?.recommendations || []),
    ...staticRecs,
  ]

  const filteredRecommendations = selectedType === "all"
    ? allRecommendations
    : selectedType === "ai"
      ? aiResponse?.recommendations || []
      : allRecommendations.filter((r) => r.type === selectedType)

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Wellness Recommendations</h1>
            <span className="inline-flex items-center gap-1 text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white px-2 py-1 rounded-full">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              AI Powered
            </span>
          </div>
          <p className="text-muted-foreground">
            Personalized activities generated by AI based on your mood patterns
          </p>
        </div>

        {/* AI Insight Card */}
        <Card className="border-border/50 mb-8 bg-gradient-to-br from-blue-500/5 to-purple-500/5">
          <CardContent className="py-6">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-blue-600 dark:text-blue-400">
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <div className="flex-1">
                {aiLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ) : aiError ? (
                  <div>
                    <p className="font-medium text-foreground">AI Analysis</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Could not connect to AI. Showing personalized recommendations based on your mood average of {currentMoodAvg}/10.
                    </p>
                    <Button variant="outline" size="sm" className="mt-3 bg-transparent" onClick={fetchAIRecommendations}>
                      Retry AI Analysis
                    </Button>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-medium text-foreground">AI Insight</p>
                      <span className="text-xs text-muted-foreground">
                        Avg mood: {aiResponse?.avgMood || currentMoodAvg}/10 · Trend: {aiResponse?.trend || "stable"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {aiResponse?.insight || `Based on your recent mood data, here are personalized recommendations to support your well-being.`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Type Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {typeFilters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setSelectedType(filter.value)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap",
                selectedType === filter.value
                  ? filter.value === "ai"
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                    : "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Recommendations Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {aiLoading && selectedType !== "ai" ? (
            <>
              <LoadingSkeleton />
              <LoadingSkeleton />
              <LoadingSkeleton />
              <LoadingSkeleton />
            </>
          ) : (
            filteredRecommendations.map((rec) => (
              <RecommendationCard
                key={rec.id}
                recommendation={rec}
                isAI={"isAI" in rec && rec.isAI === true}
              />
            ))
          )}
          {selectedType === "ai" && !aiLoading && filteredRecommendations.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No AI recommendations available yet.</p>
              <Button variant="outline" className="mt-4 bg-transparent" onClick={fetchAIRecommendations}>
                Generate AI Recommendations
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
