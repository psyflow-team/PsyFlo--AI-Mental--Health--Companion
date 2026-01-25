import { NextRequest, NextResponse } from "next/server"

const AI_ENDPOINT = "https://gemma-3-27b-3ca9s.paas.ai.telus.com"

interface MoodEntry {
  value: number
  note: string
  createdAt: string
}

export async function POST(request: NextRequest) {
  try {
    const { moods, userName } = await request.json()

    // Analyze mood patterns
    const recentMoods = moods.slice(-14) as MoodEntry[]
    const avgMood = recentMoods.reduce((sum: number, m: MoodEntry) => sum + m.value, 0) / recentMoods.length
    const moodTrend = calculateTrend(recentMoods)
    const notes = recentMoods.filter((m: MoodEntry) => m.note).map((m: MoodEntry) => m.note)

    const prompt = `You are a compassionate mental health companion AI. Analyze the following mood data and provide personalized wellness recommendations.

User: ${userName || "Friend"}
Average mood (1-10 scale): ${avgMood.toFixed(1)}
Mood trend: ${moodTrend}
Recent notes from user: ${notes.length > 0 ? notes.join("; ") : "No notes provided"}

Based on this data, provide exactly 4 personalized wellness recommendations. For each recommendation, include:
1. A short, actionable title (max 6 words)
2. A warm, encouraging description (2-3 sentences)
3. Type: one of "breathing", "meditation", "activity", or "journaling"
4. Duration: estimated time (e.g., "5 min", "15 min")

Also provide a brief insight about their mood patterns (1-2 sentences).

Respond in this exact JSON format:
{
  "insight": "Your personalized insight here",
  "recommendations": [
    {
      "title": "Title here",
      "description": "Description here",
      "type": "breathing|meditation|activity|journaling",
      "duration": "X min"
    }
  ]
}

Be empathetic, supportive, and focus on practical, evidence-based wellness practices. If mood is low, prioritize calming activities. If mood is high, suggest ways to maintain or share that positivity.`

    const response = await fetch(`${AI_ENDPOINT}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gemma-3-27b",
        messages: [
          {
            role: "system",
            content: "You are a compassionate mental health companion. Always respond with valid JSON only, no markdown or extra text.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    })

    if (!response.ok) {
      console.error("[v0] AI API error:", response.status, response.statusText)
     
      return NextResponse.json(getFallbackRecommendations(avgMood))
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      console.error("[v0] No content in AI response")
      return NextResponse.json(getFallbackRecommendations(avgMood))
    }


    let parsed
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content)
    } catch {
      console.error("[v0] Failed to parse AI response:", content)
      return NextResponse.json(getFallbackRecommendations(avgMood))
    }

    return NextResponse.json({
      insight: parsed.insight || `Based on your recent mood average of ${avgMood.toFixed(1)}, here are some personalized recommendations.`,
      recommendations: parsed.recommendations?.map((rec: { title: string; description: string; type: string; duration: string }, i: number) => ({
        id: `ai-rec-${i}`,
        title: rec.title,
        description: rec.description,
        type: rec.type,
        duration: rec.duration,
        isAI: true,
      })) || getFallbackRecommendations(avgMood).recommendations,
      avgMood: avgMood.toFixed(1),
      trend: moodTrend,
    })
  } catch (error) {
    console.error("[v0] Error in AI recommendations:", error)
    return NextResponse.json(getFallbackRecommendations(5), { status: 500 })
  }
}

function calculateTrend(moods: MoodEntry[]): string {
  if (moods.length < 7) return "not enough data"
  
  const firstHalf = moods.slice(0, Math.floor(moods.length / 2))
  const secondHalf = moods.slice(Math.floor(moods.length / 2))
  
  const firstAvg = firstHalf.reduce((sum, m) => sum + m.value, 0) / firstHalf.length
  const secondAvg = secondHalf.reduce((sum, m) => sum + m.value, 0) / secondHalf.length
  
  if (secondAvg - firstAvg > 0.5) return "improving"
  if (firstAvg - secondAvg > 0.5) return "declining"
  return "stable"
}

function getFallbackRecommendations(avgMood: number) {
  const isLow = avgMood <= 4
  const isHigh = avgMood >= 8

  return {
    insight: isLow 
      ? "It looks like you've been going through a challenging time. Remember, it's okay to take things one step at a time."
      : isHigh 
        ? "You've been feeling great lately! Let's keep that positive momentum going."
        : "Your mood has been balanced. Here are some activities to maintain your well-being.",
    recommendations: [
      {
        id: "ai-fallback-1",
        title: isLow ? "Gentle Breathing Exercise" : isHigh ? "Energizing Morning Breath" : "Balancing Breath Work",
        description: isLow 
          ? "Take 5 minutes to practice slow, deep breathing. Inhale for 4 counts, hold for 4, exhale for 6. This activates your calming nervous system."
          : isHigh 
            ? "Start your day with invigorating breath work to channel your positive energy into focus and creativity."
            : "A simple breathing practice to center yourself and maintain emotional balance throughout the day.",
        type: "breathing",
        duration: "5 min",
        isAI: true,
      },
      {
        id: "ai-fallback-2",
        title: isLow ? "Self-Compassion Meditation" : isHigh ? "Gratitude Meditation" : "Mindful Awareness Practice",
        description: isLow
          ? "A gentle guided meditation focused on self-kindness. You deserve compassion, especially during difficult times."
          : isHigh
            ? "Amplify your positive feelings by reflecting on what you're grateful for and sending good wishes to others."
            : "A balanced meditation practice to stay present and appreciate the current moment.",
        type: "meditation",
        duration: "10 min",
        isAI: true,
      },
      {
        id: "ai-fallback-3",
        title: isLow ? "Comfort Journaling" : isHigh ? "Vision Board Writing" : "Daily Reflection Journal",
        description: isLow
          ? "Write without judgment about what's on your mind. Sometimes getting thoughts on paper helps lighten the mental load."
          : isHigh
            ? "Capture your positive energy by writing about your goals and dreams. Your current mindset is perfect for manifesting."
            : "Take a few minutes to reflect on your day and set intentions for tomorrow.",
        type: "journaling",
        duration: "10 min",
        isAI: true,
      },
      {
        id: "ai-fallback-4",
        title: isLow ? "Gentle Movement" : isHigh ? "Dance or Active Play" : "Nature Walk",
        description: isLow
          ? "Light stretching or a slow walk can help shift your energy. No pressure to do anything intense - just gentle movement."
          : isHigh
            ? "Channel your great mood into joyful movement! Put on your favorite music and let yourself move freely."
            : "A moderate-paced walk, ideally in nature, to maintain your balanced state of mind.",
        type: "activity",
        duration: "15 min",
        isAI: true,
      },
    ],
    avgMood: avgMood.toFixed(1),
    trend: "stable",
  }
}
