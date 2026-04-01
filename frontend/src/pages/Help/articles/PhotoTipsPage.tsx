import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ChevronRight } from "lucide-react";
import "../HelpCenterPage.css";

export function PhotoTipsPage() {
  return (
    <article className="help-article">
      <Helmet>
        <title>Jak zrobić dobre zdjęcie do figurki 3D — DajDaj</title>
        <meta name="description" content="Wskazówki jak przygotować idealne zdjęcie do personalizowanej figurki 3D. Oświetlenie, kąt, tło i najczęstsze błędy przy zamawianiu figurki." />
        <link rel="canonical" href="https://dajdaj.pl/pl/pomoc/jak-zrobic-zdjecie" />
      </Helmet>

      <nav className="help-breadcrumb">
        <Link to="/">Strona główna</Link>
        <ChevronRight size={14} />
        <Link to="/pl/pomoc">Centrum pomocy</Link>
        <ChevronRight size={14} />
        <span>Jak zrobić dobre zdjęcie</span>
      </nav>

      <h1>Jak zrobić dobre zdjęcie do figurki 3D?</h1>
      <p className="help-article__meta">Ostatnia aktualizacja: styczeń 2025</p>

      <p>Jakość zdjęcia ma bezpośredni wpływ na dokładność i wygląd Twojej figurki. Poniżej znajdziesz wskazówki które pomogą Ci przygotować idealne zdjęcie.</p>

      <h2>Wymagania podstawowe</h2>
      <ul>
        <li>Zdjęcie frontalne twarzy — <strong>obowiązkowe</strong></li>
        <li>Twarz powinna zajmować co najmniej 50% zdjęcia</li>
        <li>Minimalna rozdzielczość: 800x800 pikseli</li>
        <li>Format: JPG lub PNG</li>
      </ul>

      <h2>Oświetlenie</h2>
      <ul>
        <li>Najlepsze jest naturalne światło dzienne — stań przy oknie</li>
        <li>Unikaj fotografowania pod słońce — twarz będzie ciemna</li>
        <li>Unikaj mocnych cieni na twarzy</li>
        <li>Unikaj lamp błyskowych które mogą powodować odblaski</li>
      </ul>

      <h2>Kąt i pozycja</h2>
      <ul>
        <li>Aparat powinien być na wysokości oczu</li>
        <li>Patrz prosto w obiektyw</li>
        <li>Głowa powinna być prosta, nie przechylona</li>
        <li>Dostarcz też zdjęcie z profilu jeśli chcesz dokładniejszą figurkę</li>
      </ul>

      <h2>Tło i otoczenie</h2>
      <ul>
        <li>Jednolite, jasne tło — biała ściana jest idealna</li>
        <li>Unikaj tłumaczącego się tła (wzory, inne osoby)</li>
        <li>Włosy nie powinny zlewać się z tłem</li>
      </ul>

      <h2>Najczęstsze błędy</h2>
      <ul>
        <li>❌ Zdjęcie zbyt ciemne lub rozmazane</li>
        <li>❌ Twarz zasłonięta okularami przeciwsłonecznymi lub czapką</li>
        <li>❌ Zdjęcie z grupy — nie wiemy której osoby dotyczy zamówienie</li>
        <li>❌ Zdjęcie z filtrami lub efektami Snapchat/Instagram</li>
        <li>❌ Stare zdjęcie o niskiej rozdzielczości</li>
      </ul>

      <div className="help-article__highlight">
        <strong>Wskazówka:</strong> Najlepsze efekty dają zdjęcia zrobione smartfonem przy oknie w pochmurny dzień — wtedy światło jest miękkie i równomierne, bez ostrych cieni.
      </div>

      <h2>Ile zdjęć wgrać?</h2>
      <p>Im więcej zdjęć z różnych kątów, tym dokładniejsza figurka. Zalecamy minimum 2–3 zdjęcia: frontalne, z profilu i opcjonalnie z 3/4.</p>

      <div className="help-contact-box">
        <p>Masz pytania dotyczące zdjęć do figurki?</p>
        <p>Napisz do nas: <a href="mailto:support@dajdaj.pl">support@dajdaj.pl</a></p>
      </div>

      <div className="help-article__footer">
        <Link to="/pl/pomoc">← Wróć do centrum pomocy</Link>
        <Link to="/pl/pomoc/personalizacja-figurki">Personalizacja figurki →</Link>
      </div>
    </article>
  );
}