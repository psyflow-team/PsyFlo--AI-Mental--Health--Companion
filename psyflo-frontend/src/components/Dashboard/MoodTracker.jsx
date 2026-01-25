'use client';

import React, { useState } from 'react';
import { useMood } from '../../context/MoodContext';
import './Dashboard.css';

const moodLabels = {
  1: 'Very Low',
  2: 'Low',
  3: 'Somewhat Low',
  4: 'Below Average',
  5: 'Neutral',
  6: 'Above Average',
  7: 'Good',
  8: 'Very Good',
  9: 'Great',
  10: 'Excellent',
};

const getMoodColor = (score) => {
  if (score <= 3) return '#ef4444';
  if (score <= 5) return '#f59e0b';
  if (score <= 7) return '#84cc16';
  return '#10b981';
};

const MoodTracker = () => {
  const [selectedMood, setSelectedMood] = useState(5);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { addMoodEntry } = useMood();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate brief delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    addMoodEntry(selectedMood, note);
    setNote('');
    setSelectedMood(5);
    setShowSuccess(true);
    setIsSubmitting(false);
    
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="mood-tracker-card">
      <h3 className="card-title">How are you feeling?</h3>
      
      {showSuccess && (
        <div className="success-message">
          Mood logged successfully!
        </div>
      )}

      <div className="mood-slider-container">
        <div 
          className="mood-value"
          style={{ color: getMoodColor(selectedMood) }}
        >
          {selectedMood}
        </div>
        <div className="mood-label">{moodLabels[selectedMood]}</div>
        
        <input
          type="range"
          min="1"
          max="10"
          value={selectedMood}
          onChange={(e) => setSelectedMood(Number(e.target.value))}
          className="mood-slider"
          style={{
            '--slider-color': getMoodColor(selectedMood),
          }}
        />
        
        <div className="mood-scale">
          <span>1</span>
          <span>5</span>
          <span>10</span>
        </div>
      </div>

      <div className="mood-note">
        <label htmlFor="moodNote">Add a note (optional)</label>
        <textarea
          id="moodNote"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What's on your mind?"
          rows={3}
        />
      </div>

      <button 
        className="log-mood-button"
        onClick={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Logging...' : 'Log Mood'}
      </button>
    </div>
  );
};

export default MoodTracker;
