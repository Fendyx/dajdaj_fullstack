import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Shield, ChevronRight } from "lucide-react";
import "./LegalPage.css";

export function PrivacyPolicyPage() {
  const { t } = useTranslation();

  return (
    <div className="legal-page">
      <Helmet>
        <title>Polityka prywatności — DajDaj</title>
        <meta name="description" content="Dowiedz się jak DajDaj przetwarza Twoje dane osobowe zgodnie z RODO. Informacje o administratorze, prawach użytkownika i bezpieczeństwie danych." />
        <link rel="canonical" href="https://dajdaj.pl/privacy" />
      </Helmet>
      <div className="legal-hero">
        <Shield size={40} className="legal-hero-icon" />
        <h1>{t("legal.privacy.title", "Privacy Policy")}</h1>
        <p className="legal-updated">{t("legal.lastUpdated", "Last updated")}: 2025-01-01</p>
      </div>

      <div className="legal-container">

        {/* Breadcrumb */}
        <nav className="legal-breadcrumb">
          <Link to="/">{t("nav.home", "Home")}</Link>
          <ChevronRight size={14} />
          <span>{t("legal.privacy.title", "Privacy Policy")}</span>
        </nav>

        <div className="legal-content">

          <section className="legal-section">
            <h2>1. {t("legal.privacy.s1.title", "Data Controller")}</h2>
            <p>{t("legal.privacy.s1.text", "The data controller is Andrii Knapp, operating the online store at dajdaj.pl.")}</p>
            <ul>
              <li>Email: <a href="mailto:privacy@dajdaj.pl">privacy@dajdaj.pl</a></li>
              <li>{t("legal.privacy.s1.website", "Website")}: <a href="https://dajdaj.pl" target="_blank" rel="noreferrer">dajdaj.pl</a></li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>2. {t("legal.privacy.s2.title", "What Data We Collect")}</h2>
            <ul>
              <li><strong>{t("legal.privacy.s2.account", "Account data")}:</strong> {t("legal.privacy.s2.accountDesc", "name, email address, password (encrypted)")}</li>
              <li><strong>{t("legal.privacy.s2.delivery", "Delivery data")}:</strong> {t("legal.privacy.s2.deliveryDesc", "first name, last name, address, postal code, city, phone number")}</li>
              <li><strong>{t("legal.privacy.s2.orders", "Order data")}:</strong> {t("legal.privacy.s2.ordersDesc", "purchase history, order details, payment status")}</li>
              <li><strong>{t("legal.privacy.s2.technical", "Technical data")}:</strong> {t("legal.privacy.s2.technicalDesc", "IP address, browser type (collected automatically)")}</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>3. {t("legal.privacy.s3.title", "Purpose and Legal Basis")}</h2>
            <div className="legal-table-wrapper">
              <table className="legal-table">
                <thead>
                  <tr>
                    <th>{t("legal.privacy.s3.purpose", "Purpose")}</th>
                    <th>{t("legal.privacy.s3.basis", "Legal Basis")}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{t("legal.privacy.s3.r1p", "Order fulfillment")}</td>
                    <td>{t("legal.privacy.s3.r1b", "Art. 6(1)(b) GDPR — contract performance")}</td>
                  </tr>
                  <tr>
                    <td>{t("legal.privacy.s3.r2p", "User account management")}</td>
                    <td>{t("legal.privacy.s3.r2b", "Art. 6(1)(b) GDPR — contract performance")}</td>
                  </tr>
                  <tr>
                    <td>{t("legal.privacy.s3.r3p", "Order confirmation emails")}</td>
                    <td>{t("legal.privacy.s3.r3b", "Art. 6(1)(b) GDPR — contract performance")}</td>
                  </tr>
                  <tr>
                    <td>{t("legal.privacy.s3.r4p", "Financial record keeping")}</td>
                    <td>{t("legal.privacy.s3.r4b", "Art. 6(1)(c) GDPR — legal obligation")}</td>
                  </tr>
                  <tr>
                    <td>{t("legal.privacy.s3.r5p", "Service improvement")}</td>
                    <td>{t("legal.privacy.s3.r5b", "Art. 6(1)(f) GDPR — legitimate interest")}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="legal-section">
            <h2>4. {t("legal.privacy.s4.title", "Third-Party Data Sharing")}</h2>
            <ul>
              <li><strong>Stripe Inc.</strong> — {t("legal.privacy.s4.stripe", "payment processing (stripe.com/privacy)")}</li>
              <li><strong>Cloudinary Inc.</strong> — {t("legal.privacy.s4.cloudinary", "storage of uploaded photos for personalized orders")}</li>
              <li><strong>InPost / Courier</strong> — {t("legal.privacy.s4.courier", "to the extent necessary for delivery")}</li>
              <li><strong>Render.com</strong> — {t("legal.privacy.s4.render", "application hosting")}</li>
              <li><strong>MongoDB Atlas</strong> — {t("legal.privacy.s4.mongo", "database storage")}</li>
            </ul>
            <p>{t("legal.privacy.s4.noSell", "Your data is never sold or shared with third parties for marketing purposes.")}</p>
          </section>

          <section className="legal-section">
            <h2>5. {t("legal.privacy.s5.title", "Data Retention")}</h2>
            <ul>
              <li><strong>{t("legal.privacy.s5.account", "Account data")}:</strong> {t("legal.privacy.s5.accountDesc", "until account deletion")}</li>
              <li><strong>{t("legal.privacy.s5.orders", "Order data")}:</strong> {t("legal.privacy.s5.ordersDesc", "5 years from purchase date (tax regulations)")}</li>
              <li><strong>{t("legal.privacy.s5.technical", "Technical data")}:</strong> {t("legal.privacy.s5.technicalDesc", "12 months")}</li>
            </ul>
            <p>{t("legal.privacy.s5.anon", "Upon account deletion, personal data in orders is anonymized — we retain only financial information required by law.")}</p>
          </section>

          <section className="legal-section">
            <h2>6. {t("legal.privacy.s6.title", "Your Rights")}</h2>
            <ul>
              <li><strong>{t("legal.privacy.s6.access", "Right of access")}</strong> — {t("legal.privacy.s6.accessDesc", "request information about processed data")}</li>
              <li><strong>{t("legal.privacy.s6.rectification", "Right to rectification")}</strong> — {t("legal.privacy.s6.rectificationDesc", "correct inaccurate data")}</li>
              <li><strong>{t("legal.privacy.s6.erasure", "Right to erasure")}</strong> — {t("legal.privacy.s6.erasureDesc", "delete your account in profile settings")}</li>
              <li><strong>{t("legal.privacy.s6.portability", "Right to data portability")}</strong> — {t("legal.privacy.s6.portabilityDesc", "receive your data in machine-readable format")}</li>
              <li><strong>{t("legal.privacy.s6.restriction", "Right to restriction")}</strong> — {t("legal.privacy.s6.restrictionDesc", "request limitation of processing")}</li>
              <li><strong>{t("legal.privacy.s6.objection", "Right to object")}</strong> — {t("legal.privacy.s6.objectionDesc", "object to processing based on legitimate interest")}</li>
            </ul>
            <p>
              {t("legal.privacy.s6.contact", "To exercise these rights, contact us at:")}{" "}
              <a href="mailto:privacy@dajdaj.pl">privacy@dajdaj.pl</a>
            </p>
            <p>{t("legal.privacy.s6.uodo", "You also have the right to lodge a complaint with the President of the Personal Data Protection Office (UODO), ul. Stawki 2, 00-193 Warsaw, Poland.")}</p>
          </section>

          <section className="legal-section">
            <h2>7. {t("legal.privacy.s7.title", "Cookies")}</h2>
            <ul>
              <li><strong>{t("legal.privacy.s7.necessary", "Necessary")}:</strong> {t("legal.privacy.s7.necessaryDesc", "user session, authorization token (cannot be disabled)")}</li>
              <li><strong>{t("legal.privacy.s7.analytics", "Analytics")}:</strong> {t("legal.privacy.s7.analyticsDesc", "Google Analytics (optional, with user consent)")}</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>8. {t("legal.privacy.s8.title", "Data Security")}</h2>
            <ul>
              <li>{t("legal.privacy.s8.bcrypt", "Password encryption (bcrypt)")}</li>
              <li>{t("legal.privacy.s8.https", "HTTPS protocol")}</li>
              <li>{t("legal.privacy.s8.db", "Restricted database access")}</li>
              <li>{t("legal.privacy.s8.jwt", "JWT authorization for all account operations")}</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>9. {t("legal.privacy.s9.title", "Contact")}</h2>
            <ul>
              <li>GDPR: <a href="mailto:privacy@dajdaj.pl">privacy@dajdaj.pl</a></li>
              <li>{t("legal.privacy.s9.support", "Support")}: <a href="mailto:support@dajdaj.pl">support@dajdaj.pl</a></li>
            </ul>
          </section>

        </div>

        <div className="legal-footer-nav">
          <Link to="/terms" className="legal-nav-link">
            {t("legal.terms.title", "Terms of Service")} <ChevronRight size={16} />
          </Link>
        </div>

      </div>
    </div>
  );
}