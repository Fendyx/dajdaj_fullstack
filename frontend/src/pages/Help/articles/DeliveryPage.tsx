import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ChevronRight } from "lucide-react";
import "../HelpCenterPage.css";

export function DeliveryPage() {
  return (
    <article className="help-article">
      <Helmet>
        <title>Dostawa i terminy realizacji — DajDaj</title>
        <meta name="description" content="Informacje o dostawie w DajDaj. Czas realizacji zamówień, dostawa InPost Paczkomat, kurier, koszty dostawy i śledzenie przesyłki." />
        <link rel="canonical" href="https://dajdaj.pl/pl/pomoc/dostawa-i-terminy" />
      </Helmet>

      <nav className="help-breadcrumb">
        <Link to="/">Strona główna</Link>
        <ChevronRight size={14} />
        <Link to="/pl/pomoc">Centrum pomocy</Link>
        <ChevronRight size={14} />
        <span>Dostawa i terminy</span>
      </nav>

      <h1>Dostawa i terminy realizacji</h1>
      <p className="help-article__meta">Ostatnia aktualizacja: styczeń 2025</p>

      <p>Wszystkie zamówienia są realizowane po potwierdzeniu płatności. Poniżej znajdziesz szczegółowe informacje o czasie realizacji i metodach dostawy.</p>

      <h2>Czas realizacji</h2>
      <ul>
        <li><strong>Produkty standardowe:</strong> 3–7 dni roboczych</li>
        <li><strong>Produkty personalizowane (figurki 3D):</strong> 7–14 dni roboczych</li>
      </ul>

      <div className="help-article__highlight">
        Czas realizacji liczymy od momentu potwierdzenia płatności, nie od złożenia zamówienia. W okresach świątecznych (Boże Narodzenie, Walentynki) czas realizacji może być wydłużony.
      </div>

      <h2>Metody dostawy</h2>

      <h2>InPost Paczkomat</h2>
      <p>Dostawa do wybranego paczkomatu InPost na terenie całej Polski. Podczas składania zamówienia wybierasz konkretny paczkomat na mapie. Gdy przesyłka dotrze, otrzymasz SMS z kodem do odbioru.</p>

      <h2>Kurier</h2>
      <p>Dostawa pod wskazany adres. Kurier dostarczy przesyłkę w godzinach 8:00–18:00. Przed dostawą otrzymasz powiadomienie SMS lub e-mail.</p>

      <h2>Śledzenie przesyłki</h2>
      <p>Po wysłaniu zamówienia otrzymasz e-mail z numerem śledzenia przesyłki. Status możesz sprawdzić na stronie przewoźnika lub w swoim profilu na DajDaj.</p>

      <h2>Obszar dostawy</h2>
      <p>Aktualnie realizujemy dostawy wyłącznie na terenie <strong>Polski</strong>. Dostawy zagraniczne planujemy wprowadzić wkrótce.</p>

      <div className="help-contact-box">
        <p>Masz pytania dotyczące dostawy?</p>
        <p>Napisz do nas: <a href="mailto:support@dajdaj.pl">support@dajdaj.pl</a></p>
      </div>

      <div className="help-article__footer">
        <Link to="/pl/pomoc">← Wróć do centrum pomocy</Link>
        <Link to="/pl/pomoc/platnosci">Płatności →</Link>
      </div>
    </article>
  );
}