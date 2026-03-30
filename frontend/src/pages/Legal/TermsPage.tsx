import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ScrollText, ChevronRight } from "lucide-react";
import "./LegalPage.css";

export function TermsPage() {
  const { t } = useTranslation();

  return (
    <div className="legal-page">
      <Helmet>
        <title>Regulamin sklepu — DajDaj</title>
        <meta name="description" content="Regulamin sklepu internetowego DajDaj. Zasady składania zamówień, płatności, dostaw, reklamacji i zwrotów." />
        <link rel="canonical" href="https://dajdaj.pl/terms" />
      </Helmet>
      <div className="legal-hero">
        <ScrollText size={40} className="legal-hero-icon" />
        <h1>{t("legal.terms.title", "Terms of Service")}</h1>
        <p className="legal-updated">{t("legal.lastUpdated", "Last updated")}: 2025-01-01</p>
      </div>

      <div className="legal-container">

        {/* Breadcrumb */}
        <nav className="legal-breadcrumb">
          <Link to="/">{t("nav.home", "Home")}</Link>
          <ChevronRight size={14} />
          <span>{t("legal.terms.title", "Terms of Service")}</span>
        </nav>

        <div className="legal-content">

          <section className="legal-section">
            <h2>1. {t("legal.terms.s1.title", "General Provisions")}</h2>
            <p>{t("legal.terms.s1.p1", "The online store available at dajdaj.pl is operated by Andrii Knapp, hereinafter referred to as the Seller.")}</p>
            <p>{t("legal.terms.s1.p2", "These Terms govern the use of the store, placing orders, and sales.")}</p>
            <p>{t("legal.terms.s1.contact", "Contact")}: <a href="mailto:support@dajdaj.pl">support@dajdaj.pl</a></p>
          </section>

          <section className="legal-section">
            <h2>2. {t("legal.terms.s2.title", "Registration and User Account")}</h2>
            <ul>
              <li>{t("legal.terms.s2.i1", "Account registration is optional but enables order tracking and saving delivery details.")}</li>
              <li>{t("legal.terms.s2.i2", "The user agrees to provide accurate information and not share their password with third parties.")}</li>
              <li>{t("legal.terms.s2.i3", "The Seller reserves the right to delete accounts that violate these Terms.")}</li>
              <li>{t("legal.terms.s2.i4", "Users may delete their account at any time from the profile settings.")}</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>3. {t("legal.terms.s3.title", "Orders")}</h2>
            <ul>
              <li>{t("legal.terms.s3.i1", "Orders can be placed 24 hours a day, 7 days a week.")}</li>
              <li>{t("legal.terms.s3.i2", "An order is placed after completing the form and making payment.")}</li>
              <li>{t("legal.terms.s3.i3", "After placing an order, the Customer receives a confirmation to the provided email address.")}</li>
              <li>{t("legal.terms.s3.i4", "The Seller reserves the right to cancel an order if a product is unavailable — in such case a full refund will be issued.")}</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>4. {t("legal.terms.s4.title", "Personalized Products")}</h2>
            <div className="legal-highlight">
              <p><strong>{t("legal.terms.s4.noReturn", "Personalized products are not eligible for return or exchange")}</strong> {t("legal.terms.s4.noReturnDesc", "unless they are defective or do not match the order.")}</p>
            </div>
            <ul>
              <li>{t("legal.terms.s4.i1", "Personalized products are made to individual order.")}</li>
              <li>{t("legal.terms.s4.i2", "By uploading a photo, the Customer confirms they have the rights to it or consent from the people pictured.")}</li>
              <li>{t("legal.terms.s4.i3", "The Seller bears no responsibility for content submitted by the Customer.")}</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>5. {t("legal.terms.s5.title", "Prices and Payments")}</h2>
            <ul>
              <li>{t("legal.terms.s5.i1", "All prices are gross prices in Polish Zloty (PLN).")}</li>
              <li>{t("legal.terms.s5.i2", "Available payment methods: credit/debit card, BLIK, Google Pay, Apple Pay.")}</li>
              <li>{t("legal.terms.s5.i3", "Payments are processed by Stripe Inc. — a secure payment system compliant with PCI DSS.")}</li>
              <li>{t("legal.terms.s5.i4", "The Seller does not store payment card data.")}</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>6. {t("legal.terms.s6.title", "Delivery")}</h2>
            <ul>
              <li>{t("legal.terms.s6.i1", "Order fulfillment begins after payment is confirmed.")}</li>
              <li><strong>InPost Paczkomat</strong> — {t("legal.terms.s6.inpost", "delivery to a parcel locker")}</li>
              <li><strong>{t("legal.terms.s6.courier", "Courier")}</strong> — {t("legal.terms.s6.courierDesc", "delivery to the specified address")}</li>
              <li>{t("legal.terms.s6.standard", "Standard order processing time")}: <strong>3–7 {t("legal.terms.s6.days", "business days")}</strong></li>
              <li>{t("legal.terms.s6.personalized", "Personalized order processing time")}: <strong>7–14 {t("legal.terms.s6.days", "business days")}</strong></li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>7. {t("legal.terms.s7.title", "Complaints")}</h2>
            <ul>
              <li>{t("legal.terms.s7.i1", "The Seller is liable for physical and legal defects of products in accordance with warranty regulations.")}</li>
              <li>{t("legal.terms.s7.i2", "Complaints should be submitted to:")}{" "}<a href="mailto:support@dajdaj.pl">support@dajdaj.pl</a></li>
              <li>{t("legal.terms.s7.i3", "Include: order number, description of the defect, photos if applicable.")}</li>
              <li>{t("legal.terms.s7.i4", "Complaints will be resolved within 14 business days.")}</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>8. {t("legal.terms.s8.title", "Right of Withdrawal")}</h2>
            <div className="legal-highlight">
              <p>{t("legal.terms.s8.info", "Consumers have the right to withdraw from the contract without giving a reason within")} <strong>14 {t("legal.terms.s8.days", "days")}</strong> {t("legal.terms.s8.info2", "of receiving the goods.")}</p>
            </div>
            <ul>
              <li>{t("legal.terms.s8.i1", "The right of withdrawal does not apply to personalized products made to individual order.")}</li>
              <li>{t("legal.terms.s8.i2", "To withdraw, notify the Seller by email:")}{" "}<a href="mailto:support@dajdaj.pl">support@dajdaj.pl</a></li>
              <li>{t("legal.terms.s8.i3", "Return the goods within 14 days of submitting the withdrawal notice.")}</li>
              <li>{t("legal.terms.s8.i4", "Return shipping costs are borne by the Customer.")}</li>
              <li>{t("legal.terms.s8.i5", "Payment will be refunded within 14 days of the Seller receiving the returned goods.")}</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>9. {t("legal.terms.s9.title", "Final Provisions")}</h2>
            <ul>
              <li>{t("legal.terms.s9.i1", "These Terms are governed by Polish law.")}</li>
              <li>{t("legal.terms.s9.i2", "Disputes will be resolved by the competent common court.")}</li>
              <li>
                {t("legal.terms.s9.odr", "Consumers may use out-of-court dispute resolution — ODR platform:")}{" "}
                <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noreferrer">ec.europa.eu/consumers/odr</a>
              </li>
            </ul>
          </section>

        </div>

        <div className="legal-footer-nav">
          <Link to="/privacy" className="legal-nav-link">
            {t("legal.privacy.title", "Privacy Policy")} <ChevronRight size={16} />
          </Link>
        </div>

      </div>
    </div>
  );
}