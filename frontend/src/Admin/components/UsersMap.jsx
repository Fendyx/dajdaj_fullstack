import React, { useState, useRef, useEffect } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import { scaleLinear } from "d3-scale";
import { geoCentroid } from "d3-geo";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const UsersMap = ({ data }) => {
  const [position, setPosition] = useState({ coordinates: [0, 20], zoom: 1 });
  const mapContainerRef = useRef(null); // Ссылка на DOM-элемент контейнера

  // 1. Блокировка масштабирования страницы браузером
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    const preventBrowserZoom = (e) => {
      // Если нажат Ctrl (Windows) или Meta (Mac) во время прокрутки
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault(); // Запрещаем браузеру масштабировать страницу
        // При этом событие все равно попадет в ZoomableGroup, и карта будет работать
      }
    };

    // { passive: false } обязательно, чтобы сработал preventDefault
    container.addEventListener("wheel", preventBrowserZoom, { passive: false });

    return () => {
      container.removeEventListener("wheel", preventBrowserZoom);
    };
  }, []);

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

  // 2. Логика разрешения зума самой карты
  const filterZoomEvent = (evt) => {
    if (evt.type === "wheel") {
      // Разрешаем зум карты ТОЛЬКО если нажат Ctrl
      return evt.ctrlKey || evt.metaKey;
    }
    return true; // Тач-жесты разрешаем всегда
  };

  const sizeScale = scaleLinear()
    .domain([0, Math.max(...(data?.map((d) => d.count) || [1]))])
    .range([4, 15]);

  return (
    <div
      className="chart-section"
      style={{
        position: "relative",
        height: "500px",
        padding: 0,
        overflow: "hidden",
      }}
    >
      <div style={{ padding: "24px 24px 0 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3>🌍 Users Map (Live)</h3>
        <span style={{ fontSize: "0.8rem", color: "#666" }}>
          Use <b>Ctrl + Scroll</b> to zoom
        </span>
      </div>

      <div className="map-controls">
        <button onClick={handleZoomIn} className="map-btn" title="Zoom In">+</button>
        <button onClick={handleZoomOut} className="map-btn" title="Zoom Out">−</button>
      </div>

      {/* Привязываем ref к этому диву. 
         touchAction: "none" помогает на мобильных устройствах предотвратить 
         скролл всей страницы, когда юзер водит пальцем по карте.
      */}
      <div 
        ref={mapContainerRef} 
        style={{ width: "100%", height: "calc(100% - 60px)", touchAction: "none" }}
      >
        <ComposableMap
          projectionConfig={{ scale: 170 }}
          width={800}
          height={400}
          style={{ width: "100%", height: "100%" }}
        >
          <ZoomableGroup
            zoom={position.zoom}
            center={position.coordinates}
            onMoveEnd={handleMoveEnd}
            translateExtent={[
              [0, 0],
              [800, 600],
            ]}
            filterZoomEvent={filterZoomEvent}
          >
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const centroid = geoCentroid(geo);
                  // Скрываем названия для очень маленьких объектов (опционально)
                  // const isTiny = geo.properties.NAME && geo.properties.NAME.length > 15;

                  return (
                    <React.Fragment key={geo.rsmKey}>
                      <Geography
                        geography={geo}
                        style={{
                          default: {
                            fill: "#e5e7eb",
                            outline: "none",
                            stroke: "#fff",
                            strokeWidth: 0.5,
                          },
                          hover: { fill: "#d1d5db", outline: "none" },
                          pressed: { fill: "#9ca3af", outline: "none" },
                        }}
                      />
                       {geo.properties.name && (
                        <Marker coordinates={centroid}>
                          <text
                            y="2"
                            fontSize={10 / position.zoom} 
                            textAnchor="middle"
                            style={{
                              fontFamily: "system-ui",
                              fill: "#555",
                              pointerEvents: "none", 
                              opacity: position.zoom > 1.5 ? 0.8 : 0, 
                              transition: "opacity 0.3s ease"
                            }}
                          >
                            {geo.properties.name}
                          </text>
                        </Marker>
                      )}
                    </React.Fragment>
                  );
                })
              }
            </Geographies>

            {data &&
              data.map(({ city, lat, lng, count }, index) => (
                <Marker key={index} coordinates={[lng, lat]}>
                  <circle
                    r={sizeScale(count) / position.zoom}
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