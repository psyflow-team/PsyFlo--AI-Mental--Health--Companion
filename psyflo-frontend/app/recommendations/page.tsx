"use client"

import React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useMood } from "@/lib/mood-context"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { recommendations, getRecommendationsForMood, type Recommendation } from "@/lib/recommendations"

const typeFilters = [
  { value: "all", label: "All" },
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

function RecommendationCard({ recommendation, isPersonalized }: { recommendation: Recommendation; isPersonalized: boolean }) {
  const [isStarted, setIsStarted] = useState(false)

  return (
    <Card className={cn("border-border/50 transition-all hover:shadow-md", isPersonalized && "ring-2 ring-primary/20")}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
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
          {isPersonalized && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">For you</span>
          )}
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

export default function RecommendationsPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const { getAverageMood } = useMood()
  const router = useRouter()
  const [selectedType, setSelectedType] = useState("all")

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

  const currentMoodAvg = Math.round(getAverageMood(7))
  const personalizedRecs = getRecommendationsForMood(currentMoodAvg)
  const personalizedIds = new Set(personalizedRecs.map((r) => r.id))

  const filteredRecommendations =
    selectedType === "all"
      ? recommendations
      : recommendations.filter((r) => r.type === selectedType)

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Wellness Recommendations</h1>
          <p className="text-muted-foreground mt-1">
            Personalized activities based on your mood patterns
          </p>
        </div>

        {/* Current Mood Insight */}
        <Card className="border-border/50 mb-8">
          <CardContent className="py-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary text-2xl font-bold">
                {currentMoodAvg}
              </div>
              <div>
                <p className="font-medium text-foreground">
                  Your average mood this week is {currentMoodAvg}/10
                </p>
                <p className="text-sm text-muted-foreground">
                  {currentMoodAvg <= 4
                    ? "We've selected calming and grounding exercises for you"
                    : currentMoodAvg <= 7
                      ? "Great balance! Here are activities to maintain your well-being"
                      : "You're doing great! Here are ways to channel your positive energy"}
                </p>
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
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Recommendations Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecommendations.map((rec) => (
            <RecommendationCard
              key={rec.id}
              recommendation={rec}
              isPersonalized={personalizedIds.has(rec.id)}
            />
          ))}
        </div>
      </main>
    </div>
  )
}
