"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

export interface MoodEntry {
  id: string
  value: number
  note: string
  createdAt: string
}

interface MoodContextType {
  moods: MoodEntry[]
  addMood: (value: number, note?: string) => void
  getMoodTrend: () => "improving" | "stable" | "declining"
  getAverageMood: (days?: number) => number
}

const MoodContext = createContext<MoodContextType | undefined>(undefined)

// Generate mock mood data for the past 30 days
function generateMockMoods(): MoodEntry[] {
  const moods: MoodEntry[] = []
  const now = new Date()
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    
    // Generate realistic mood patterns with some variance
    const baseValue = 6 + Math.sin(i / 7) * 1.5
    const variance = (Math.random() - 0.5) * 2
    const value = Math.max(1, Math.min(10, Math.round(baseValue + variance)))
    
    moods.push({
      id: `mood-${i}`,
      value,
      note: i % 3 === 0 ? ["Had a great workout", "Felt stressed at work", "Relaxing day", "Productive morning"][Math.floor(Math.random() * 4)] : "",
      createdAt: date.toISOString(),
    })
  }
  
  return moods
}

export function MoodProvider({ children }: { children: ReactNode }) {
  const [moods, setMoods] = useState<MoodEntry[]>(generateMockMoods)

  const addMood = useCallback((value: number, note = "") => {
    const newMood: MoodEntry = {
      id: `mood-${Date.now()}`,
      value,
      note,
      createdAt: new Date().toISOString(),
    }
    setMoods((prev) => [...prev, newMood])
  }, [])

  const getMoodTrend = useCallback((): "improving" | "stable" | "declining" => {
    if (moods.length < 7) return "stable"
    
    const lastWeek = moods.slice(-7)
    const previousWeek = moods.slice(-14, -7)
    
    const lastAvg = lastWeek.reduce((sum, m) => sum + m.value, 0) / lastWeek.length
    const prevAvg = previousWeek.reduce((sum, m) => sum + m.value, 0) / previousWeek.length
    
    if (lastAvg - prevAvg > 0.5) return "improving"
    if (prevAvg - lastAvg > 0.5) return "declining"
    return "stable"
  }, [moods])

  const getAverageMood = useCallback((days = 7): number => {
    const recentMoods = moods.slice(-days)
    if (recentMoods.length === 0) return 5
    return recentMoods.reduce((sum, m) => sum + m.value, 0) / recentMoods.length
  }, [moods])

  return (
    <MoodContext.Provider value={{ moods, addMood, getMoodTrend, getAverageMood }}>
      {children}
    </MoodContext.Provider>
  )
}

export function useMood() {
  const context = useContext(MoodContext)
  if (context === undefined) {
    throw new Error("useMood must be used within a MoodProvider")
  }
  return context
}
