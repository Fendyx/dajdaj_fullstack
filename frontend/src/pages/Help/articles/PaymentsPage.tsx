import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ChevronRight } from "lucide-react";
import "../HelpCenterPage.css";

export function PaymentsPage() {
  return (
    <article className="help-article">
      <Helmet>
        <title>Płatności — BLIK, karta, Google Pay | DajDaj</title>
        <meta name="description" content="Jak płacić w sklepie DajDaj? Dostępne metody płatności: BLIK, karta kredytowa, Google Pay, Apple Pay. Bezpieczne płatności przez Stripe." />
        <link rel="canonical" href="https://dajdaj.pl/pl/pomoc/platnosci" />
      </Helmet>

      <nav className="help-breadcrumb">
        <Link to="/">Strona główna</Link>
        <ChevronRight size={14} />
        <Link to="/pl/pomoc">Centrum pomocy</Link>
        <ChevronRight size={14} />
        <span>Płatności</span>
      </nav>

      <h1>Płatności w DajDaj</h1>
      <p className="help-article__meta">Ostatnia aktualizacja: styczeń 2025</p>

      <p>W sklepie DajDaj możesz płacić na kilka wygodnych sposobów. Wszystkie transakcje są szyfrowane i bezpieczne.</p>

      <h2>Dostępne metody płatności</h2>
      <ul>
        <li><strong>BLIK</strong> — wpisz 6-cyfrowy kod z aplikacji bankowej</li>
        <li><strong>Karta kredytowa / debetowa</strong> — Visa, Mastercard</li>
        <li><strong>Google Pay</strong> — szybka płatność przez konto Google</li>
        <li><strong>Apple Pay</strong> — szybka płatność na urządzeniach Apple</li>
      </ul>

      <h2>Bezpieczeństwo płatności</h2>
      <p>Płatności w DajDaj są obsługiwane przez <strong>Stripe</strong> — jeden z najbezpieczniejszych systemów płatności na świecie, certyfikowany zgodnie ze standardem PCI DSS.</p>
      <ul>
        <li>DajDaj nie przechowuje danych Twojej karty</li>
        <li>Wszystkie transakcje są szyfrowane (SSL/TLS)</li>
        <li>Stripe jest używany przez miliony firm na całym świecie</li>
      </ul>

      <h2>Kiedy zostanę obciążony?</h2>
      <p>Płatność jest pobierana w momencie złożenia zamówienia. Realizacja zamówienia rozpoczyna się po potwierdzeniu płatności.</p>

      <h2>Co zrobić jeśli płatność nie przeszła?</h2>
      <ul>
        <li>Sprawdź czy masz wystarczające środki na koncie</li>
        <li>Upewnij się że dane karty są wpisane poprawnie</li>
        <li>Przy BLIK — kod jest ważny tylko 2 minuty, wygeneruj nowy jeśli minął czas</li>
        <li>Spróbuj innej metody płatności</li>
        <li>Skontaktuj się z nami jeśli problem się powtarza</li>
      </ul>

      <h2>Faktury i paragony</h2>
      <p>Po udanej płatności otrzymasz potwierdzenie zamówienia na adres e-mail. Jeśli potrzebujesz faktury VAT — skontaktuj się z nami podając numer zamówienia.</p>

      <div className="help-contact-box">
        <p>Masz problemy z płatnością?</p>
        <p>Napisz do nas: <a href="mailto:support@dajdaj.pl">support@dajdaj.pl</a></p>
      </div>

      <div className="help-article__footer">
        <Link to="/pl/pomoc">← Wróć do centrum pomocy</Link>
        <Link to="/pl/pomoc/zwroty-i-reklamacje">Zwroty i reklamacje →</Link>
      </div>
    </article>
  );
}