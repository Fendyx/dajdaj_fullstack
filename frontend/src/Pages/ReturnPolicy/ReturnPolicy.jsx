import React from "react";
import "./ReturnPolicy.css";

const ReturnPolicy = () => {
  return (
    <div className="return-policy">
      <h1 className="return-policy__title">Polityka zwrotów</h1>

      <ol className="return-policy__list">
        <li>
          <h2>Prawo do odstąpienia od umowy</h2>
          <p>
            Zgodnie z <strong>ustawą z dnia 30 maja 2014 r. o prawach konsumenta</strong>,
            konsument ma prawo odstąpić od umowy zawartej na odległość bez podania przyczyny
            w terminie <strong>14 dni</strong> od dnia otrzymania towaru.
          </p>
        </li>

        <li>
          <h2>Stan zwracanego towaru</h2>
          <p>
            Zwracany towar powinien być <strong>nienaruszony</strong>, <strong>nieużywany</strong> oraz
            znajdować się w <strong>oryginalnym opakowaniu</strong>. Towar noszący ślady użytkowania może nie
            zostać przyjęty do zwrotu.
          </p>
        </li>

        <li>
          <h2>Koszty zwrotu</h2>
          <p>
            Koszty odesłania towaru ponosi klient. Nie przyjmujemy przesyłek za pobraniem.
          </p>
        </li>

        <li>
          <h2>Procedura zwrotu</h2>
          <p>
            Aby dokonać zwrotu, prosimy o wcześniejszy kontakt mailowy na adres:{" "}
            <strong>kontakt@dajdaj.pl</strong>.<br />
            W wiadomości prosimy o podanie numeru zamówienia lub innego dowodu zakupu.
          </p>
        </li>

        <li>
          <h2>Zwrot pieniędzy</h2>
          <p>
            Zwrot środków nastąpi w ciągu <strong>14 dni</strong> od dnia otrzymania zwracanego towaru
            i zaakceptowania go zgodnie z warunkami zwrotu.
          </p>
        </li>
      </ol>

      <p className="return-policy__legal">
        Podstawa prawna: Ustawa z dnia 30 maja 2014 r. o prawach konsumenta (Dz.U. 2014 poz. 827)
      </p>
    </div>
  );
};

export default ReturnPolicy;
