import { useEffect, useRef } from "react";

export function OrlenMap({ onSelect }) {
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    const initMap = () => {
      if (window.orlenWidget) {
        window.orlenWidget.init({
          elementId: "orlen-map",
          lang: "pl",
          callback: (point) => onSelectRef.current?.(point),
        });
      }
    };

    if (document.getElementById("orlen-script")) {
      initMap();
      return;
    }

    const script = document.createElement("script");
    script.id = "orlen-script";
    script.src = "https://widget.orlenpaczka.pl/v1/widget.js";
    script.async = true;

    script.onload = () => {
      if (!window.orlenWidget) {
        console.error("Orlen widget nie załadował się");
        return;
      }
      initMap();
    };

    document.body.appendChild(script);
  }, []);

  return <div id="orlen-map" style={{ height: "500px", width: "100%" }} />;
}
