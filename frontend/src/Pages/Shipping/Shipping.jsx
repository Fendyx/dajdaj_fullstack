import React from "react";
import "./Shipping.css";

const Shipping = () => {
  return (
    <div className="shipping">
      <h1 className="shipping__title">Dostawa</h1>

      <ol className="shipping__list">
        <li>
          <h2>Paczkomaty InPost</h2>
          <p>
            Wygodna i szybka dostawa do paczkomatu InPost – dostępne 24/7 w całej Polsce. Po
            nadaniu paczki otrzymasz kod odbioru SMS-em lub e-mailem.
          </p>
        </li>

        <li>
          <h2>Dostawa kurierem (DPD, DHL, FedEx)</h2>
          <p>
            Przesyłka zostanie dostarczona bezpośrednio pod wskazany adres w ciągu 5–7 dni
            roboczych. W dniu doręczenia otrzymasz powiadomienie.
          </p>
        </li>

        <li>
          <h2>Odbiór w punkcie (Żabka, Orlen, RUCH)</h2>
          <p>
            Możliwość odebrania przesyłki w jednym z tysięcy punktów partnerskich, takich jak:
            Żabka, stacje Orlen, kioski RUCH i inne sklepy. Przesyłki dostępne przez kilka dni,
            a punkty często czynne do późnych godzin wieczornych.
          </p>
        </li>

        <li>
          <h2>Poczta Polska</h2>
          <p>
            Tradycyjna dostawa przez Pocztę Polską – do domu lub odbiór w placówce. Standardowy
            czas dostawy: 5–7 dni roboczych.
          </p>
        </li>

        <li>
          <h2>Koszt dostawy</h2>
          <p>
            Koszt każdej formy dostawy wynosi <strong>15,00 zł</strong>. Przy zamówieniach powyżej
            określonej kwoty może zostać naliczona <strong>darmowa dostawa</strong> – sprawdź szczegóły przy
            finalizacji zamówienia.
          </p>
        </li>
      </ol>

      <p className="shipping__info">
        Jeśli masz pytania dotyczące dostawy, skontaktuj się z nami:{" "}
        <strong>info@dajdaj.pl</strong>
      </p>
    </div>
  );
};

export default Shipping;
