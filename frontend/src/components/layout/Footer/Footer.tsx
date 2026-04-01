import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

// 🔥 Lucide для системных иконок (стрелки, контакты, соцсети-символы)
import { 
  Instagram, 
  Facebook, 
  Mail, 
  Phone, 
  ChevronDown, 
  ChevronUp, 
  Send 
} from 'lucide-react';

// 🔥 React Icons ТОЛЬКО для брендов, которых нет в Lucide
import { SiTiktok, SiVisa, SiMastercard, SiApplepay } from 'react-icons/si';

import logo from "@/assets/img/dajdaj_180.png"
import './Footer.css';

interface FooterColumnProps {
  title: string;
  sectionKey: string;
  isOpen: boolean;
  toggleSection: (key: string) => void;
  children: ReactNode;
}

const FooterColumn = ({ title, sectionKey, isOpen, toggleSection, children }: FooterColumnProps) => (
  <div className="footer-col">
    <div className="footer-heading" onClick={() => toggleSection(sectionKey)}>
      <h3>{title}</h3>
      <span className="mobile-arrow">
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </span>
    </div>
    <ul className={`footer-links ${isOpen ? 'open' : ''}`}>
      {children}
    </ul>
  </div>
);

export const Footer = () => {
  const { t } = useTranslation();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <footer className="footer">
      <div className="newsletter-bar">
        <div className="newsletter-content">
          <h4>{t("footer.newsletter.title", "Subscribe to our news")}</h4>
          <p>{t("footer.newsletter.subtitle", "Get 10% off your first order")}</p>
        </div>
        <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
          <input type="email" placeholder={t("footer.newsletter.placeholder", "Your email")} required />
          <button type="submit" className="flex items-center gap-2">
            <span>{t("footer.newsletter.button", "Subscribe")}</span>
            <Send size={16} />
          </button>
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
              {/* Instagram и Facebook в Lucide отличные и вписываются в стиль */}
              <a href="https://instagram.com" target="_blank" rel="noreferrer"><Instagram size={22} /></a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer"><Facebook size={22} /></a>
              <a href="https://tiktok.com" target="_blank" rel="noreferrer"><SiTiktok size={20} /></a>
            </div>
          </div>

          <FooterColumn title={t("footer.shop", "Shop")} sectionKey="shop" isOpen={!!openSections['shop']} toggleSection={toggleSection}>
            <li><Link to="/category/women">{t("footer.women", "Women")}</Link></li>
            <li><Link to="/category/men">{t("footer.men", "Men")}</Link></li>
            <li><Link to="/category/kids">{t("footer.kids", "Kids")}</Link></li>
            <li><Link to="/category/home">{t("footer.home", "Home & Decor")}</Link></li>
          </FooterColumn>

          <FooterColumn title={t("footer.help", "Pomoc")} sectionKey="help" isOpen={!!openSections['help']} toggleSection={toggleSection}>
            <li><Link to="/pl/pomoc">Centrum pomocy</Link></li>
            <li><Link to="/pl/pomoc/jak-zlozyc-zamowienie">Jak złożyć zamówienie?</Link></li>
            <li><Link to="/pl/pomoc/dostawa-i-terminy">Dostawa i terminy</Link></li>
            <li><Link to="/pl/pomoc/zwroty-i-reklamacje">Zwroty i reklamacje</Link></li>
            <li><Link to="/pl/pomoc/platnosci">Płatności</Link></li>
            <li><Link to="/privacy">Polityka prywatności</Link></li>
            <li><Link to="/terms">Regulamin</Link></li>
          </FooterColumn>

          <FooterColumn title={t("footer.partners", "Partners")} sectionKey="partners" isOpen={!!openSections['partners']} toggleSection={toggleSection}>
            <li><Link to="/sell">{t("footer.sell", "Become a Seller")}</Link></li>
            <li><Link to="/affiliate">{t("footer.affiliate", "Affiliate Program")}</Link></li>
          </FooterColumn>

          <div className="footer-col contact-col">
            <h3>{t("footer.contactTitle", "Need Help?")}</h3>
            <div className="contact-item">
              <Phone size={20} className="text-gray-400" />
              <div>
                <span className="contact-label">Call us 24/7</span>
                <a href="tel:+1234567890" className="contact-value">+1 234 567 890</a>
              </div>
            </div>
            <div className="contact-item">
              <Mail size={20} className="text-gray-400" />
              <div>
                <span className="contact-label">Email us</span>
                <a href="mailto:support@dajdaj.pl" className="contact-value">support@dajdaj.pl</a>
              </div>
            </div>
          </div>

        </div>

        <hr className="footer-divider" />

        <div className="footer-bottom">
          <p className="copyright">&copy; {new Date().getFullYear()} DajDaj Inc.</p>
          <div className="footer-legal-links">
            <Link to="/privacy">{t("Privacy Policy")}</Link>
            <Link to="/terms">{t("Terms of Service")}</Link>
          </div>
          <div className="payment-icons">
            {/* Оставляем реальные логотипы платежных систем */}
            <SiVisa size={32} />
            <SiMastercard size={32} />
            <SiApplepay size={32} />
          </div>
        </div>
      </div>
    </footer>
  );
};