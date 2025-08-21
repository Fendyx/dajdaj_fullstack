import React from 'react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-main">
          <div className="footer-grid">
            {/* Brand Section */}
            <div className="footer-brand">
              <div className="brand-header">
                <div className="brand-icon">❤️</div>
                <div>
                  <h3 className="brand-title">FigureCraft</h3>
                  <p className="brand-subtitle">Meaningful Gifts</p>
                </div>
              </div>
              <p className="footer-description">
                Creating meaningful gifts that celebrate strength, dedication, and the special people in your life.
              </p>
              <div className="social-icons">
                <button className="icon-button">📷</button>
                <button className="icon-button">📘</button>
                <button className="icon-button">🐦</button>
                <button className="icon-button">▶️</button>
              </div>
            </div>

            {/* Gift Guidance */}
            <div className="footer-section">
              <h4 className="footer-title">🎁 Gift Guidance</h4>
              <ul className="footer-links">
                <li><a href="#collections">Browse Figurines</a></li>
                <li><a href="#personalize">How Personalization Works</a></li>
                <li><a href="/gift-ideas">Gift Ideas</a></li>
                <li><a href="/occasions">Perfect Occasions</a></li>
                <li><a href="/size-guide">Size Guide</a></li>
              </ul>
            </div>

            {/* Customer Care */}
            <div className="footer-section">
              <h4 className="footer-title">💗 Customer Care</h4>
              <ul className="footer-links">
                <li><a href="/shipping">Shipping Info</a></li>
                <li><a href="/returns">Returns & Exchanges</a></li>
                <li><a href="/faq">FAQ</a></li>
                <li><a href="/contact">Contact Us</a></li>
                <li><a href="/care-instructions">Care Instructions</a></li>
              </ul>
            </div>
          </div>
        </div>

        <hr className="footer-separator" />

        <div className="footer-contact">
          <div className="contact-box">
            <div className="contact-icon">📧</div>
            <div>
              <div className="contact-title">Email Us</div>
              <div className="contact-email">hello@figurecraft.com</div>
            </div>
          </div>
        </div>

        <hr className="footer-separator" />

        <div className="footer-bottom">
          <div className="footer-copy">
            © 2024 FigureCraft. Made with ❤️ for meaningful connections.
          </div>
          <div className="footer-legal">
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
            <a href="/accessibility">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
