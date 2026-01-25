import React from 'react';
import { Link } from 'react-router-dom';
import './Common.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-main">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2" />
                <path d="M12 6v6l4 2" />
              </svg>
              <span>Psyflo</span>
            </Link>
            <p>Your AI-powered mental health companion for daily wellness tracking and personalized recommendations.</p>
          </div>

          <div className="footer-links">
            <div className="footer-section">
              <h4>Product</h4>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/recommendations">Recommendations</Link>
              <Link to="/profile">Profile</Link>
            </div>

            <div className="footer-section">
              <h4>Support</h4>
              <a href="#help">Help Center</a>
              <a href="#contact">Contact Us</a>
              <a href="#privacy">Privacy Policy</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Psyflo. All rights reserved.</p>
          <div className="crisis-notice">
            <strong>Crisis Support:</strong> If you're in crisis, call <a href="tel:988">988</a> (Suicide Prevention Lifeline)
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
