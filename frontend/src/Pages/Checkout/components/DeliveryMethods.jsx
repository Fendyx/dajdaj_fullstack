import React from 'react';
import { InPostMap } from './InPostMap';
import { OrlenMap } from './OrlenMap';

export function DeliveryMethods({ data, onChange }) {
  const setMethod = (method) => onChange(method, data.details);
  const setDetails = (details) => onChange(data.method, details);

  return (
    <div className="form-section">
      <h2>Metoda dostawy</h2>
      <div className="delivery-cards">
        <div
          className={`delivery-card ${data.method === 'inpost' ? 'selected' : ''}`}
          onClick={() => setMethod('inpost')}
        >
          <div className="card-title">Paczkomaty InPost</div>
          <div className="card-desc">Szybkie paczkomaty w całym mieście.</div>
        </div>

        <div
          className={`delivery-card ${data.method === 'orlen' ? 'selected' : ''}`}
          onClick={() => setMethod('orlen')}
        >
          <div className="card-title">ORLEN Paczkomaty</div>
          <div className="card-desc">Odbiór w stacjach ORLEN.</div>
        </div>

        <div
          className={`delivery-card ${data.method === 'poczta' ? 'selected' : ''}`}
          onClick={() => setMethod('poczta')}
        >
          <div className="card-title">Poczta Polska</div>
          <div className="card-desc">Dostawa do najbliższej placówki Poczty Polskiej.</div>
        </div>
      </div>

      {data.method === "inpost" && (
        <InPostMap onSelect={(point) => setDetails(point)} />
      )}

      {data.method === "orlen" && (
        <OrlenMap onSelect={(point) => setDetails(point)} />
      )}

      {data.method === 'poczta' && (
        <div className="poczta-form">
          <div className="form-group">
            <label className="label">Kod pocztowy</label>
            <input
              type="text"
              className="input"
              value={data.details.zipCode || ''}
              onChange={(e) => setDetails({ ...data.details, zipCode: e.target.value })}
              placeholder="00-000"
            />
          </div>
          <div className="form-group">
            <label className="label">Adres</label>
            <input
              type="text"
              className="input"
              value={data.details.address || ''}
              onChange={(e) => setDetails({ ...data.details, address: e.target.value })}
              placeholder="Ulica, numer domu/mieszkania"
            />
          </div>
        </div>
      )}
    </div>
  );
}
