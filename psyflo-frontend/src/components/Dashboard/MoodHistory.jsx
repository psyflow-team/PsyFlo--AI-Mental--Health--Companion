'use client';

import React from 'react';
import { useMood } from '../../context/MoodContext';
import './Dashboard.css';

const getMoodColor = (score) => {
  if (score <= 3) return '#ef4444';
  if (score <= 5) return '#f59e0b';
  if (score <= 7) return '#84cc16';
  return '#10b981';
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) {
    return 'Today';
  } else if (days === 1) {
    return 'Yesterday';
  } else if (days < 7) {
    return `${days} days ago`;
  } else {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  }
};

const MoodHistory = () => {
  const { moodEntries, deleteMoodEntry } = useMood();
  
  const recentEntries = moodEntries.slice(0, 7);

  if (recentEntries.length === 0) {
    return (
      <div className="mood-history-card">
        <h3 className="card-title">Recent Entries</h3>
        <div className="empty-state">
          <p>No mood entries yet. Start tracking your mood above!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mood-history-card">
      <h3 className="card-title">Recent Entries</h3>
      
      <div className="history-list">
        {recentEntries.map((entry) => (
          <div key={entry.id} className="history-item">
            <div 
              className="mood-indicator"
              style={{ backgroundColor: getMoodColor(entry.score) }}
            >
              {entry.score}
            </div>
            
            <div className="history-details">
              <div className="history-date">{formatDate(entry.date)}</div>
              {entry.note && (
                <div className="history-note">{entry.note}</div>
              )}
            </div>
            
            <button 
              className="delete-entry"
              onClick={() => deleteMoodEntry(entry.id)}
              aria-label="Delete entry"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MoodHistory;
