import React, { useState } from "react";
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from "react-simple-maps";
import { scaleLinear } from "d3-scale";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const UsersMap = ({ data }) => {
  // Состояние для зума и позиции
  const [position, setPosition] = useState({ coordinates: [0, 20], zoom: 1 });

  // Функции управления зумом
  const handleZoomIn = () => {
    if (position.zoom >= 4) return;
    setPosition((pos) => ({ ...pos, zoom: pos.zoom * 1.5 }));
  };

  const handleZoomOut = () => {
    if (position.zoom <= 1) return;
    setPosition((pos) => ({ ...pos, zoom: pos.zoom / 1.5 }));
  };

  const handleMoveEnd = (position) => {
    setPosition(position);
  };

  // Скейл точек
  const sizeScale = scaleLinear()
    .domain([0, Math.max(...(data?.map((d) => d.count) || [1]))])
    .range([4, 15]);

  return (
    <div className="chart-section" style={{ position: "relative", height: "500px", padding: 0, overflow: "hidden" }}>
      <div style={{ padding: "24px 24px 0 24px" }}>
        <h3>🌍 Users Map (Live)</h3>
      </div>
      
      {/* Кнопки управления зумом */}
      <div className="map-controls">
        <button onClick={handleZoomIn} className="map-btn" title="Zoom In">+</button>
        <button onClick={handleZoomOut} className="map-btn" title="Zoom Out">−</button>
      </div>

      <div style={{ width: "100%", height: "calc(100% - 60px)" }}>
        <ComposableMap
          projectionConfig={{ scale: 170 }}
          width={800}
          height={400}
          style={{ width: "100%", height: "100%" }}
        >
          {/* ZoomableGroup добавляет возможность перетаскивать и приближать */}
          <ZoomableGroup
            zoom={position.zoom}
            center={position.coordinates}
            onMoveEnd={handleMoveEnd}
            translateExtent={[
              [0, 0], // top left
              [800, 600], // bottom right (ограничиваем область перетаскивания)
            ]}
          >
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    style={{
                      default: { fill: "#e5e7eb", outline: "none", stroke: "#fff", strokeWidth: 0.5 },
                      hover: { fill: "#d1d5db", outline: "none" },
                      pressed: { fill: "#9ca3af", outline: "none" },
                    }}
                  />
                ))
              }
            </Geographies>

            {data && data.map(({ city, lat, lng, count }, index) => (
              <Marker key={index} coordinates={[lng, lat]}>
                <circle 
                  r={sizeScale(count) / position.zoom} // Уменьшаем точки при зуме, чтобы не были огромными
                  fill="rgba(34, 197, 94, 0.8)" 
                  stroke="#15803d" 
                  strokeWidth={1} 
                />
                <title>{`${city}: ${count} users`}</title>
              </Marker>
            ))}
          </ZoomableGroup>
        </ComposableMap>
      </div>
    </div>
  );
};

export default UsersMap;