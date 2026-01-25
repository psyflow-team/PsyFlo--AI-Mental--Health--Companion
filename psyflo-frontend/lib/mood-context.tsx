"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot,
  deleteDoc,
  doc,
  writeBatch,
  Timestamp
} from "firebase/firestore"
import { db } from "./firebase"
import { useAuth } from "./auth-context"

export interface MoodEntry {
  id: string
  value: number
  note: string
  createdAt: string
}

interface MoodContextType {
  moods: MoodEntry[]
  latestMood: MoodEntry | null
  isLoading: boolean
  addMood: (value: number, note?: string) => Promise<void>
  getMoodTrend: () => "improving" | "stable" | "declining"
  getAverageMood: (days?: number) => number
  getTodaysMood: () => MoodEntry | null
  clearAllMoods: () => Promise<void>
  generateSampleData: () => Promise<void>
}

const MoodContext = createContext<MoodContextType | undefined>(undefined)

// Generate sample mood data for demo
function generateSampleMoodData(): Omit<MoodEntry, "id">[] {
  const moods: Omit<MoodEntry, "id">[] = []
  const now = new Date()
  
  for (let i = 30; i >= 1; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    
    const baseValue = 6 + Math.sin(i / 7) * 1.5
    const variance = (Math.random() - 0.5) * 2
    const value = Math.max(1, Math.min(10, Math.round(baseValue + variance)))
    
    moods.push({
      value,
      note: i % 3 === 0 ? ["Had a great workout", "Felt stressed at work", "Relaxing day", "Productive morning"][Math.floor(Math.random() * 4)] : "",
      createdAt: date.toISOString(),
    })
  }
  
  return moods
}

export function MoodProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [moods, setMoods] = useState<MoodEntry[]>([])
  const [latestMood, setLatestMood] = useState<MoodEntry | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Subscribe to user's moods from Firestore
  useEffect(() => {
    if (!user) {
      setMoods([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    
    const moodsRef = collection(db, "users", user.id, "moods")
    const q = query(moodsRef, orderBy("createdAt", "asc"))
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const moodData: MoodEntry[] = snapshot.docs.map(doc => ({
        id: doc.id,
        value: doc.data().value,
        note: doc.data().note || "",
        createdAt: doc.data().createdAt instanceof Timestamp 
          ? doc.data().createdAt.toDate().toISOString()
          : doc.data().createdAt
      }))
      
      setMoods(moodData)
      setIsLoading(false)
    }, (error) => {
      console.error("Error fetching moods:", error)
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  const addMood = useCallback(async (value: number, note = "") => {
    if (!user) return

    const newMoodData = {
      value,
      note,
      createdAt: new Date().toISOString(),
    }

    try {
      const moodsRef = collection(db, "users", user.id, "moods")
      const docRef = await addDoc(moodsRef, newMoodData)
      
      const newMood: MoodEntry = {
        id: docRef.id,
        ...newMoodData
      }
      setLatestMood(newMood)
    } catch (error) {
      console.error("Error adding mood:", error)
    }
  }, [user])

  const getMoodTrend = useCallback((): "improving" | "stable" | "declining" => {
    if (moods.length < 7) return "stable"
    
    const lastWeek = moods.slice(-7)
    const previousWeek = moods.slice(-14, -7)
    
    if (previousWeek.length === 0) return "stable"
    
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

  const getTodaysMood = useCallback((): MoodEntry | null => {
    const today = new Date().toDateString()
    const todaysMoods = moods.filter(m => new Date(m.createdAt).toDateString() === today)
    return todaysMoods.length > 0 ? todaysMoods[todaysMoods.length - 1] : null
  }, [moods])

  // Clear all moods for the user
  const clearAllMoods = useCallback(async () => {
    if (!user) return

    try {
      const batch = writeBatch(db)
      moods.forEach(mood => {
        const moodRef = doc(db, "users", user.id, "moods", mood.id)
        batch.delete(moodRef)
      })
      await batch.commit()
      setLatestMood(null)
    } catch (error) {
      console.error("Error clearing moods:", error)
    }
  }, [user, moods])

  // Generate sample data for new users (for demo purposes)
  const generateSampleData = useCallback(async () => {
    if (!user) return

    try {
      const sampleMoods = generateSampleMoodData()
      const moodsRef = collection(db, "users", user.id, "moods")
      
      const batch = writeBatch(db)
      sampleMoods.forEach(mood => {
        const newDocRef = doc(moodsRef)
        batch.set(newDocRef, mood)
      })
      await batch.commit()
    } catch (error) {
      console.error("Error generating sample data:", error)
    }
  }, [user])

  return (
    <MoodContext.Provider value={{ 
      moods, 
      latestMood, 
      isLoading,
      addMood, 
      getMoodTrend, 
      getAverageMood, 
      getTodaysMood, 
      clearAllMoods,
      generateSampleData
    }}>
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
