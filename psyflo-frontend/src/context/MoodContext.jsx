'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const MoodContext = createContext(null);

export const useMood = () => {
  const context = useContext(MoodContext);
  if (!context) {
    throw new Error('useMood must be used within a MoodProvider');
  }
  return context;
};

// Generate sample mood data for the past 30 days
const generateSampleData = () => {
  const data = [];
  const now = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Generate realistic mood patterns
    const baseScore = 5 + Math.sin(i * 0.3) * 2;
    const randomVariation = (Math.random() - 0.5) * 3;
    const score = Math.max(1, Math.min(10, Math.round(baseScore + randomVariation)));
    
    const notes = [
      'Feeling productive today',
      'Had a great workout',
      'Stressed about work',
      'Enjoyed time with friends',
      'Feeling tired but okay',
      'Meditation helped',
      'Good sleep last night',
      'Anxious about deadlines',
    ];
    
    data.push({
      id: `mood-${i}`,
      score,
      note: Math.random() > 0.5 ? notes[Math.floor(Math.random() * notes.length)] : '',
      date: date.toISOString(),
      factors: Math.random() > 0.6 ? ['sleep', 'exercise'] : ['work', 'social'],
    });
  }
  
  return data;
};

export const MoodProvider = ({ children }) => {
  const [moodEntries, setMoodEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load saved entries or generate sample data
    const saved = localStorage.getItem('psyflow_moods');
    if (saved) {
      setMoodEntries(JSON.parse(saved));
    } else {
      const sampleData = generateSampleData();
      setMoodEntries(sampleData);
      localStorage.setItem('psyflow_moods', JSON.stringify(sampleData));
    }
    setLoading(false);
  }, []);

  const addMoodEntry = (score, note = '', factors = []) => {
    const newEntry = {
      id: `mood-${Date.now()}`,
      score,
      note,
      factors,
      date: new Date().toISOString(),
    };
    
    const updated = [newEntry, ...moodEntries];
    setMoodEntries(updated);
    localStorage.setItem('psyflow_moods', JSON.stringify(updated));
    return newEntry;
  };

  const deleteMoodEntry = (id) => {
    const updated = moodEntries.filter(entry => entry.id !== id);
    setMoodEntries(updated);
    localStorage.setItem('psyflow_moods', JSON.stringify(updated));
  };

  const getAverageMood = (days = 7) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    
    const recentEntries = moodEntries.filter(
      entry => new Date(entry.date) >= cutoff
    );
    
    if (recentEntries.length === 0) return 0;
    
    const sum = recentEntries.reduce((acc, entry) => acc + entry.score, 0);
    return (sum / recentEntries.length).toFixed(1);
  };

  const getMoodTrend = () => {
    if (moodEntries.length < 2) return 'stable';
    
    const recent = moodEntries.slice(0, 7);
    const older = moodEntries.slice(7, 14);
    
    if (older.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((a, b) => a + b.score, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b.score, 0) / older.length;
    
    const diff = recentAvg - olderAvg;
    if (diff > 0.5) return 'improving';
    if (diff < -0.5) return 'declining';
    return 'stable';
  };

  const value = {
    moodEntries,
    loading,
    addMoodEntry,
    deleteMoodEntry,
    getAverageMood,
    getMoodTrend,
  };

  return (
    <MoodContext.Provider value={value}>
      {children}
    </MoodContext.Provider>
  );
};

export default MoodContext;
