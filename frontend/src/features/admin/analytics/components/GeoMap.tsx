import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import type { GeoLocation } from "../AnalyticsPage";
import "leaflet/dist/leaflet.css";
import "./GeoMap.css";

interface Props {
  locations: GeoLocation[];
}

const MAX_RADIUS = 28;
const MIN_RADIUS = 8;

function scaleRadius(count: number, max: number) {
  if (max === 0) return MIN_RADIUS;
  return MIN_RADIUS + ((count / max) * (MAX_RADIUS - MIN_RADIUS));
}

export function GeoMap({ locations }: Props) {
  useEffect(() => {
    // No-op — CircleMarker doesn't need icon fix
  }, []);

  const validLocations = locations.filter((l) => l.lat !== 0 && l.lng !== 0);
  const maxCount = Math.max(...validLocations.map((l) => l.count), 1);

  return (
    <div className="geo-map-card">
      <h2 className="geo-map-card__title">Location Map</h2>
      <div className="geo-map-wrap">
        <MapContainer
          center={[50, 15]}
          zoom={4}
          className="geo-map"
          zoomControl={true}
          scrollWheelZoom={false}
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />

          {validLocations.map((loc) => (
            <CircleMarker
              key={`${loc.city}-${loc.country}`}
              center={[loc.lat, loc.lng]}
              radius={scaleRadius(loc.count, maxCount)}
              pathOptions={{
                color: "#6366f1",
                fillColor: "#6366f1",
                fillOpacity: 0.65,
                weight: 1.5,
              }}
            >
              <Tooltip direction="top" offset={[0, -6]} opacity={0.95}>
                <div className="geo-map-tooltip">
                  <strong>{loc.city}</strong>, {loc.country}
                  <br />
                  <span>{loc.count} online</span>
                </div>
              </Tooltip>
            </CircleMarker>
          ))}
        </MapContainer>

        {validLocations.length === 0 && (
          <div className="geo-map-empty">No location data available</div>
        )}
      </div>
    </div>
  );
}