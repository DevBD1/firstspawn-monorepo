import { describe, it, expect } from "vitest";

import { projectMarker, depthOpacity, depthScale } from "./projection";

describe("projectMarker", () => {
  // cobe's texture is rotated a quarter turn: at phi = 0 the meridian facing the
  // viewer is lng -90, and lng 0 sits on the right-hand limb. projectMarker bakes
  // in that +90° offset so the overlay matches the rendered dots.
  it("places lng -90 / lat 0 facing the viewer at the centre (cobe origin)", () => {
    const p = projectMarker(0, -90, { phi: 0, theta: 0 });
    expect(p.x).toBeCloseTo(0, 6);
    expect(p.y).toBeCloseTo(0, 6);
    expect(p.depth).toBeCloseTo(1, 6);
    expect(p.visible).toBe(true);
  });

  it("puts lng 0 on the right-hand limb at phi 0", () => {
    const p = projectMarker(0, 0, { phi: 0, theta: 0 });
    expect(p.x).toBeCloseTo(1, 6);
    expect(p.depth).toBeCloseTo(0, 6);
  });

  it("hides points on the far hemisphere", () => {
    const back = projectMarker(0, 90, { phi: 0, theta: 0 });
    expect(back.depth).toBeCloseTo(-1, 6);
    expect(back.visible).toBe(false);
  });

  it("brings the north pole into view when tilted", () => {
    const flat = projectMarker(90, 0, { phi: 0, theta: 0 });
    expect(flat.depth).toBeCloseTo(0, 6); // sits on the top limb (silhouette)
    expect(flat.y).toBeCloseTo(1, 6);

    const tilted = projectMarker(90, 0, { phi: 0, theta: 0.3 });
    expect(tilted.depth).toBeGreaterThan(0.2); // clearly toward the viewer now
    expect(tilted.visible).toBe(true);
    expect(tilted.y).toBeGreaterThan(0); // still in the upper half
  });

  it("rotates a point out of view as phi advances", () => {
    const front = projectMarker(0, -90, { phi: 0, theta: 0 });
    const rotated = projectMarker(0, -90, { phi: Math.PI, theta: 0 });
    expect(front.visible).toBe(true);
    expect(rotated.visible).toBe(false);
  });
});

describe("depthOpacity / depthScale", () => {
  it("hides back-face beacons", () => {
    expect(depthOpacity(0)).toBe(0);
    expect(depthOpacity(-0.5)).toBe(0);
  });

  it("is fully opaque facing the viewer and fades toward the limb", () => {
    expect(depthOpacity(1)).toBe(1);
    expect(depthOpacity(0.1)).toBeLessThan(depthOpacity(0.9));
  });

  it("scales nearer beacons larger", () => {
    expect(depthScale(1)).toBeCloseTo(1, 6);
    expect(depthScale(0)).toBeCloseTo(0.7, 6);
    expect(depthScale(0.5)).toBeGreaterThan(depthScale(0));
  });
});
