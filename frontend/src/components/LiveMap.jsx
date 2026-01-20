import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "../styles/LiveMap.css";

export default function LiveMap() {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);

  //  Vessels fetched from backend
  const [vessels, setVessels] = useState([]);

  //  Fetch vessels data from backend
  useEffect(() => {
    fetch("http://localhost:8001/api/vessels/") 
      .then((res) => res.json())
      .then((data) => setVessels(data))
      .catch(() => console.log("Error fetching vessel data"));
  }, []);

  //  Initialize the map
  useEffect(() => {
    if (mapRef.current) return;

    mapRef.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
      center: [10, 20],
      zoom: 1.6,
      attributionControl: false,
      interactive: true,
    });

    //  Hide MapLibre logo
    mapRef.current.once("render", () => {
      const hidelogo = setInterval(() => {
        const logo = document.querySelector(".maplibregl-ctrl-logo");
        if (logo) {
          logo.remove();
          clearInterval(hidelogo);
        }
      }, 300);
    });

    // Clean layers & labels
    mapRef.current.on("load", () => {
      const map = mapRef.current;

      const layersToRemove = [
        "poi",
        "poi-label",
        "airport-label",
        "road-label",
        "waterway-label",
        "building-label",
      ];

      layersToRemove.forEach((layer) => {
        if (map.getLayer(layer)) map.removeLayer(layer);
      });

      if (map.getSource("poi")) map.removeSource("poi");
    });

    return () => mapRef.current?.remove();
  }, []);

  //  Add vessel markers on map
  useEffect(() => {
    if (!mapRef.current || vessels.length === 0) return;

    vessels.forEach((ship) => {
      const el = document.createElement("div");
      el.className = "ship-marker";

      new maplibregl.Marker(el)
        .setLngLat([ship.lng, ship.lat])
        .setPopup(
          new maplibregl.Popup({ offset: 20 }).setHTML(`
            <strong>${ship.name}</strong><br>
            Status: ${ship.status}<br>
            Lat: ${ship.lat}<br>
            Lng: ${ship.lng}
          `)
        )
        .addTo(mapRef.current);
    });
  }, [vessels]);

  return <div ref={mapContainer} className="map-container" />;
}
