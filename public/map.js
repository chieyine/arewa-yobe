// No tiles load until the user explicitly opens the map. No reports are sent to the tile provider.
export function showMap(container, coordinates) {
  const z = 11,
    n = 2 ** z,
    lat = Number(coordinates.latitude),
    lon = Number(coordinates.longitude);
  const x = ((lon + 180) / 360) * n,
    y = ((1 - Math.asinh(Math.tan((lat * Math.PI) / 180)) / Math.PI) / 2) * n;
  const left = Math.floor(x),
    top = Math.floor(y);
  container.className = "location-map";
  container.setAttribute("role", "img");
  container.setAttribute(
    "aria-label",
    `Observed location at latitude ${lat}, longitude ${lon}.`,
  );
  const grid = document.createElement("div");
  grid.className = "map-tiles";
  grid.style.left = `${150 - (x - left) * 256}px`;
  grid.style.top = `${150 - (y - top) * 256}px`;
  for (let dx = -1; dx <= 1; dx++)
    for (let dy = -1; dy <= 1; dy++) {
      const image = new Image();
      image.alt = "";
      image.src = `https://tile.openstreetmap.org/${z}/${left + dx}/${top + dy}.png`;
      image.style.left = dx * 256 + "px";
      image.style.top = dy * 256 + "px";
      image.onerror = () => {
        container.setAttribute(
          "aria-label",
          "Map tiles unavailable. The recorded coordinates remain available above.",
        );
      };
      grid.append(image);
    }
  container.append(grid);
  const marker = document.createElement("span");
  marker.className = "map-pin";
  marker.textContent = "●";
  container.append(marker);
  const attribution = document.createElement("a");
  attribution.href = "https://www.openstreetmap.org/copyright";
  attribution.target = "_blank";
  attribution.rel = "noopener";
  attribution.textContent = "© OpenStreetMap contributors";
  attribution.className = "map-attribution";
  container.append(attribution);
}
