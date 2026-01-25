'use client';

import React, { useState, useMemo } from 'react';
import { useMood } from '../../context/MoodContext';
import './Dashboard.css';

const Trends = () => {
  const [timeRange, setTimeRange] = useState('week');
  const { moodEntries, getAverageMood, getMoodTrend } = useMood();

  const chartData = useMemo(() => {
    const days = timeRange === 'week' ? 7 : 30;
    const data = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayEntries = moodEntries.filter(entry => 
        entry.date.split('T')[0] === dateStr
      );
      
      const avgScore = dayEntries.length > 0
        ? dayEntries.reduce((sum, e) => sum + e.score, 0) / dayEntries.length
        : null;

      data.push({
        date: date.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        }),
        shortDate: date.toLocaleDateString('en-US', { 
          weekday: 'short'
        }),
        score: avgScore,
      });
    }

    return data;
  }, [moodEntries, timeRange]);

  const trend = getMoodTrend();
  const avgMood = getAverageMood(timeRange === 'week' ? 7 : 30);

  const getTrendIcon = () => {
    if (trend === 'improving') {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="trend-icon up">
          <path d="M23 6l-9.5 9.5-5-5L1 18" />
          <path d="M17 6h6v6" />
        </svg>
      );
    } else if (trend === 'declining') {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="trend-icon down">
          <path d="M23 18l-9.5-9.5-5 5L1 6" />
          <path d="M17 18h6v-6" />
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="trend-icon stable">
        <path d="M5 12h14" />
      </svg>
    );
  };

  const maxScore = 10;
  const chartHeight = 150;

  return (
    <div className="trends-card">
      <div className="trends-header">
        <h3 className="card-title">Mood Trends</h3>
        <div className="time-toggle">
          <button
            className={timeRange === 'week' ? 'active' : ''}
            onClick={() => setTimeRange('week')}
          >
            Week
          </button>
          <button
            className={timeRange === 'month' ? 'active' : ''}
            onClick={() => setTimeRange('month')}
          >
            Month
          </button>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-item">
          <div className="stat-value">{avgMood || '--'}</div>
          <div className="stat-label">Average Mood</div>
        </div>
        <div className="stat-item">
          <div className="stat-value trend-value">
            {getTrendIcon()}
            <span className={`trend-text ${trend}`}>
              {trend.charAt(0).toUpperCase() + trend.slice(1)}
            </span>
          </div>
          <div className="stat-label">Trend</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{moodEntries.length}</div>
          <div className="stat-label">Total Entries</div>
        </div>
      </div>

      <div className="chart-container">
        <div className="chart-y-axis">
          <span>10</span>
          <span>5</span>
          <span>0</span>
        </div>
        <div className="chart-area">
          <svg viewBox={`0 0 ${chartData.length * 40} ${chartHeight}`} className="mood-chart">
            {/* Grid lines */}
            <line x1="0" y1={chartHeight * 0.5} x2={chartData.length * 40} y2={chartHeight * 0.5} stroke="#e5e7eb" strokeDasharray="4" />
            
            {/* Line path */}
            <path
              d={chartData.map((d, i) => {
                if (d.score === null) return '';
                const x = i * 40 + 20;
                const y = chartHeight - (d.score / maxScore) * chartHeight;
                return `${i === 0 || chartData[i - 1]?.score === null ? 'M' : 'L'} ${x} ${y}`;
              }).join(' ')}
              fill="none"
              stroke="#4a9bb0"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Data points */}
            {chartData.map((d, i) => {
              if (d.score === null) return null;
              const x = i * 40 + 20;
              const y = chartHeight - (d.score / maxScore) * chartHeight;
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#4a9bb0"
                  className="data-point"
                />
              );
            })}
          </svg>
          <div className="chart-x-axis">
            {chartData.map((d, i) => (
              <span key={i}>{timeRange === 'week' ? d.shortDate : (i % 5 === 0 ? d.shortDate : '')}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trends;
