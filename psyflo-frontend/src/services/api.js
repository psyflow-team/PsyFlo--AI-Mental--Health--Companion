// API service for Psyflow
// This can be connected to a real backend later

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Simulated delay for mock responses
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Recommendations based on mood
export const getRecommendations = async (moodScore) => {
  await delay(500);
  
  const allRecommendations = [
    {
      id: 1,
      title: '4-7-8 Breathing Exercise',
      description: 'A calming breath technique to reduce anxiety and promote relaxation.',
      category: 'breathing',
      duration: '5 min',
      difficulty: 'easy',
      moodRange: [1, 5],
    },
    {
      id: 2,
      title: 'Gratitude Journaling',
      description: 'Write down three things you are grateful for today.',
      category: 'journaling',
      duration: '10 min',
      difficulty: 'easy',
      moodRange: [1, 7],
    },
    {
      id: 3,
      title: 'Body Scan Meditation',
      description: 'A guided meditation to release tension and increase body awareness.',
      category: 'meditation',
      duration: '15 min',
      difficulty: 'medium',
      moodRange: [1, 6],
    },
    {
      id: 4,
      title: 'Nature Walk',
      description: 'Take a mindful walk outside and connect with nature.',
      category: 'activity',
      duration: '20 min',
      difficulty: 'easy',
      moodRange: [3, 10],
    },
    {
      id: 5,
      title: 'Progressive Muscle Relaxation',
      description: 'Systematically tense and release muscle groups to reduce physical tension.',
      category: 'relaxation',
      duration: '15 min',
      difficulty: 'easy',
      moodRange: [1, 5],
    },
    {
      id: 6,
      title: 'Positive Affirmations',
      description: 'Practice self-compassion with uplifting statements.',
      category: 'mindset',
      duration: '5 min',
      difficulty: 'easy',
      moodRange: [1, 6],
    },
    {
      id: 7,
      title: 'Energizing Stretch Routine',
      description: 'Simple stretches to boost energy and improve mood.',
      category: 'activity',
      duration: '10 min',
      difficulty: 'easy',
      moodRange: [4, 10],
    },
    {
      id: 8,
      title: 'Mindful Eating Exercise',
      description: 'Practice being fully present while enjoying a meal or snack.',
      category: 'mindfulness',
      duration: '15 min',
      difficulty: 'easy',
      moodRange: [3, 8],
    },
    {
      id: 9,
      title: 'Box Breathing',
      description: 'A structured breathing technique used by Navy SEALs for focus.',
      category: 'breathing',
      duration: '5 min',
      difficulty: 'easy',
      moodRange: [2, 7],
    },
    {
      id: 10,
      title: 'Creative Expression',
      description: 'Draw, paint, or doodle to express your emotions visually.',
      category: 'activity',
      duration: '20 min',
      difficulty: 'easy',
      moodRange: [1, 10],
    },
    {
      id: 11,
      title: 'Loving-Kindness Meditation',
      description: 'Cultivate compassion for yourself and others.',
      category: 'meditation',
      duration: '10 min',
      difficulty: 'medium',
      moodRange: [1, 7],
    },
    {
      id: 12,
      title: 'Social Connection',
      description: 'Reach out to a friend or family member for a brief chat.',
      category: 'social',
      duration: '15 min',
      difficulty: 'easy',
      moodRange: [2, 10],
    },
  ];

  // Filter recommendations based on mood score
  return allRecommendations.filter(
    rec => moodScore >= rec.moodRange[0] && moodScore <= rec.moodRange[1]
  );
};

// Wellness resources
export const getResources = async () => {
  await delay(300);
  
  return {
    articles: [
      {
        id: 1,
        title: 'Understanding Anxiety',
        description: 'Learn about the causes and coping strategies for anxiety.',
        readTime: '5 min read',
        category: 'mental-health',
      },
      {
        id: 2,
        title: 'The Science of Sleep',
        description: 'How quality sleep impacts your mental health.',
        readTime: '7 min read',
        category: 'wellness',
      },
      {
        id: 3,
        title: 'Building Resilience',
        description: 'Strategies to bounce back from life challenges.',
        readTime: '6 min read',
        category: 'personal-growth',
      },
    ],
    crisisResources: [
      {
        name: 'National Suicide Prevention Lifeline',
        phone: '988',
        description: '24/7 support for people in distress',
      },
      {
        name: 'Crisis Text Line',
        phone: 'Text HOME to 741741',
        description: 'Free 24/7 text-based support',
      },
      {
        name: 'SAMHSA National Helpline',
        phone: '1-800-662-4357',
        description: 'Free mental health information and referrals',
      },
    ],
  };
};

// User profile operations
export const updateProfile = async (userId, updates) => {
  await delay(500);
  return { success: true, data: updates };
};

export default {
  getRecommendations,
  getResources,
  updateProfile,
};
