'use client';

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMood } from '../../context/MoodContext';
import './Profile.css';

const UserProfile = () => {
  const { user, logout } = useAuth();
  const { moodEntries, getAverageMood, getMoodTrend } = useMood();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const memberSince = user?.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      })
    : 'Recently';

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>Profile Settings</h1>
        <p>Manage your account and preferences</p>
      </div>

      <div className="profile-grid">
        <div className="profile-card">
          <h3>Account Information</h3>
          <div className="profile-avatar">
            <div className="avatar-circle">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
          <div className="profile-info">
            <div className="info-row">
              <label>Name</label>
              <span>{user?.name || 'User'}</span>
            </div>
            <div className="info-row">
              <label>Email</label>
              <span>{user?.email || 'user@example.com'}</span>
            </div>
            <div className="info-row">
              <label>Member Since</label>
              <span>{memberSince}</span>
            </div>
          </div>
        </div>

        <div className="profile-card">
          <h3>Your Stats</h3>
          <div className="stats-grid">
            <div className="stat-box">
              <span className="stat-number">{moodEntries.length}</span>
              <span className="stat-label">Mood Entries</span>
            </div>
            <div className="stat-box">
              <span className="stat-number">{getAverageMood(30) || '--'}</span>
              <span className="stat-label">30-Day Average</span>
            </div>
            <div className="stat-box">
              <span className="stat-number capitalize">{getMoodTrend()}</span>
              <span className="stat-label">Current Trend</span>
            </div>
          </div>
        </div>

        <div className="profile-card">
          <h3>Preferences</h3>
          <div className="preference-item">
            <div className="preference-info">
              <span className="preference-label">Daily Reminders</span>
              <span className="preference-desc">Get notifications to log your mood</span>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={notifications}
                onChange={() => setNotifications(!notifications)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
          <div className="preference-item">
            <div className="preference-info">
              <span className="preference-label">Dark Mode</span>
              <span className="preference-desc">Use dark theme for the app</span>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={darkMode}
                onChange={() => setDarkMode(!darkMode)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div className="profile-card">
          <h3>Privacy & Security</h3>
          <div className="privacy-info">
            <div className="privacy-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <div>
                <strong>Data Encryption</strong>
                <p>Your mood data is stored locally on your device</p>
              </div>
            </div>
            <div className="privacy-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <div>
                <strong>Private by Design</strong>
                <p>We don't share your data with third parties</p>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-card danger-zone">
          <h3>Account Actions</h3>
          <button className="logout-button" onClick={logout}>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
