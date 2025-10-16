import React, { useState, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import PlaceHolder from "../icons/placeholder.png";
import "./AddressSearch.css";

const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org/search?";

export function AddressSearch({ selectedAddress, onAddressSelect }) {
  const [searchText, setSearchText] = useState("");
  const [listPlace, setListPlace] = useState([]);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!searchText) {
      setListPlace([]);
      return;
    }
    const timeout = setTimeout(() => {
      const params = {
        q: searchText,
        format: "json",
        addressdetails: 1,
        polygon_geojson: 0,
        countrycodes: "PL",
        "accept-language": "pl",
      };
      const queryString = new URLSearchParams(params).toString();
      fetch(`${NOMINATIM_BASE_URL}${queryString}`)
        .then((res) => res.json())
        .then((data) => setListPlace(data))
        .catch((err) => console.error(err));
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchText]);

  const handleAddressSelect = (item) => {
    // Передаем объект с адресной строкой И координатами
    onAddressSelect({
      address: item.display_name, // строка адреса для поля address
      lat: item.lat, // широта для карты
      lon: item.lon, // долгота для карты
      place_id: item.place_id // ID места
    });
    setSearchText(item.display_name);
    setIsFocused(false);
  };

  return (
    <div className="address-search-container">
      <div className="address-search-card">
        <span className="address-search-label">Delivery address</span>
        <div className="address-input-wrapper">
          <div className="address-input-container">
            <FiSearch className="search-icon" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              placeholder="Szukaj adresu w Polsce..."
              className="address-input"
            />
          </div>
          
          {listPlace.length > 0 && isFocused && (
            <div className="address-dropdown">
              {listPlace.map((item) => (
                <div
                  key={item.place_id}
                  onClick={() => handleAddressSelect(item)}
                  className="address-item"
                >
                  <img src={PlaceHolder} alt="Marker" className="address-icon"/>
                  <div className="address-text">
                    {item.display_name}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}