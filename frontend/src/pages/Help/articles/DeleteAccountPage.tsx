import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ChevronRight } from "lucide-react";
import "../HelpCenterPage.css";

export function DeleteAccountPage() {
  return (
    <article className="help-article">
      <Helmet>
        <title>Jak usunąć konto w DajDaj — instrukcja krok po kroku</title>
        <meta name="description" content="Instrukcja jak usunąć konto w serwisie DajDaj. Dowiedz się co dzieje się z Twoimi danymi po usunięciu konta i jak to zrobić krok po kroku." />
        <link rel="canonical" href="https://dajdaj.pl/pl/pomoc/jak-usunac-konto" />
      </Helmet>

      <nav className="help-breadcrumb">
        <Link to="/">Strona główna</Link>
        <ChevronRight size={14} />
        <Link to="/pl/pomoc">Centrum pomocy</Link>
        <ChevronRight size={14} />
        <span>Jak usunąć konto</span>
      </nav>

      <h1>Jak usunąć konto w DajDaj?</h1>
      <p className="help-article__meta">Ostatnia aktualizacja: styczeń 2025</p>

      <p>Możesz usunąć swoje konto w DajDaj w dowolnym momencie. Operacja jest nieodwracalna — po usunięciu konta nie będziesz mógł go przywrócić.</p>

      <h2>Krok po kroku — jak usunąć konto</h2>
      <ol>
        <li>Zaloguj się na swoje konto na <a href="https://dajdaj.pl">dajdaj.pl</a></li>
        <li>Kliknij ikonę profilu w prawym górnym rogu</li>
        <li>Przejdź do zakładki <strong>"Ustawienia"</strong></li>
        <li>Przewiń na dół strony do sekcji <strong>"Usuń konto"</strong></li>
        <li>Kliknij przycisk <strong>"Usuń konto"</strong> i potwierdź operację</li>
      </ol>

      <div className="help-article__highlight">
        <strong>Uwaga:</strong> Usunięcie konta jest nieodwracalne. Po usunięciu stracisz dostęp do historii zamówień, zapisanych adresów i ulubionych produktów.
      </div>

      <h2>Co dzieje się z Twoimi danymi?</h2>
      <p>Po usunięciu konta:</p>
      <ul>
        <li>Twoje dane osobowe zostają usunięte lub zanonimizowane</li>
        <li>Historia zamówień jest anonimizowana — zachowujemy tylko dane finansowe wymagane przez prawo (przez 5 lat)</li>
        <li>Twoje zdjęcia wgrane do personalizacji zostają usunięte</li>
        <li>Zapisane adresy dostawy zostają usunięte</li>
      </ul>

      <h2>Nie możesz się zalogować?</h2>
      <p>Jeśli nie pamiętasz hasła i nie możesz się zalogować — napisz do nas na <a href="mailto:support@dajdaj.pl">support@dajdaj.pl</a> z prośbą o usunięcie konta. Podaj adres e-mail powiązany z kontem.</p>

      <h2>Konto Google lub Facebook</h2>
      <p>Jeśli zalogowałeś się przez Google lub Facebook — proces usunięcia konta jest taki sam. Przejdź do Ustawień w profilu i kliknij "Usuń konto".</p>

      <div className="help-contact-box">
        <p>Potrzebujesz pomocy przy usunięciu konta?</p>
        <p>Napisz do nas: <a href="mailto:support@dajdaj.pl">support@dajdaj.pl</a></p>
      </div>

      <div className="help-article__footer">
        <Link to="/pl/pomoc">← Wróć do centrum pomocy</Link>
        <Link to="/pl/pomoc/jak-zrobic-zdjecie">Jak zrobić dobre zdjęcie →</Link>
      </div>
    </article>
  );
}