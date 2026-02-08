// ZoomControls.jsx
import { useMap } from "react-leaflet";
import { useState } from "react";

export default function ZoomControls() {
  const map = useMap();
  const defaultZoom = 4;
  const [zoomPercent, setZoomPercent] = useState(map.getZoom() * 25);

  map.on("zoomend", () => {
    setZoomPercent(map.getZoom() * 25);
  });

  return (
    <div className="zoom-control-box">
      <div className="zoom-display">{zoomPercent}%</div>

      <button className="zoom-btn" onClick={() => map.zoomOut()}>
        −
      </button>

      <button className="zoom-btn" onClick={() => map.zoomIn()}>
        +
      </button>

      <button
        className="reset-btn"
        onClick={() => map.setView(map.getCenter(), defaultZoom)}
      >
        Reset
      </button>
    </div>
  );
}
