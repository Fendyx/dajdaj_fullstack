import React, { useState } from 'react';
import './Contact.css'; // Подключаем отдельный CSS файл
import { FaMailBulk, FaPaperPlane, FaExternalLinkAlt, FaInstagram, FaCommentDots } from 'react-icons/fa';

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setFormData({ name: '', email: '', message: '' });
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleEmailClick = () => {
    window.location.href = 'mailto:contact@yourcompany.com?subject=Contact%20Inquiry';
  };

  return (
    <div className="con-card">
      <div className="con-card-header">
        <div className="con-icon-circle">
          <FaMailBulk className="con-icon" />
        </div>
        <h2 className="con-card-title">Get in Touch</h2>
        <p className="con-card-description">
          Send us a message and we'll get back to you as soon as possible
        </p>
      </div>
      <div className="con-card-content">
        <form onSubmit={handleSubmit} className="con-form">
          <div className="con-form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your full name"
              required
              className="con-input"
            />
          </div>

          <div className="con-form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your.email@example.com"
              required
              className="con-input"
            />
          </div>

          <div className="con-form-group">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Tell us how we can help you..."
              required
              rows="5"
              className="con-textarea"
            />
          </div>

          <div className="con-form-buttons">
            <button type="submit" className="con-btn-submit">
              <FaPaperPlane className="con-btn-icon" />
              Send Message
            </button>
            <button type="button" onClick={handleEmailClick} className="con-btn-outline">
              <FaExternalLinkAlt className="con-btn-icon" />
              Open Email App
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function InstagramContact() {
  const handleInstagramClick = () => {
    window.open('https://instagram.com/direct/new/', '_blank');
  };

  return (
    <div className="con-card con-instagram-card">
      <div className="con-card-header">
        <div className="con-icon-circle con-instagram-circle">
          <FaInstagram className="con-icon" />
        </div>
        <h2 className="con-card-title">Connect on Instagram</h2>
        <p className="con-card-description">
          Prefer social media? Send us a direct message on Instagram for quick responses
        </p>
      </div>
      <div className="con-card-content con-instagram-content">
        <p className="con-instagram-handle">@dajdaj</p>
        <div className="con-instagram-buttons">
          <button className="con-btn-gradient" onClick={handleInstagramClick}>
            <FaCommentDots className="con-btn-icon" />
            Send Message
          </button>
          <button
            className="con-btn-outline-instagram"
            onClick={() => window.open('https://instagram.com/yourcompany', '_blank')}
          >
            <FaInstagram className="con-btn-icon" />
            Follow Us
          </button>
        </div>
        <p className="con-instagram-response">
          Usually responds within 2-4 hours during business hours
        </p>
      </div>
    </div>
  );
}

export default function Contact() {
  return (
    <div className="con-page">
      <header className="con-header">
        <h1>Contact Us</h1>
        <p>We'd love to hear from you. Choose your preferred way to get in touch.</p>
      </header>

      <div className="con-grid">
        <InstagramContact />
        <ContactForm />
      </div>

      <footer className="con-footer">
        <div className="con-footer-divider" />
        <p>We typically respond within 24 hours</p>
      </footer>
    </div>
  );
}
