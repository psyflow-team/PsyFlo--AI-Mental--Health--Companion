"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useMood } from "@/lib/mood-context"
import { Navigation } from "@/components/navigation"
import { MoodTracker } from "@/components/mood-tracker"
import { MoodChart } from "@/components/mood-chart"
import { MoodHistory } from "@/components/mood-history"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { getRecommendationsForMood, type Recommendation } from "@/lib/recommendations"

interface AIRecommendation extends Recommendation {
  isAI?: boolean
}

interface AIResponse {
  insight: string
  recommendations: AIRecommendation[]
}

export default function DashboardPage() {
  const { isAuthenticated, user, isLoading } = useAuth()
  const { moods, latestMood, getAverageMood } = useMood()
  const router = useRouter()
  
  const [aiSuggestions, setAiSuggestions] = useState<AIRecommendation[]>([])
  const [aiInsight, setAiInsight] = useState<string>("")
  const [isLoadingAI, setIsLoadingAI] = useState(false)
  const [lastFetchedMoodId, setLastFetchedMoodId] = useState<string | null>(null)

  // Fetch AI recommendations
  const fetchAIRecommendations = useCallback(async () => {
    if (moods.length === 0) return
    
    setIsLoadingAI(true)
    try {
      const response = await fetch("/api/ai/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moods: moods.slice(-14),
          userName: user?.name || "Friend",
        }),
      })

      if (response.ok) {
        const data: AIResponse = await response.json()
        setAiSuggestions(data.recommendations?.slice(0, 2) || [])
        setAiInsight(data.insight || "")
      }
    } catch (error) {
      console.error("Failed to fetch AI recommendations:", error)
      // Use fallback
      const avgMood = getAverageMood(7)
      setAiSuggestions(getRecommendationsForMood(Math.round(avgMood)).slice(0, 2).map(r => ({ ...r, isAI: false })))
    }
    setIsLoadingAI(false)
  }, [moods, user?.name, getAverageMood])

  // Fetch AI recommendations when component mounts or when a NEW mood is logged
  useEffect(() => {
    if (!isAuthenticated || isLoading) return
    
    // Check if we have a new mood that we haven't fetched for yet
    if (latestMood && latestMood.id !== lastFetchedMoodId) {
      setLastFetchedMoodId(latestMood.id)
      fetchAIRecommendations()
    } else if (!lastFetchedMoodId && moods.length > 0) {
      // Initial fetch
      setLastFetchedMoodId(moods[moods.length - 1]?.id || null)
      fetchAIRecommendations()
    }
  }, [isAuthenticated, isLoading, latestMood, lastFetchedMoodId, moods, fetchAIRecommendations])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  // Fallback recommendations if AI hasn't loaded yet
  const displayRecommendations = aiSuggestions.length > 0 
    ? aiSuggestions 
    : getRecommendationsForMood(Math.round(getAverageMood(7))).slice(0, 2)

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {greeting()}, {user?.name || "there"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {`Here's an overview of your mental wellness journey`}
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Mood Tracker */}
          <div className="lg:col-span-1 space-y-6">
            <MoodTracker />
            
            {/* Quick Recommendations Card */}
            <Card className="border-border/50 bg-gradient-to-br from-blue-500/5 to-purple-500/5">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">AI Suggestions</CardTitle>
                  <span className="inline-flex items-center gap-1 text-xs bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                    AI
                  </span>
                  {isLoadingAI && (
                    <span className="text-xs text-muted-foreground animate-pulse">Updating...</span>
                  )}
                </div>
                <CardDescription>
                  {aiInsight || "AI-powered recommendations based on your mood patterns"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoadingAI ? (
                  <>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Skeleton className="h-10 w-10 rounded-lg" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-32 mb-1" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Skeleton className="h-10 w-10 rounded-lg" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-28 mb-1" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  </>
                ) : (
                  displayRecommendations.map((rec) => (
                    <div
                      key={rec.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg shrink-0 ${
                        rec.isAI 
                          ? "bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-blue-600 dark:text-blue-400"
                          : "bg-primary/10 text-primary"
                      }`}>
                        {rec.type === "breathing" && (
                          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22c4.97 0 9-2.24 9-5s-4.03-5-9-5-9 2.24-9 5 4.03 5 9 5z" />
                            <path d="M12 12V2" />
                          </svg>
                        )}
                        {rec.type === "meditation" && (
                          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 6v6l4 2" />
                          </svg>
                        )}
                        {rec.type === "activity" && (
                          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                          </svg>
                        )}
                        {rec.type === "journaling" && (
                          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <p className="font-medium text-sm text-foreground">{rec.title}</p>
                          {rec.isAI && (
                            <svg className="w-3 h-3 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                            </svg>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{rec.duration}</p>
                      </div>
                    </div>
                  ))
                )}
                <Link href="/recommendations">
                  <Button variant="ghost" size="sm" className="w-full mt-2 gap-1">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                    View AI-Powered Recommendations
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Charts and History */}
          <div className="lg:col-span-2 space-y-6">
            <MoodChart />
            <MoodHistory />
          </div>
        </div>
      </main>
    </div>
  )
}
