import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ChevronRight } from "lucide-react";
import "../HelpCenterPage.css";

export function PersonalizationPage() {
  return (
    <article className="help-article">
      <Helmet>
        <title>Personalizacja figurki 3D — jak to działa | DajDaj</title>
        <meta name="description" content="Jak działa personalizacja figurki 3D w DajDaj? Jakie zdjęcia są potrzebne, jak długo trwa realizacja i co można spersonalizować." />
        <link rel="canonical" href="https://dajdaj.pl/pl/pomoc/personalizacja-figurki" />
      </Helmet>

      <nav className="help-breadcrumb">
        <Link to="/">Strona główna</Link>
        <ChevronRight size={14} />
        <Link to="/pl/pomoc">Centrum pomocy</Link>
        <ChevronRight size={14} />
        <span>Personalizacja figurki</span>
      </nav>

      <h1>Personalizacja figurki — jak to działa?</h1>
      <p className="help-article__meta">Ostatnia aktualizacja: styczeń 2025</p>

      <p>Figurki personalizowane to nasz flagowy produkt. Każda figurka jest tworzona indywidualnie na podstawie Twoich zdjęć. Poniżej znajdziesz wszystko co musisz wiedzieć przed złożeniem zamówienia.</p>

      <h2>Co można spersonalizować?</h2>
      <ul>
        <li>Wygląd postaci — twarz, fryzura, strój</li>
        <li>Pozę figurki (w zależności od wybranego modelu)</li>
        <li>Dedykację lub napis na podstawce (opcjonalnie)</li>
      </ul>

      <h2>Jakie zdjęcia są potrzebne?</h2>
      <p>Do stworzenia figurki potrzebujemy minimum jednego wyraźnego zdjęcia twarzy. Im więcej zdjęć z różnych kątów, tym dokładniejsza będzie figurka.</p>
      <ul>
        <li>Zdjęcie frontalne twarzy — obowiązkowe</li>
        <li>Zdjęcie z profilu — zalecane</li>
        <li>Zdjęcie całej sylwetki — jeśli chcesz odwzorować strój</li>
      </ul>

      <div className="help-article__highlight">
        Szczegółowe wskazówki jak przygotować idealne zdjęcie znajdziesz w artykule <Link to="/pl/pomoc/jak-zrobic-zdjecie">Jak zrobić dobre zdjęcie do figurki?</Link>
      </div>

      <h2>Jak przebiega proces?</h2>
      <ol>
        <li>Wybierasz model figurki i składasz zamówienie</li>
        <li>Wgrywasz zdjęcia podczas składania zamówienia</li>
        <li>Nasz zespół tworzy figurkę na podstawie Twoich zdjęć</li>
        <li>Figurka jest drukowana i wysyłana do Ciebie</li>
      </ol>

      <h2>Ile trwa realizacja?</h2>
      <p>Figurki personalizowane są wykonywane w ciągu <strong>7–14 dni roboczych</strong> od momentu potwierdzenia płatności. W okresach świątecznych czas realizacji może być dłuższy.</p>

      <h2>Czy mogę zwrócić figurkę personalizowaną?</h2>
      <p>Niestety produkty personalizowane nie podlegają zwrotowi ani wymianie, chyba że są wadliwe lub niezgodne z zamówieniem. Więcej informacji znajdziesz w artykule <Link to="/pl/pomoc/zwroty-i-reklamacje">Zwroty i reklamacje</Link>.</p>

      <div className="help-contact-box">
        <p>Masz pytania dotyczące personalizacji?</p>
        <p>Napisz do nas: <a href="mailto:support@dajdaj.pl">support@dajdaj.pl</a></p>
      </div>

      <div className="help-article__footer">
        <Link to="/pl/pomoc">← Wróć do centrum pomocy</Link>
        <Link to="/pl/pomoc/dostawa-i-terminy">Dostawa i terminy →</Link>
      </div>
    </article>
  );
}