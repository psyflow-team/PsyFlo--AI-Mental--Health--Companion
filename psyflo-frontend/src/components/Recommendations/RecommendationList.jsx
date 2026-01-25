'use client';

import React, { useState, useEffect } from 'react';
import { useMood } from '../../context/MoodContext';
import { getRecommendations } from '../../services/api';
import './Recommendations.css';

const categoryIcons = {
  breathing: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  ),
  meditation: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2" />
      <path d="M12 6v6" />
      <path d="M9 9h6" />
    </svg>
  ),
  activity: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  journaling: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
      <path d="M10 9H8" />
    </svg>
  ),
  relaxation: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  mindset: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  ),
  mindfulness: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  social: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
};

const categoryColors = {
  breathing: '#4a9bb0',
  meditation: '#8b5cf6',
  activity: '#10b981',
  journaling: '#f59e0b',
  relaxation: '#ec4899',
  mindset: '#6366f1',
  mindfulness: '#14b8a6',
  social: '#f97316',
};

const RecommendationList = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { moodEntries, getAverageMood } = useMood();

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      const avgMood = getAverageMood(7);
      const score = avgMood ? parseFloat(avgMood) : 5;
      const recs = await getRecommendations(score);
      setRecommendations(recs);
      setLoading(false);
    };

    fetchRecommendations();
  }, [moodEntries, getAverageMood]);

  const categories = ['all', ...new Set(recommendations.map(r => r.category))];
  
  const filteredRecommendations = filter === 'all' 
    ? recommendations 
    : recommendations.filter(r => r.category === filter);

  if (loading) {
    return (
      <div className="recommendations-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading personalized recommendations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="recommendations-container">
      <div className="recommendations-header">
        <h2>Personalized Recommendations</h2>
        <p>Based on your recent mood patterns, here are some activities that might help:</p>
      </div>

      <div className="filter-tabs">
        {categories.map(cat => (
          <button
            key={cat}
            className={filter === cat ? 'active' : ''}
            onClick={() => setFilter(cat)}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      <div className="recommendations-grid">
        {filteredRecommendations.map(rec => (
          <div key={rec.id} className="recommendation-card">
            <div 
              className="rec-icon"
              style={{ backgroundColor: `${categoryColors[rec.category]}20`, color: categoryColors[rec.category] }}
            >
              {categoryIcons[rec.category]}
            </div>
            
            <div className="rec-content">
              <h3>{rec.title}</h3>
              <p>{rec.description}</p>
              
              <div className="rec-meta">
                <span className="rec-duration">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                  {rec.duration}
                </span>
                <span className="rec-difficulty">{rec.difficulty}</span>
              </div>
            </div>

            <button className="try-button">Try Now</button>
          </div>
        ))}
      </div>

      {filteredRecommendations.length === 0 && (
        <div className="empty-recommendations">
          <p>No recommendations found for this category.</p>
        </div>
      )}
    </div>
  );
};

export default RecommendationList;
