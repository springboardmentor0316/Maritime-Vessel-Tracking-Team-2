import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "../styles/LiveMap.css";

export default function LiveMapVoyage({ departure, currentPos, destination }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current) return;

    mapRef.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
      center: [0, 20],
      zoom: 1.5,
      attributionControl: false,
    });

    mapRef.current.on("load", () => {
      const map = mapRef.current;

      // Remove MapLibre logo
      const logo = document.querySelector(".maplibregl-ctrl-logo");
      if (logo) logo.style.display = "none";

      /* ============================
          🟢 1. Departure Marker
      ============================= */
      new maplibregl.Marker({
        color: "#22c55e",     // Green
        scale: 1.2,
      })
        .setLngLat(departure.coords)
        .setPopup(new maplibregl.Popup().setHTML(`<b>${departure.label}</b>`))
        .addTo(map);

      /* ============================
          🔵 2. Current Position (BLUE MARKER)
      ============================= */
      new maplibregl.Marker({
        color: "#3b82f6",     // Blue
        scale: 1.3,
      })
        .setLngLat(currentPos.coords)
        .setPopup(new maplibregl.Popup().setHTML(`<b>${currentPos.label}</b>`))
        .addTo(map);

      /* ============================
          🔴 3. Destination Marker
      ============================= */
      new maplibregl.Marker({
        color: "#ef4444",     // Red
        scale: 1.2,
      })
        .setLngLat(destination.coords)
        .setPopup(new maplibregl.Popup().setHTML(`<b>${destination.label}</b>`))
        .addTo(map);

      /* ============================
          🔵 Route Line
      ============================= */
      const route = {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: [
            departure.coords,
            currentPos.coords,
            destination.coords,
          ],
        },
      };

      map.addSource("routeLine", {
        type: "geojson",
        data: route,
      });

      map.addLayer({
        id: "route-line-layer",
        type: "line",
        source: "routeLine",
        paint: {
          "line-color": "#38bdf8",
          "line-width": 3,
          "line-opacity": 0.8,
        },
      });
    });

    return () => {
      if (mapRef.current) mapRef.current.remove();
    };
  }, []);

  return <div ref={mapContainer} className="map-container" />;
}
