import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import './Footer.css';
import logo from "../../assets/img/dajdaj_180.png"; // Убедись, что путь верный
import { 
  AiFillInstagram, 
  AiFillFacebook, 
  AiOutlineMail, 
  AiOutlinePhone,
  AiOutlineDown, 
  AiOutlineUp 
} from 'react-icons/ai';
import { SiTiktok, SiVisa, SiMastercard, SiApplepay } from 'react-icons/si';

export default function Footer() {
  const { t } = useTranslation();
  
  // Состояние для мобильных аккордеонов
  // В реальном проекте можно вынести в отдельный компонент FooterColumn
  const [openSections, setOpenSections] = useState({});

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const isMobile = window.innerWidth <= 768; // Простая проверка, лучше использовать CSS media queries для скрытия/показа, но для логики React пойдет

  return (
    <footer className="footer">
      {/* Newsletter Section - Важно для маркетинга */}
      <div className="newsletter-bar">
        <div className="newsletter-content">
          <h4>{t("footer.newsletter.title", "Subscribe to our news")}</h4>
          <p>{t("footer.newsletter.subtitle", "Get 10% off your first order")}</p>
        </div>
        <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
          <input type="email" placeholder={t("footer.newsletter.placeholder", "Your email")} />
          <button type="submit">{t("footer.newsletter.button", "Subscribe")}</button>
        </form>
      </div>

      <div className="footer-container">
        <div className="footer-grid">
          
          {/* Column 1: Brand & Social */}
          <div className="footer-col brand-col">
            <Link to="/" className="footer-logo-link">
              <img src={logo} alt="Logo" className="footer-logo" />
              <span className="brand-name">DajDaj</span>
            </Link>
            <p className="brand-desc">
              {t("footer.brand.desc", "Your ultimate marketplace for everything you need. Quality and speed in one place.")}
            </p>
            <div className="social-icons">
              <a href="#" aria-label="Instagram"><AiFillInstagram /></a>
              <a href="#" aria-label="Facebook"><AiFillFacebook /></a>
              <a href="#" aria-label="TikTok"><SiTiktok /></a>
            </div>
          </div>

          {/* Column 2: Shop (SEO Links) */}
          <div className="footer-col">
            <div className="footer-heading" onClick={() => toggleSection('shop')}>
              <h3>{t("footer.shop", "Shop")}</h3>
              <span className="mobile-arrow">{openSections['shop'] ? <AiOutlineUp/> : <AiOutlineDown/>}</span>
            </div>
            <ul className={`footer-links ${openSections['shop'] ? 'open' : ''}`}>
              <li><Link to="/category/women">{t("footer.women", "Women")}</Link></li>
              <li><Link to="/category/men">{t("footer.men", "Men")}</Link></li>
              <li><Link to="/category/kids">{t("footer.kids", "Kids")}</Link></li>
              <li><Link to="/category/home">{t("footer.home", "Home & Decor")}</Link></li>
              <li><Link to="/new-arrivals">{t("footer.new", "New Arrivals")}</Link></li>
            </ul>
          </div>

          {/* Column 3: Customer Care (Trust) */}
          <div className="footer-col">
            <div className="footer-heading" onClick={() => toggleSection('help')}>
              <h3>{t("footer.help", "Help & Info")}</h3>
              <span className="mobile-arrow">{openSections['help'] ? <AiOutlineUp/> : <AiOutlineDown/>}</span>
            </div>
            <ul className={`footer-links ${openSections['help'] ? 'open' : ''}`}>
              <li><Link to="/shipping">{t("footer.shipping", "Shipping & Delivery")}</Link></li>
              <li><Link to="/returns">{t("footer.returns", "Returns & Refunds")}</Link></li>
              <li><Link to="/tracking">{t("footer.track", "Track Order")}</Link></li>
              <li><Link to="/faq">{t("footer.faq", "FAQs")}</Link></li>
              <li><Link to="/contacts">{t("footer.contact", "Contact Us")}</Link></li>
            </ul>
          </div>

          {/* Column 4: Partners (Marketplace specific) */}
          <div className="footer-col">
            <div className="footer-heading" onClick={() => toggleSection('partners')}>
              <h3>{t("footer.partners", "Partners")}</h3>
              <span className="mobile-arrow">{openSections['partners'] ? <AiOutlineUp/> : <AiOutlineDown/>}</span>
            </div>
            <ul className={`footer-links ${openSections['partners'] ? 'open' : ''}`}>
              <li><Link to="/sell">{t("footer.sell", "Become a Seller")}</Link></li>
              <li><Link to="/seller-login">{t("footer.sellerLogin", "Seller Login")}</Link></li>
              <li><Link to="/affiliate">{t("footer.affiliate", "Affiliate Program")}</Link></li>
            </ul>
          </div>

          {/* Column 5: Contacts & Contacts details */}
          <div className="footer-col contact-col">
            <h3>{t("footer.contactTitle", "Need Help?")}</h3>
            <div className="contact-item">
              <AiOutlinePhone size={20} />
              <div>
                <span className="contact-label">Call us 24/7</span>
                <a href="tel:+1234567890" className="contact-value">+1 234 567 890</a>
              </div>
            </div>
            <div className="contact-item">
              <AiOutlineMail size={20} />
              <div>
                <span className="contact-label">Email us</span>
                <a href="mailto:support@dajdaj.com" className="contact-value">support@dajdaj.com</a>
              </div>
            </div>
          </div>

        </div>

        <hr className="footer-divider" />

        <div className="footer-bottom">
          <p className="copyright">
            &copy; {new Date().getFullYear()} DajDaj Inc. All rights reserved.
          </p>
          <div className="footer-legal-links">
            <Link to="/privacy">{t("Privacy Policy")}</Link>
            <Link to="/terms">{t("Terms of Service")}</Link>
          </div>
          <div className="payment-icons">
             {/* Trust Badges */}
            <SiVisa size={32} />
            <SiMastercard size={32} />
            <SiApplepay size={32} />
          </div>
        </div>
      </div>
    </footer>
  );
}