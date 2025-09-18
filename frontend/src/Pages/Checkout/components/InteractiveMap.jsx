// frontend/src/Pages/Checkout/components/InteractiveMap.jsx
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useDispatch } from "react-redux";
import { setPickupPoint } from "../../../slices/cartSlice";

// фиксим иконку Leaflet (по умолчанию не отображается)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const InteractiveMap = ({ carrier = "all" }) => {
  const dispatch = useDispatch();
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetchPoints = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `/furgonetka/pickup-points?carrier=${carrier}`
        );
        const data = await res.json();
        if (data.success) {
          setPoints(data.points);
        }
      } catch (err) {
        console.error("Ошибка загрузки пунктов:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPoints();
  }, [carrier]);

  const handleSelect = (point) => {
    setSelected(point);
    dispatch(setPickupPoint(point));
  };

  if (loading) return <p>Загрузка пунктов...</p>;

  return (
    <div style={{ height: "500px", width: "100%" }}>
      <MapContainer
        center={[52.2297, 21.0122]} // Варшава по умолчанию
        zoom={12}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {points.map((point) => (
          <Marker
            key={point.id}
            position={[point.latitude, point.longitude]}
            eventHandlers={{
              click: () => handleSelect(point),
            }}
          >
            <Popup>
              <strong>{point.name}</strong> <br />
              {point.address} <br />
              <em>{point.carrier}</em> <br />
              <button
                style={{
                  marginTop: "5px",
                  padding: "4px 8px",
                  cursor: "pointer",
                }}
                onClick={() => handleSelect(point)}
              >
                Выбрать
              </button>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {selected && (
        <div style={{ marginTop: "10px", padding: "10px", border: "1px solid #ccc" }}>
          ✅ Выбран пункт: <b>{selected.name}</b> ({selected.carrier})<br />
          {selected.address}
        </div>
      )}
    </div>
  );
};

export default InteractiveMap;
