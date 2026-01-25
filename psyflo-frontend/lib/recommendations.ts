export interface Recommendation {
  id: string
  title: string
  description: string
  type: "breathing" | "meditation" | "activity" | "journaling"
  duration: string
  moodRange: [number, number]
}

export const recommendations: Recommendation[] = [
  // For low moods (1-4)
  {
    id: "breath-1",
    title: "4-7-8 Breathing",
    description: "A calming breath technique to reduce anxiety and promote relaxation. Inhale for 4 counts, hold for 7, exhale for 8.",
    type: "breathing",
    duration: "5 min",
    moodRange: [1, 4],
  },
  {
    id: "med-1",
    title: "Grounding Meditation",
    description: "A gentle guided meditation focusing on present moment awareness and body connection.",
    type: "meditation",
    duration: "10 min",
    moodRange: [1, 4],
  },
  {
    id: "journal-1",
    title: "Emotion Release Writing",
    description: "Write freely about what's weighing on you. No judgment, just expression.",
    type: "journaling",
    duration: "15 min",
    moodRange: [1, 4],
  },
  {
    id: "activity-1",
    title: "Gentle Stretching",
    description: "Light stretches to release tension and reconnect with your body.",
    type: "activity",
    duration: "10 min",
    moodRange: [1, 4],
  },

  // For moderate moods (5-7)
  {
    id: "breath-2",
    title: "Box Breathing",
    description: "Equal parts inhale, hold, exhale, hold. Great for focus and calm.",
    type: "breathing",
    duration: "5 min",
    moodRange: [5, 7],
  },
  {
    id: "med-2",
    title: "Mindful Walking",
    description: "Take a short walk while paying attention to each step and your surroundings.",
    type: "meditation",
    duration: "15 min",
    moodRange: [5, 7],
  },
  {
    id: "journal-2",
    title: "Gratitude List",
    description: "Write down 3-5 things you're grateful for today, no matter how small.",
    type: "journaling",
    duration: "5 min",
    moodRange: [5, 7],
  },
  {
    id: "activity-2",
    title: "Nature Connection",
    description: "Spend time outside, even if just sitting by a window with a view.",
    type: "activity",
    duration: "20 min",
    moodRange: [5, 7],
  },

  // For high moods (8-10)
  {
    id: "breath-3",
    title: "Energizing Breath",
    description: "Quick, rhythmic breathing to harness your positive energy.",
    type: "breathing",
    duration: "3 min",
    moodRange: [8, 10],
  },
  {
    id: "med-3",
    title: "Loving-Kindness",
    description: "Extend your positive feelings outward with this compassion meditation.",
    type: "meditation",
    duration: "10 min",
    moodRange: [8, 10],
  },
  {
    id: "journal-3",
    title: "Future Self Letter",
    description: "Write a letter to your future self capturing this positive moment.",
    type: "journaling",
    duration: "10 min",
    moodRange: [8, 10],
  },
  {
    id: "activity-3",
    title: "Creative Expression",
    description: "Channel your energy into something creative - draw, sing, dance, or create.",
    type: "activity",
    duration: "30 min",
    moodRange: [8, 10],
  },
]

export function getRecommendationsForMood(moodValue: number): Recommendation[] {
  return recommendations.filter(
    (rec) => moodValue >= rec.moodRange[0] && moodValue <= rec.moodRange[1]
  )
}
