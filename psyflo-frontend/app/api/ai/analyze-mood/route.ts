import { NextRequest, NextResponse } from "next/server"

const AI_ENDPOINT = "https://gemma-3-27b-3ca9s.paas.ai.telus.com"

function getFallbackAnalysis(moodValue: number, note: string) {
  const lowerNote = note.toLowerCase()
  
  // Try to detect some keywords for better fallbacks
  const hasStress = lowerNote.includes("stress") || lowerNote.includes("anxious") || lowerNote.includes("worried")
  const hasTired = lowerNote.includes("tired") || lowerNote.includes("exhausted") || lowerNote.includes("sleep")
  const hasWork = lowerNote.includes("work") || lowerNote.includes("job") || lowerNote.includes("meeting")
  const hasHappy = lowerNote.includes("happy") || lowerNote.includes("great") || lowerNote.includes("good")
  
  if (moodValue >= 7) {
    return {
      emotions: hasHappy ? ["joyful", "content"] : ["positive", "hopeful"],
      supportiveMessage: "It's wonderful to see you feeling good! Your positive energy is something to celebrate.",
      suggestion: "Consider sharing this good feeling with someone you care about today."
    }
  } else if (moodValue <= 4) {
    if (hasStress) {
      return {
        emotions: ["stressed", "overwhelmed"],
        supportiveMessage: "It's understandable to feel stressed. Remember, it's okay to take things one step at a time.",
        suggestion: "Try a 5-minute breathing exercise to help calm your nervous system."
      }
    }
    if (hasTired) {
      return {
        emotions: ["fatigued", "drained"],
        supportiveMessage: "Feeling tired can be really tough. Your body might be telling you it needs rest.",
        suggestion: "If possible, try to get some extra rest tonight or take short breaks during the day."
      }
    }
    return {
      emotions: ["challenged", "reflective"],
      supportiveMessage: "I'm here for you during this difficult time. It takes courage to acknowledge how you're feeling.",
      suggestion: "Be gentle with yourself today. Small acts of self-care can make a difference."
    }
  } else {
    if (hasWork) {
      return {
        emotions: ["focused", "balanced"],
        supportiveMessage: "You're navigating work with a steady approach. That's a valuable skill.",
        suggestion: "Remember to take short breaks to maintain your focus and energy."
      }
    }
    return {
      emotions: ["balanced", "steady"],
      supportiveMessage: "Thank you for checking in. Being in a balanced state is a good place to be.",
      suggestion: "This could be a good time to try something new or connect with a friend."
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { note, moodValue } = await request.json()

    if (!note || note.trim().length === 0) {
      return NextResponse.json({ 
        sentiment: "neutral",
        analysis: null 
      })
    }

    const prompt = `Analyze this mood journal entry for emotional content and provide supportive feedback.

User's mood rating: ${moodValue}/10
User's note: "${note}"

Provide a brief, empathetic analysis in this JSON format:
{
  "sentiment": "positive|negative|neutral|mixed",
  "emotions": ["list", "of", "detected", "emotions"],
  "supportiveMessage": "A brief, warm, supportive message (1-2 sentences)",
  "suggestion": "One small, actionable suggestion based on their note (1 sentence)"
}

Be warm, non-judgmental, and supportive. Focus on validation and gentle encouragement.`

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
            content: "You are a compassionate mental health companion. Respond with valid JSON only.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 256,
      }),
    })

    if (!response.ok) {
      console.error("[v0] AI analysis error:", response.status)
      // Return a helpful fallback instead of null
      return NextResponse.json({ 
        sentiment: moodValue >= 6 ? "positive" : moodValue <= 4 ? "negative" : "neutral",
        analysis: getFallbackAnalysis(moodValue, note)
      })
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      return NextResponse.json({ sentiment: "neutral", analysis: null })
    }

    // Parse JSON from response
    let parsed
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content)
    } catch {
      console.error("[v0] Failed to parse analysis:", content)
      return NextResponse.json({ sentiment: "neutral", analysis: null })
    }

    return NextResponse.json({
      sentiment: parsed.sentiment || "neutral",
      analysis: {
        emotions: parsed.emotions || [],
        supportiveMessage: parsed.supportiveMessage || "Thank you for sharing how you're feeling.",
        suggestion: parsed.suggestion || null,
      },
    })
  } catch (error) {
    console.error("[v0] Error in mood analysis:", error)
    return NextResponse.json({ sentiment: "neutral", analysis: null })
  }
}
