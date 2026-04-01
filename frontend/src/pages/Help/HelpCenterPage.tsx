import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { HelpCircle, ChevronRight } from "lucide-react";
import "./HelpCenterPage.css";

const articles = [
  {
    icon: "🛒",
    title: "Jak złożyć zamówienie?",
    desc: "Krok po kroku jak zamówić produkt w sklepie DajDaj.",
    href: "/pl/pomoc/jak-zlozyc-zamowienie",
  },
  {
    icon: "🎨",
    title: "Personalizacja figurki",
    desc: "Jak działa personalizacja i jakie zdjęcia są potrzebne.",
    href: "/pl/pomoc/personalizacja-figurki",
  },
  {
    icon: "📦",
    title: "Dostawa i terminy",
    desc: "Czas realizacji, metody dostawy, InPost i kurier.",
    href: "/pl/pomoc/dostawa-i-terminy",
  },
  {
    icon: "💳",
    title: "Płatności",
    desc: "BLIK, karta, Google Pay, Apple Pay — jak płacić w DajDaj.",
    href: "/pl/pomoc/platnosci",
  },
  {
    icon: "↩️",
    title: "Zwroty i reklamacje",
    desc: "Kiedy można zwrócić produkt i jak złożyć reklamację.",
    href: "/pl/pomoc/zwroty-i-reklamacje",
  },
  {
    icon: "🗑️",
    title: "Jak usunąć konto?",
    desc: "Instrukcja usunięcia konta w serwisie DajDaj.",
    href: "/pl/pomoc/jak-usunac-konto",
  },
  {
    icon: "📸",
    title: "Jak zrobić dobre zdjęcie?",
    desc: "Wskazówki jak przygotować zdjęcie do figurki personalizowanej.",
    href: "/pl/pomoc/jak-zrobic-zdjecie",
  },
];

export function HelpCenterPage() {
  return (
    <div className="help-page">
      <Helmet>
        <title>Centrum pomocy — DajDaj</title>
        <meta name="description" content="Centrum pomocy sklepu DajDaj. Znajdź odpowiedzi na pytania o zamówienia, dostawę, płatności, personalizację i zwroty." />
        <link rel="canonical" href="https://dajdaj.pl/pl/pomoc" />
      </Helmet>

      <div className="help-hero">
        <HelpCircle size={48} className="help-hero__icon" />
        <h1>Centrum pomocy</h1>
        <p>Jak możemy Ci pomóc? Wybierz temat który Cię interesuje.</p>
      </div>

      <nav className="help-breadcrumb">
        <Link to="/">Strona główna</Link>
        <ChevronRight size={14} />
        <span>Centrum pomocy</span>
      </nav>

      <div className="help-grid">
        {articles.map((a) => (
          <Link key={a.href} to={a.href} className="help-card">
            <span className="help-card__icon">{a.icon}</span>
            <span className="help-card__title">{a.title}</span>
            <span className="help-card__desc">{a.desc}</span>
          </Link>
        ))}
      </div>

      <div className="help-contact-box">
        <p>Nie znalazłeś odpowiedzi na swoje pytanie?</p>
        <p>Napisz do nas: <a href="mailto:support@dajdaj.pl">support@dajdaj.pl</a></p>
      </div>
    </div>
  );
}