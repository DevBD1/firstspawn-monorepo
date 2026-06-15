// Pure projection helpers for placing server beacons over a cobe globe.
//
// cobe renders the Earth into a canvas and exposes the current rotation through
// its `onRender(state)` callback (state.phi / state.theta). We reuse the *same*
// phi/theta here to project each server's lat/lng onto the canvas, so the overlay
// of interactive beacons rotates in lock-step with the rendered globe.

const DEG2RAD = Math.PI / 180;

// cobe's dotted Earth texture is offset by a quarter turn relative to a naive
// "lng 0 faces the viewer" sphere: in cobe a marker at (lat, lng) projects with
// x ∝ cos(lng + phi) (see its marker mapping `a = lng*π/180 - π`), so longitude 0
// sits on the right-hand limb at phi = 0. We add π/2 to longitude here so this
// overlay lands on the exact same dots cobe renders. Without it every beacon is
// placed a quarter-turn off (e.g. US servers drift into the Pacific).
const COBE_LNG_OFFSET = Math.PI / 2;

export interface GlobeOrientation {
  /** Horizontal rotation in radians — the same value handed to cobe's state.phi. */
  phi: number;
  /** Vertical tilt in radians — the same value handed to cobe's state.theta. */
  theta: number;
}

export interface ProjectedMarker {
  /** Horizontal position on the unit sphere, in [-1, 1] (×radius for screen px). */
  x: number;
  /** Vertical position on the unit sphere, in [-1, 1] (negate for screen px). */
  y: number;
  /** Signed depth toward the viewer in [-1, 1]; 1 = nearest, <= 0 = back face. */
  depth: number;
  /** True when the point is on the visible (front) hemisphere. */
  visible: boolean;
}

/**
 * Project a geographic coordinate onto the unit sphere for the given globe
 * orientation. Longitude 0 / latitude 0 faces the viewer at phi = 0, with the
 * north pole up. The result is resolution-independent: multiply x by the globe
 * radius and offset from the canvas centre to get screen pixels (and negate y,
 * since screen-space y grows downward).
 */
export function projectMarker(
  lat: number,
  lng: number,
  { phi, theta }: GlobeOrientation
): ProjectedMarker {
  const latRad = lat * DEG2RAD;
  const lngRad = lng * DEG2RAD + COBE_LNG_OFFSET;
  const cosLat = Math.cos(latRad);

  // Spin around the vertical axis by phi.
  const x = cosLat * Math.sin(lngRad + phi);
  const y0 = Math.sin(latRad);
  const z0 = cosLat * Math.cos(lngRad + phi);

  // Tilt around the horizontal axis by theta.
  const cosT = Math.cos(theta);
  const sinT = Math.sin(theta);
  const y = y0 * cosT - z0 * sinT;
  const depth = y0 * sinT + z0 * cosT;

  return { x, y, depth, visible: depth > 0 };
}

/**
 * Opacity for a projected beacon based on its depth, so beacons near the limb
 * fade out instead of popping. Front-and-centre points are fully opaque; points
 * at the edge fade toward 0.
 */
export function depthOpacity(depth: number): number {
  if (depth <= 0) return 0;
  // Linear fade from 0 at the limb so beacons ease in instead of popping to a
  // partial opacity as they rotate onto the visible hemisphere.
  return Math.min(1, depth * 3);
}

/**
 * Screen-space scale for a beacon based on depth, giving a subtle sense of the
 * sphere's curvature (nearer beacons read slightly larger).
 */
export function depthScale(depth: number): number {
  return 0.7 + 0.3 * Math.max(0, depth);
}
