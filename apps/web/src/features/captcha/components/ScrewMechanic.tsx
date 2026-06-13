interface ScrewMechanicProps {
  rotation: number;
  targetRotation?: number;
  showTarget?: boolean;
}

const ScrewThread = ({ width, height }: { width: number; height: number }) => {
  const threads = [];
  const spacing = 10;
  for (let index = -20; index < width + 20; index += spacing) {
    threads.push(
      <path
        key={index}
        d={`M ${index} 0 L ${index + 10} ${height}`}
        stroke="#4a5568"
        strokeWidth="2"
        shapeRendering="crispEdges"
      />
    );
  }

  return (
    <g>
      <rect
        x="0"
        y="0"
        width={width}
        height={height}
        fill="#2d3748"
        stroke="black"
        strokeWidth="2"
      />
      <rect x="0" y="2" width={width} height="4" fill="#718096" opacity="0.5" />
      <g opacity="0.6">{threads}</g>
    </g>
  );
};

const PixelNut = ({ x, angle, isGhost }: { x: number; angle: number; isGhost?: boolean }) => {
  const opacity = isGhost ? 0.3 : 1;
  const strokeColor = isGhost ? "var(--success)" : "black";
  const fillColor = isGhost ? "transparent" : "#b13e53";
  const detailColor = isGhost ? "var(--success)" : "var(--primary)";

  return (
    <g transform={`translate(${x}, 0)`}>
      {!isGhost ? <ellipse cx="0" cy="35" rx="28" ry="8" fill="black" opacity="0.5" /> : null}
      <g transform={`rotate(${angle})`}>
        <path
          d="M -25 -15 L -25 15 L 0 30 L 25 15 L 25 -15 L 0 -30 Z"
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={isGhost ? 2 : 4}
          strokeLinejoin="round"
          opacity={opacity}
        />
        <circle
          cx="0"
          cy="0"
          r="10"
          fill="#1a1c2c"
          stroke={strokeColor}
          strokeWidth="2"
          opacity={opacity}
        />
        <rect x="-5" y="-25" width="10" height="10" fill={detailColor} opacity={opacity} />
        <rect x="-5" y="15" width="10" height="10" fill="#7d1e31" opacity={isGhost ? 0 : 1} />

        {!isGhost ? (
          <>
            <path d="M -20 -12 L -20 12" stroke="white" strokeWidth="2" opacity="0.3" />
            <path d="M -25 -15 L 0 -30" stroke="white" strokeWidth="2" opacity="0.3" />
          </>
        ) : null}
      </g>
    </g>
  );
};

const calculateX = (rotation: number): number => {
  const startX = -100;
  const endX = 100;
  const progress = Math.min(Math.max(rotation / 720, 0), 1);
  return startX + progress * (endX - startX);
};

export function ScrewMechanic({
  rotation,
  targetRotation = 0,
  showTarget = true,
}: ScrewMechanicProps) {
  const currentX = calculateX(rotation);
  const targetX = calculateX(targetRotation);

  return (
    <div className="relative flex h-48 w-full items-center justify-center overflow-hidden rounded-control border border-border bg-[#0B131A] shadow-inner">
      <svg width="100%" height="100%" viewBox="-160 -60 320 120" className="overflow-visible">
        <g transform="translate(-150, -15)">
          <ScrewThread width={300} height={30} />
        </g>

        {showTarget ? <PixelNut x={targetX} angle={targetRotation} isGhost /> : null}
        <PixelNut x={currentX} angle={rotation} />
      </svg>
    </div>
  );
}
