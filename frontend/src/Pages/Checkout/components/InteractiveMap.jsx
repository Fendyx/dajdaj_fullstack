import React, { useState } from 'react';

export function InteractiveMap({ locations, selectedLocation, onLocationSelect, mapTitle }) {
  const [hoveredLocation, setHoveredLocation] = useState(null);

  // Простая SVG иконка пина
  const PinIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" width="24" height="24">
      <path
        fill="currentColor"
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM12 11.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"
      />
    </svg>
  );

  return (
    <div className="map-container">
      <div className="map-header">
        <h4>{mapTitle}</h4>
        <button className="btn-outline">
          {/* Простая иконка навигации */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L15 11H9L12 2ZM12 13L5 21H19L12 13Z" />
          </svg>
          <span style={{ marginLeft: '6px' }}>Znajdź najbliższy</span>
        </button>
      </div>

      <div className="map-area">
        <div className="map-background">
          <svg className="map-grid">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {locations.map((location) => (
          <button
            key={location.id}
            className={`location-pin ${
              selectedLocation === location.id
                ? 'selected'
                : hoveredLocation === location.id
                ? 'hovered'
                : 'default'
            }`}
            style={{
              left: `${location.x}%`,
              top: `${location.y}%`
            }}
            onClick={() => onLocationSelect(location.id)}
            onMouseEnter={() => setHoveredLocation(location.id)}
            onMouseLeave={() => setHoveredLocation(null)}
          >
            <PinIcon className="location-pin-icon" />
          </button>
        ))}

        {selectedLocation && (
          <div className="location-popup">
            {(() => {
              const selected = locations.find(loc => loc.id === selectedLocation);
              return selected ? (
                <div>
                  <h5>{selected.name}</h5>
                  <p className="address">{selected.address}</p>
                  <p className="distance">{selected.distance} od Ciebie</p>
                </div>
              ) : null;
            })()}
          </div>
        )}
      </div>

      <div className="location-list">
        {locations.map((location) => (
          <button
            key={location.id}
            className={`location-item ${
              selectedLocation === location.id ? 'selected' : ''
            }`}
            onClick={() => onLocationSelect(location.id)}
          >
            <div className="location-item-content">
              <div>
                <h5>{location.name}</h5>
                <p className="address">{location.address}</p>
              </div>
              <span className="distance">{location.distance}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
