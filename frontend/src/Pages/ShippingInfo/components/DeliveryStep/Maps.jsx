import React, { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import PlaceHolder from "./icons/placeholder.png";
import "leaflet/dist/leaflet.css";

const icon = L.icon({
  iconUrl: PlaceHolder,
  iconSize: [38, 38],
});

const markers = [
  { geocode: [52.2297, 21.0122], popUp: "Warsaw" },
  { geocode: [50.0647, 19.945], popUp: "Kraków" },
  { geocode: [51.1079, 17.0385], popUp: "Wrocław" },
];

function ResetCenterView({ selectPosition }) {
  const map = useMap();

  useEffect(() => {
    if (selectPosition && selectPosition.lat && selectPosition.lon) {
      map.flyTo(
        [parseFloat(selectPosition.lat), parseFloat(selectPosition.lon)],
        18,
        { duration: 1.5 }
      );
    }
  }, [selectPosition]);

  return null;
}

export default function Maps({ selectPosition }) {
  // Проверяем, что selectPosition существует и имеет координаты
  if (!selectPosition || !selectPosition.lat || !selectPosition.lon) {
    return (
      <div style={{ width: "100%", height: "90%", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #ccc" }}>
        Wybierz adres, aby zobaczyć mapę
      </div>
    );
  }

  const locationSelection = [parseFloat(selectPosition.lat), parseFloat(selectPosition.lon)];

  return (
    <MapContainer 
      center={locationSelection} 
      zoom={18} 
      style={{ width: "100%", height: "90%", borderRadius: "10px" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MarkerClusterGroup chunkedLoading>
        {markers.map((marker, index) => (
          <Marker key={index} position={marker.geocode} icon={icon}>
            <Popup>{marker.popUp}</Popup>
          </Marker>
        ))}
        <Marker position={locationSelection} icon={icon}>
          <Popup>{selectPosition.address || "Wybrana lokalizacja"}</Popup>
        </Marker>
      </MarkerClusterGroup>

      <ResetCenterView selectPosition={selectPosition} />
    </MapContainer>
  );
}