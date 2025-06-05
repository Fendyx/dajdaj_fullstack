import React from "react";
import "./Contact.css";

const Contact = () => {
  return (
    <div className="contact-page">
      <h1 className="contact-title">Skontaktuj się z nami</h1>

      <div className="contact-cards">
        <div className="contact-card">
          <h2>Kontakt mailowy</h2>
          <p>Masz pytania? Napisz do nas:</p>
          <a href="mailto:info@dajdaj.pl" className="contact-button email-button">
            info@dajdaj.pl
          </a>
        </div>

        <div className="contact-card">
          <h2>Facebook</h2>
          <p>Możesz też napisać do nas przez nasz fanpage:</p>
          <a
            href="https://www.facebook.com/yourpage" // ← замени на свой реальный URL
            target="_blank"
            rel="noopener noreferrer"
            className="contact-button fb-button"
          >
            Napisz na Facebooku
          </a>
        </div>
      </div>
    </div>
  );
};

export default Contact;
