import React from "react";
import "./PaymentMethods.css";

const PaymentMethods = () => {
  return (
    <div className="payment-methods">
      <h1 className="payment-methods__title">Metody płatności</h1>

      <ol className="payment-methods__list">
        <li>
          <h2>Karta płatnicza</h2>
          <p>
            Akceptujemy wszystkie główne karty: <strong>Visa</strong>, <strong>MasterCard</strong>, <strong>American Express</strong> i inne.
            Płatność kartą jest szybka, bezpieczna i wygodna.
          </p>
        </li>

        <li>
          <h2>Apple Pay</h2>
          <p>
            Dostępne na urządzeniach Apple. Płacenie za pomocą Apple Pay to szybki i bezpieczny sposób bez potrzeby wpisywania danych karty.
          </p>
        </li>

        <li>
          <h2>Google Pay</h2>
          <p>
            Umożliwia błyskawiczne płatności na urządzeniach z systemem Android. Idealne dla użytkowników korzystających z Google Wallet.
          </p>
        </li>

        <li>
          <h2>Link by Stripe</h2>
          <p>
            Zapisuje Twoje dane płatności i pozwala płacić jednym kliknięciem przy kolejnych zakupach.
          </p>
        </li>

        <li>
          <h2>BLIK</h2>
          <p>
            Polski system płatności mobilnych. Wystarczy wpisać kod BLIK z aplikacji bankowej, aby zapłacić szybko i bezpiecznie.
          </p>
        </li>

        <li>
          <h2>Przelewy24 (P24)</h2>
          <p>
            Popularny system płatności online w Polsce, pozwalający na szybkie przelewy z większości polskich banków.
          </p>
        </li>
      </ol>

      <p className="payment-methods__footer">
        Wszystkie płatności są szyfrowane i przetwarzane zgodnie z najwyższymi standardami bezpieczeństwa Stripe.
      </p>
    </div>
  );
};

export default PaymentMethods;
