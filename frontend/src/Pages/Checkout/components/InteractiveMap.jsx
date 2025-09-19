// frontend/src/Pages/Checkout/components/InteractiveMap.jsx
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useDispatch } from "react-redux";
import { setPickupPoint } from "../../../slices/cartSlice";

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
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPoints = async () => {
      try {
        setLoading(true);
        setError(null);

        const url = `/furgonetka/pickup-points?carrier=${carrier}`;
        console.log("[DEBUG] Запрос:", url);
        const res = await fetch(url);

        console.log("[DEBUG] Статус ответа:", res.status, res.statusText);
        const text = await res.text();
        console.log("[DEBUG] Сырые данные:", text.slice(0, 200));

        if (!res.ok) {
          throw new Error(`API вернул ${res.status}: ${text}`);
        }

        let data;
        try {
          data = JSON.parse(text);
        } catch (parseErr) {
          throw new Error(`Ответ не JSON: ${parseErr.message}`);
        }

        console.log("[DEBUG] Распарсенный JSON:", data);

        if (data.success) {
          setPoints(data.points);
        } else {
          throw new Error(data.error || "Неизвестная ошибка API");
        }
      } catch (err) {
        console.error("[DEBUG] Ошибка загрузки пунктов:", err);
        setError(err.message);
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
  if (error) return <p style={{ color: "red" }}>Ошибка: {error}</p>;

  return (
    <div style={{ height: "500px", width: "100%" }}>
      <MapContainer
        center={[52.2297, 21.0122]}
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
                style={{ marginTop: "5px", padding: "4px 8px", cursor: "pointer" }}
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
