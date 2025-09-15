import { useEffect, useRef } from "react";

export function InPostMap({ onSelect }) {
  // Keep a stable reference to the onSelect callback
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    const initMap = () => {
      if (window.easyPack) {
        window.easyPack.mapWidget("easypack-map", (point) => {
          onSelectRef.current?.(point);
        });
      }
    };

    // If script already exists, just init the map
    if (document.getElementById("inpost-script")) {
      initMap();
      return;
    }

    // Create and load the script
    const script = document.createElement("script");
    script.id = "inpost-script";
    script.src = "https://geowidget.easypack24.net/js/sdk-for-javascript.js";
    script.async = true;

    script.onload = () => {
      if (!window.easyPack) {
        console.error("easyPack widget nie załadował się");
        return;
      }
      window.easyPack.init({
        defaultLocale: "pl",
        mapType: "osm",
        searchType: "parcel_locker_only",
      });
      initMap();
    };

    document.body.appendChild(script);
  }, []); // Empty array = run only once on mount

  return <div id="easypack-map" style={{ height: "500px", width: "100%" }} />;
}
