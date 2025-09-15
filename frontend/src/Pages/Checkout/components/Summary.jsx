import React from 'react';

export function Summary({ data }) {
  const { defaultDelivery, deliveryMethod, deliveryDetails } = data;

  return (
    <div className="form-section">
      <h2>Podsumowanie zamówienia</h2>

      <h3>Dane odbiorcy</h3>
      <p><strong>Imię i nazwisko:</strong> {defaultDelivery.name} {defaultDelivery.surname}</p>
      <p><strong>E-mail:</strong> {defaultDelivery.email}</p>
      <p><strong>Telefon:</strong> {defaultDelivery.phone}</p>

      <h3>Metoda dostawy</h3>
      <p><strong>Wybrana metoda:</strong> {deliveryMethod || 'Nie wybrano'}</p>

      {deliveryMethod === 'inpost' && deliveryDetails?.name && (
        <div>
          <p><strong>Punkt odbioru:</strong> {deliveryDetails.name}</p>
          <p><strong>Adres:</strong> {deliveryDetails.address}</p>
          {deliveryDetails.distance && <p><strong>Odległość:</strong> {deliveryDetails.distance}</p>}
        </div>
      )}

      {deliveryMethod === 'orlen' && deliveryDetails?.name && (
        <div>
          <p><strong>Punkt odbioru:</strong> {deliveryDetails.name}</p>
          <p><strong>Adres:</strong> {deliveryDetails.address}</p>
        </div>
      )}

      {deliveryMethod === 'poczta' && (
        <div>
          <p><strong>Kod pocztowy:</strong> {deliveryDetails.zipCode}</p>
          <p><strong>Adres:</strong> {deliveryDetails.address}</p>
        </div>
      )}
    </div>
  );
}
