"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useMood } from "@/lib/mood-context"
import { Navigation } from "@/components/navigation"
import { MoodTracker } from "@/components/mood-tracker"
import { MoodChart } from "@/components/mood-chart"
import { MoodHistory } from "@/components/mood-history"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getRecommendationsForMood } from "@/lib/recommendations"

export default function DashboardPage() {
  const { isAuthenticated, user, isLoading } = useAuth()
  const { getAverageMood } = useMood()
  const router = useRouter()

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
  const recommendations = getRecommendationsForMood(currentMoodAvg).slice(0, 2)

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
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Suggested for You</CardTitle>
                <CardDescription>Based on your recent mood patterns</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
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
                      <p className="font-medium text-sm text-foreground">{rec.title}</p>
                      <p className="text-xs text-muted-foreground">{rec.duration}</p>
                    </div>
                  </div>
                ))}
                <Link href="/recommendations">
                  <Button variant="ghost" size="sm" className="w-full mt-2">
                    View All Recommendations
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
