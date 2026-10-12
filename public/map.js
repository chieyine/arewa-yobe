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

// Overview map of every tracked item that has recorded coordinates.
// Pins are drawn locally as SVG, so the overview works with no tiles and on weak connections.
// Street-map tiles are fetched only if the user asks for them.
const Z = 8,
  WORLD = 256 * 2 ** Z;
const project = (lat, lon) => ({
  x: ((lon + 180) / 360) * WORLD,
  y: ((1 - Math.asinh(Math.tan((lat * Math.PI) / 180)) / Math.PI) / 2) * WORLD,
});
const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );
export function showOverviewMap(container, items, describe = () => "") {
  const pts = items
    .map((i) => ({
      i,
      lat: Number(i.coordinates?.latitude),
      lon: Number(i.coordinates?.longitude),
    }))
    .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lon));
  container.className = "overview-map";
  if (!pts.length) {
    container.innerHTML =
      '<p class="subtle small">No item in this view has recorded coordinates yet.</p>';
    return;
  }
  // Yobe State frame, widened only if a recorded point falls outside it.
  let s = Math.min(10.0, ...pts.map((p) => p.lat)) - 0.05,
    n = Math.max(13.4, ...pts.map((p) => p.lat)) + 0.05,
    w = Math.min(9.9, ...pts.map((p) => p.lon)) - 0.05,
    e = Math.max(12.2, ...pts.map((p) => p.lon)) + 0.05;
  const nw = project(n, w),
    se = project(s, e),
    width = se.x - nw.x,
    height = se.y - nw.y;
  const pins = pts
    .map((p) => {
      const q = project(p.lat, p.lon),
        issue = p.i.type !== "PUBLIC_PROJECT";
      return `<a href="#/monitoring/items/${esc(p.i.id)}" class="ov-pin ${issue ? "issue" : "project"}" aria-label="${esc(p.i.reference)} ${esc(p.i.title)}. ${esc(describe(p.i))}"><title>${esc(p.i.reference)} · ${esc(p.i.title)}</title><circle cx="${(q.x - nw.x).toFixed(1)}" cy="${(q.y - nw.y).toFixed(1)}" r="7"/></a>`;
    })
    .join("");
  container.innerHTML = `<svg viewBox="0 0 ${width.toFixed(0)} ${height.toFixed(0)}" role="group" aria-label="Map of ${pts.length} tracked items with recorded coordinates. Each pin opens the item."><rect width="100%" height="100%" class="ov-bg"/><g class="ov-tiles"></g>${pins}</svg><div class="ov-legend small"><span><i class="dot project"></i>Public project</span><span><i class="dot issue"></i>Service issue</span><button type="button" class="btn ov-tiles-btn">Show street map</button><a class="ov-attr" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener" hidden>© OpenStreetMap contributors</a></div>`;
  container.querySelector(".ov-tiles-btn").onclick = (ev) => {
    const g = container.querySelector(".ov-tiles");
    const tx0 = Math.floor(nw.x / 256),
      tx1 = Math.floor(se.x / 256),
      ty0 = Math.floor(nw.y / 256),
      ty1 = Math.floor(se.y / 256);
    for (let tx = tx0; tx <= tx1; tx++)
      for (let ty = ty0; ty <= ty1; ty++) {
        const img = document.createElementNS("http://www.w3.org/2000/svg", "image");
        img.setAttribute("href", `https://tile.openstreetmap.org/${Z}/${tx}/${ty}.png`);
        img.setAttribute("x", tx * 256 - nw.x);
        img.setAttribute("y", ty * 256 - nw.y);
        img.setAttribute("width", 256);
        img.setAttribute("height", 256);
        img.addEventListener("error", () => img.remove());
        g.append(img);
      }
    container.querySelector(".ov-attr").hidden = false;
    ev.target.remove();
  };
}
