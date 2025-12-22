import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import './Footer.css';
import logo from "../../assets/img/dajdaj_180.png";
import { 
  AiFillInstagram, 
  AiFillFacebook, 
  AiOutlineMail, 
  AiOutlineHeart, 
  AiOutlineDown, 
  AiOutlineUp 
} from 'react-icons/ai';
import { SiTiktok } from 'react-icons/si';

export default function Footer() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isCustomerCareOpen, setIsCustomerCareOpen] = useState(false);

  const handleContactsClick = () => {
    navigate('/contacts');
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-main">
          <div className="footer-grid">
            {/* Brand Section */}
            <div className="footer-brand">
              <div className="brand-header">
                <img className="brand-icon" src={logo} alt="DajDaj Logo" />
                <div>
                  <h3 className="brand-title">{t("footer.brand.title")}</h3>
                  <p className="brand-subtitle">{t("footer.brand.subtitle")}</p>
                </div>
              </div>
              <p className="footer-description">
                {t("footer.brand.description")}
              </p>
              <div className="social-icons">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="icon-button">
                  <AiFillInstagram size={24} color="black" />
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="icon-button">
                  <AiFillFacebook size={24} color="black" />
                </a>
                <a href="https://tiktok.com/@dajdaj_shop" target="_blank" rel="noopener noreferrer" className="icon-button">
                  <SiTiktok size={24} color="black" />
                </a>
              </div>
            </div>

            {/* Customer Care - Collapsible */}
            <div className="footer-section">
              <h4 
                className="footer-title footer-title-collapsible" 
                onClick={() => setIsCustomerCareOpen(!isCustomerCareOpen)}
              >
                <div className="footer-title-content">
                  <AiOutlineHeart size={18} style={{ marginRight: 6 }} />
                  {t("footer.customerCare.title")}
                </div>
                {isCustomerCareOpen ? (
                  <AiOutlineUp size={20} />
                ) : (
                  <AiOutlineDown size={20} />
                )}
              </h4>
              <div className={`footer-links-wrapper ${isCustomerCareOpen ? 'open' : ''}`}>
                <ul className="footer-links">
                  <li><a href="/shipping">{t("footer.customerCare.shipping")}</a></li>
                  <li><a href="/returns">{t("footer.customerCare.returns")}</a></li>
                  <li><a href="/faq">{t("footer.customerCare.faq")}</a></li>
                  <li><a href="/care-instructions">{t("footer.customerCare.care")}</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <hr className="footer-separator" />

        {/* Contact Section */}
        <div className="footer-contact">
          <div className="contact-box" onClick={handleContactsClick}>
            <div className="contact-icon">
              <AiOutlineMail size={24} color="black" />
            </div>
            <div>
              <div className="contact-title">{t("footer.customerCare.contact")}</div>
              <div className="contact-subtitle">{t("footer.contact.clickHere")}</div>
            </div>
          </div>
        </div>

        <hr className="footer-separator" />

        <div className="footer-bottom">
          <div className="footer-copy">
            {t("footer.bottom.copy")}
          </div>
          <div className="footer-legal">
            <a href="/privacy">{t("footer.bottom.privacy")}</a>
            <a href="/terms">{t("footer.bottom.terms")}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}