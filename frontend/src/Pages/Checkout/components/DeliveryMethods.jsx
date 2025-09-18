// frontend/src/Pages/Checkout/components/DeliveryMethods.jsx
import React, { useState } from "react";
import InteractiveMap from "./InteractiveMap";

export default function DeliveryMethods() {
  const [carrier, setCarrier] = useState("inpost");

  return (
    <div>
      <h3>Способ доставки</h3>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button
          onClick={() => setCarrier("inpost")}
          disabled={carrier === "inpost"}
        >
          InPost
        </button>
        <button
          onClick={() => setCarrier("orlen")}
          disabled={carrier === "orlen"}
        >
          ORLEN Paczka
        </button>
        <button
          onClick={() => setCarrier("dpd")}
          disabled={carrier === "dpd"}
        >
          DPD
        </button>
        <button onClick={() => setCarrier("all")} disabled={carrier === "all"}>
          Показать все
        </button>
      </div>

      {/* Карта теперь сама загружает точки и пишет в Redux */}
      <InteractiveMap carrier={carrier} />
    </div>
  );
}
