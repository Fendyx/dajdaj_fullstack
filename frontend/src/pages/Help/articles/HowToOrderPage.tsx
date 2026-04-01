import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ChevronRight } from "lucide-react";
import "../HelpCenterPage.css";

export function HowToOrderPage() {
  return (
    <article className="help-article">
      <Helmet>
        <title>Jak złożyć zamówienie — DajDaj</title>
        <meta name="description" content="Dowiedz się jak krok po kroku złożyć zamówienie w sklepie DajDaj. Wybór produktu, personalizacja, płatność i dostawa." />
        <link rel="canonical" href="https://dajdaj.pl/pl/pomoc/jak-zlozyc-zamowienie" />
      </Helmet>

      <nav className="help-breadcrumb">
        <Link to="/">Strona główna</Link>
        <ChevronRight size={14} />
        <Link to="/pl/pomoc">Centrum pomocy</Link>
        <ChevronRight size={14} />
        <span>Jak złożyć zamówienie</span>
      </nav>

      <h1>Jak złożyć zamówienie w DajDaj?</h1>
      <p className="help-article__meta">Ostatnia aktualizacja: styczeń 2025</p>

      <p>Złożenie zamówienia w sklepie DajDaj jest proste i zajmuje tylko kilka minut. Poniżej znajdziesz szczegółowy opis każdego kroku.</p>

      <h2>Krok 1 — Wybierz produkt</h2>
      <p>Przejrzyj naszą ofertę na stronie głównej lub skorzystaj z wyszukiwarki. Kliknij na wybrany produkt aby zobaczyć szczegóły, zdjęcia i cenę.</p>

      <h2>Krok 2 — Personalizacja (jeśli dotyczy)</h2>
      <p>Część naszych produktów wymaga personalizacji — na przykład figurki 3D. W takim przypadku zostaniesz poproszony o:</p>
      <ul>
        <li>Wgranie zdjęcia (min. 1, maks. kilka zdjęć w zależności od produktu)</li>
        <li>Wpisanie dedykacji lub napisu (opcjonalnie)</li>
      </ul>
      <p>Wskazówki jak przygotować dobre zdjęcie znajdziesz w artykule <Link to="/pl/pomoc/jak-zrobic-zdjecie">Jak zrobić dobre zdjęcie?</Link></p>

      <h2>Krok 3 — Dodaj do koszyka</h2>
      <p>Kliknij przycisk <strong>"Dodaj do koszyka"</strong> lub <strong>"Kup teraz"</strong> aby przejść bezpośrednio do płatności.</p>

      <h2>Krok 4 — Dane dostawy</h2>
      <p>Podaj swoje dane do dostawy:</p>
      <ul>
        <li>Imię i nazwisko</li>
        <li>Adres e-mail (wyślemy potwierdzenie zamówienia)</li>
        <li>Numer telefonu</li>
        <li>Adres dostawy lub numer paczkomatu InPost</li>
      </ul>

      <h2>Krok 5 — Płatność</h2>
      <p>Wybierz metodę płatności: karta, BLIK, Google Pay lub Apple Pay. Szczegóły o płatnościach znajdziesz w artykule <Link to="/pl/pomoc/platnosci">Płatności</Link>.</p>

      <h2>Krok 6 — Potwierdzenie</h2>
      <p>Po udanej płatności otrzymasz e-mail z potwierdzeniem zamówienia. Możesz też śledzić status zamówienia w swoim profilu jeśli masz konto.</p>

      <div className="help-article__highlight">
        <strong>Ważne:</strong> Zamówienia na produkty personalizowane są realizowane w ciągu 7–14 dni roboczych. Standardowe produkty wysyłamy w ciągu 3–7 dni roboczych.
      </div>

      <div className="help-contact-box">
        <p>Masz pytania dotyczące zamówienia?</p>
        <p>Napisz do nas: <a href="mailto:support@dajdaj.pl">support@dajdaj.pl</a></p>
      </div>

      <div className="help-article__footer">
        <Link to="/pl/pomoc">← Wróć do centrum pomocy</Link>
        <Link to="/pl/pomoc/personalizacja-figurki">Personalizacja figurki →</Link>
      </div>
    </article>
  );
}