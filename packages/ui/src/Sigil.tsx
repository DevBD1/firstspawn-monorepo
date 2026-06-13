import React from "react";

export interface SigilProps {
  size?: number;
  color?: string;
}

export function Sigil({ size = 24, color = "var(--primary)" }: SigilProps) {
  const u = 4.8;
  const cells = [
    [1, 0],
    [2, 0],
    [3, 0],
    [4, 0],
    [0, 1],
    [0, 2],
    [1, 2],
    [2, 2],
    [3, 2],
    [4, 3],
    [0, 4],
    [1, 4],
    [2, 4],
    [3, 4],
  ];

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ flex: "none" }}>
      {cells.map(([x, y], i) => (
        <rect key={i} x={x * u} y={y * u} width={u} height={u} fill={color} />
      ))}
    </svg>
  );
}
