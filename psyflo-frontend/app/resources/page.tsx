"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"

const breathingExercises = [
  {
    name: "4-7-8 Technique",
    description: "Inhale for 4 seconds, hold for 7 seconds, exhale for 8 seconds. Repeat 3-4 times.",
    benefit: "Reduces anxiety and helps with sleep",
  },
  {
    name: "Box Breathing",
    description: "Inhale for 4 seconds, hold for 4 seconds, exhale for 4 seconds, hold for 4 seconds.",
    benefit: "Improves focus and reduces stress",
  },
  {
    name: "Diaphragmatic Breathing",
    description: "Breathe deeply into your belly, letting it rise. Exhale slowly and completely.",
    benefit: "Activates relaxation response",
  },
]

const meditationGuides = [
  {
    name: "Body Scan",
    description: "Focus attention on each part of your body, from toes to head, releasing tension.",
    duration: "10-15 min",
  },
  {
    name: "Loving-Kindness",
    description: "Send compassionate wishes to yourself and others through guided visualization.",
    duration: "10-20 min",
  },
  {
    name: "Mindful Awareness",
    description: "Focus on your breath and present moment, gently returning when mind wanders.",
    duration: "5-30 min",
  },
]

const stressTips = [
  {
    title: "Move Your Body",
    description: "Even a short walk can help reduce stress hormones and improve mood.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
  {
    title: "Connect with Others",
    description: "Social support is one of the most effective stress buffers.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    title: "Limit Screen Time",
    description: "Take regular breaks from devices, especially before bed.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  },
  {
    title: "Prioritize Sleep",
    description: "Aim for 7-9 hours of quality sleep each night.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    ),
  },
]

const crisisResources = [
  {
    name: "National Suicide Prevention Lifeline",
    contact: "988",
    description: "24/7 free and confidential support for people in distress",
  },
  {
    name: "Crisis Text Line",
    contact: "Text HOME to 741741",
    description: "Free 24/7 support via text message",
  },
  {
    name: "SAMHSA National Helpline",
    contact: "1-800-662-4357",
    description: "Free, confidential, 24/7, treatment referral and information service",
  },
]

function BreathingTimer() {
  const [isActive, setIsActive] = useState(false)
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale" | "rest">("inhale")
  const [count, setCount] = useState(4)

  const startExercise = () => {
    setIsActive(true)
    setPhase("inhale")
    setCount(4)

    const runCycle = () => {
      let currentPhase: "inhale" | "hold" | "exhale" | "rest" = "inhale"
      let currentCount = 4

      const tick = () => {
        currentCount--
        setCount(currentCount)

        if (currentCount === 0) {
          if (currentPhase === "inhale") {
            currentPhase = "hold"
            currentCount = 7
          } else if (currentPhase === "hold") {
            currentPhase = "exhale"
            currentCount = 8
          } else if (currentPhase === "exhale") {
            currentPhase = "rest"
            currentCount = 2
          } else {
            setIsActive(false)
            return
          }
          setPhase(currentPhase)
          setCount(currentCount)
        }

        if (currentCount > 0) {
          setTimeout(tick, 1000)
        }
      }

      setTimeout(tick, 1000)
    }

    runCycle()
  }

  return (
    <Card className="border-border/50 bg-primary/5">
      <CardContent className="py-8">
        <div className="text-center">
          {isActive ? (
            <>
              <div
                className={cn(
                  "mx-auto w-32 h-32 rounded-full flex items-center justify-center transition-all duration-1000",
                  phase === "inhale" && "bg-primary/20 scale-110",
                  phase === "hold" && "bg-primary/30 scale-110",
                  phase === "exhale" && "bg-primary/10 scale-90",
                  phase === "rest" && "bg-muted scale-100"
                )}
              >
                <span className="text-4xl font-bold text-primary">{count}</span>
              </div>
              <p className="mt-4 text-lg font-medium text-foreground capitalize">{phase}</p>
              <p className="text-sm text-muted-foreground">
                {phase === "inhale" && "Breathe in slowly..."}
                {phase === "hold" && "Hold your breath..."}
                {phase === "exhale" && "Breathe out slowly..."}
                {phase === "rest" && "Pause briefly..."}
              </p>
            </>
          ) : (
            <>
              <div className="mx-auto w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" className="h-12 w-12 text-primary" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22c4.97 0 9-2.24 9-5s-4.03-5-9-5-9 2.24-9 5 4.03 5 9 5z" />
                  <path d="M12 12V2" />
                </svg>
              </div>
              <p className="mt-4 text-lg font-medium text-foreground">Ready to begin?</p>
              <p className="text-sm text-muted-foreground mb-4">Try the 4-7-8 breathing technique</p>
              <Button onClick={startExercise}>Start Breathing Exercise</Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function ResourcesPage() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      {isAuthenticated && <Navigation />}

      {!isAuthenticated && (
        <header className="border-b border-border/40 bg-background/95 backdrop-blur">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-5 w-5 text-primary-foreground"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2z" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
              <span className="text-xl font-semibold text-foreground">Psyflo</span>
            </div>
            <Button variant="outline" asChild>
              <a href="/login">Sign In</a>
            </Button>
          </div>
        </header>
      )}

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Wellness Resources</h1>
          <p className="text-muted-foreground mt-1">
            Tools and guides to support your mental health journey
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Interactive Breathing Exercise */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">Try a Breathing Exercise</h2>
              <BreathingTimer />
            </section>

            {/* Breathing Techniques */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">Breathing Techniques</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                {breathingExercises.map((exercise, index) => (
                  <Card key={index} className="border-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{exercise.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">{exercise.description}</p>
                      <p className="text-xs text-primary">{exercise.benefit}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Meditation Guides */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">Meditation Guides</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                {meditationGuides.map((guide, index) => (
                  <Card key={index} className="border-border/50">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{guide.name}</CardTitle>
                        <span className="text-xs text-muted-foreground">{guide.duration}</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{guide.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Stress Management Tips */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">Stress Management Tips</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {stressTips.map((tip, index) => (
                  <Card key={index} className="border-border/50">
                    <CardContent className="py-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                          {tip.icon}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{tip.title}</p>
                          <p className="text-sm text-muted-foreground mt-1">{tip.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column - Crisis Resources */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="border-destructive/30 bg-destructive/5">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                    </div>
                    <CardTitle className="text-lg">Need Immediate Help?</CardTitle>
                  </div>
                  <CardDescription>
                    {`If you're in crisis or having thoughts of self-harm, please reach out.`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {crisisResources.map((resource, index) => (
                    <div key={index} className="p-3 bg-background rounded-lg">
                      <p className="font-medium text-foreground">{resource.name}</p>
                      <p className="text-primary font-semibold mt-1">{resource.contact}</p>
                      <p className="text-xs text-muted-foreground mt-1">{resource.description}</p>
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground text-center pt-2">
                    Available 24/7, free and confidential
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50 mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Professional Support</CardTitle>
                  <CardDescription>
                    While Psyflo can help with daily wellness, it is not a replacement for professional care.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Consider speaking with a mental health professional if you are experiencing persistent symptoms or need additional support.
                  </p>
                  <Button variant="outline" className="w-full bg-transparent" asChild>
                    <a href="https://www.psychologytoday.com/us/therapists" target="_blank" rel="noopener noreferrer">
                      Find a Therapist
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
