import L from "/leaflet/dist/leaflet.js";
import "/leaflet/dist/leaflet.css";

export function initMapa(id, lat, lon) {
  const map = L.map(id).setView([lat, lon], 15);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);
  L.marker([lat, lon]).addTo(map);
}
