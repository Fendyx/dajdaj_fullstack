import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ChevronRight } from "lucide-react";
import "../HelpCenterPage.css";

export function ReturnsPage() {
  return (
    <article className="help-article">
      <Helmet>
        <title>Zwroty i reklamacje — DajDaj</title>
        <meta name="description" content="Jak zwrócić produkt lub złożyć reklamację w DajDaj? Informacje o prawie do odstąpienia od umowy, produktach personalizowanych i czasie rozpatrzenia reklamacji." />
        <link rel="canonical" href="https://dajdaj.pl/pl/pomoc/zwroty-i-reklamacje" />
      </Helmet>

      <nav className="help-breadcrumb">
        <Link to="/">Strona główna</Link>
        <ChevronRight size={14} />
        <Link to="/pl/pomoc">Centrum pomocy</Link>
        <ChevronRight size={14} />
        <span>Zwroty i reklamacje</span>
      </nav>

      <h1>Zwroty i reklamacje</h1>
      <p className="help-article__meta">Ostatnia aktualizacja: styczeń 2025</p>

      <h2>Prawo do odstąpienia od umowy</h2>
      <p>Zgodnie z przepisami prawa konsument ma prawo odstąpić od umowy zawartej na odległość w ciągu <strong>14 dni</strong> od otrzymania towaru, bez podawania przyczyny.</p>

      <div className="help-article__highlight">
        <strong>Ważne:</strong> Prawo do odstąpienia od umowy nie dotyczy produktów personalizowanych wykonanych na indywidualne zamówienie (np. figurki 3D z Twoim zdjęciem). Takich produktów nie można zwrócić ani wymienić, chyba że są wadliwe.
      </div>

      <h2>Jak złożyć zwrot?</h2>
      <ol>
        <li>Napisz do nas na <a href="mailto:support@dajdaj.pl">support@dajdaj.pl</a> z informacją o chęci zwrotu</li>
        <li>Podaj numer zamówienia i powód zwrotu</li>
        <li>Wyślij produkt na nasz adres w ciągu 14 dni</li>
        <li>Zwrot płatności nastąpi w ciągu 14 dni od otrzymania towaru</li>
      </ol>
      <p>Koszty odesłania produktu ponosi Klient.</p>

      <h2>Reklamacja — produkt wadliwy lub niezgodny z zamówieniem</h2>
      <p>Jeśli otrzymałeś produkt wadliwy lub niezgodny z zamówieniem — masz pełne prawo do reklamacji niezależnie od tego czy produkt był personalizowany.</p>

      <h2>Jak złożyć reklamację?</h2>
      <ol>
        <li>Napisz do nas na <a href="mailto:support@dajdaj.pl">support@dajdaj.pl</a></li>
        <li>Podaj numer zamówienia</li>
        <li>Opisz wadę i dołącz zdjęcia produktu</li>
        <li>Reklamacja zostanie rozpatrzona w ciągu <strong>14 dni roboczych</strong></li>
      </ol>

      <h2>Zwrot pieniędzy</h2>
      <p>Zwrot środków następuje tą samą metodą płatności której użyłeś przy zakupie. Czas oczekiwania zależy od Twojego banku — zazwyczaj 3–5 dni roboczych.</p>

      <div className="help-contact-box">
        <p>Chcesz złożyć zwrot lub reklamację?</p>
        <p>Napisz do nas: <a href="mailto:support@dajdaj.pl">support@dajdaj.pl</a></p>
      </div>

      <div className="help-article__footer">
        <Link to="/pl/pomoc">← Wróć do centrum pomocy</Link>
        <Link to="/pl/pomoc/jak-usunac-konto">Jak usunąć konto →</Link>
      </div>
    </article>
  );
}