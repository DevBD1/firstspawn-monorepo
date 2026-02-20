import React, { useMemo } from 'react';

interface ScrewMechanicProps {
  rotation: number; // Current rotation in degrees
  targetRotation?: number; // Target rotation for the ghost nut
  showTarget?: boolean;
}

const SCREW_PITCH = 0.5; // Pixels per degree of rotation
const SCREW_WIDTH = 300;
const NUT_SIZE = 60;

// Helper to generate the screw thread path
const ScrewThread: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const threads = [];
  const spacing = 10;
  for (let i = -20; i < width + 20; i += spacing) {
    threads.push(
      <path 
        key={i} 
        d={`M ${i} 0 L ${i + 10} ${height}`} 
        stroke="#4a5568" 
        strokeWidth="2" 
        shapeRendering="crispEdges"
      />
    );
  }
  return (
    <g>
      {/* Rod body */}
      <rect x="0" y="0" width={width} height={height} fill="#2d3748" stroke="black" strokeWidth="2" />
      {/* Highlights */}
      <rect x="0" y="2" width={width} height="4" fill="#718096" opacity="0.5" />
      {/* Threads */}
      <g opacity="0.6">{threads}</g>
    </g>
  );
};

const PixelNut: React.FC<{ x: number; angle: number; isGhost?: boolean }> = ({ x, angle, isGhost }) => {
    // Determine appearance based on ghost state
    const opacity = isGhost ? 0.3 : 1;
    const strokeColor = isGhost ? '#4ADE80' : 'black'; // Green outline for ghost target
    const fillColor = isGhost ? 'transparent' : '#b13e53'; // Rust red for the nut
    const detailColor = isGhost ? '#4ADE80' : '#ffd700'; // Gold/Green details
    
    // Calculate wobble/3D effect to simulate rotation on a screw
    // A simple 2D rotation is enough for the "face" of the nut, 
    // but the nut itself should just slide. 
    // Wait, the prompt implies "rotating the nut".
    // We will rotate the entire group.
    
    return (
        <g transform={`translate(${x}, 0)`}>
             {/* Shadow if not ghost */}
            {!isGhost && <ellipse cx="0" cy="35" rx="28" ry="8" fill="black" opacity="0.5" />}

            {/* The Nut Group, rotated by angle */}
            <g transform={`rotate(${angle})`}>
                {/* Hexagon shape */}
                <path
                    d="M -25 -15 L -25 15 L 0 30 L 25 15 L 25 -15 L 0 -30 Z"
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={isGhost ? 2 : 4}
                    strokeLinejoin="round"
                    opacity={opacity}
                />
                
                {/* Inner Hole (Screw passes through visually) */}
                <circle cx="0" cy="0" r="10" fill="#1a1c2c" stroke={strokeColor} strokeWidth="2" opacity={opacity} />

                {/* Visual Marker to indicate orientation (Like a pixel art arrow or notch) */}
                {/* Let's draw a small 'notch' or bolt pattern on one side to make orientation clear */}
                <rect x="-5" y="-25" width="10" height="10" fill={detailColor} opacity={opacity} />
                <rect x="-5" y="15" width="10" height="10" fill="#7d1e31" opacity={isGhost ? 0 : 1} /> {/* Shading */}
                
                {/* Pixel highlights for 3D feel */}
                {!isGhost && (
                   <>
                     <path d="M -20 -12 L -20 12" stroke="white" strokeWidth="2" opacity="0.3" />
                     <path d="M -25 -15 L 0 -30" stroke="white" strokeWidth="2" opacity="0.3" />
                   </>
                )}
            </g>
        </g>
    );
};

export const ScrewMechanic: React.FC<ScrewMechanicProps> = ({ rotation, targetRotation = 0, showTarget = true }) => {
  // Logic to clamp X position within the screw width
  // Assume rotation 0 -> x = start
  // Rotation 720 -> x = end
  
  const calculateX = (rot: number) => {
    // Center is 0 relative to component center
    // Range is roughly -120 to +120
    // Wrap the visual position if we want infinite screw, but for a captcha, finite is better.
    // Let's map 0-1000 degrees to the width.
    const normalized = (rot % 720); // 2 full rotations visual cycle if strictly linear?
    // Actually, for the puzzle, let's map rotation directly to position linearly without wrapping for simplicity of "matching".
    // Let 0 deg = left side, 720 deg = right side.
    const startX = -100;
    const endX = 100;
    const totalTravel = endX - startX;
    const maxRot = 720;
    
    // Linear interpolation
    const progress = Math.min(Math.max(rot / maxRot, 0), 1);
    return startX + (progress * totalTravel);
  };

  const currentX = calculateX(rotation);
  const targetX = calculateX(targetRotation);

  return (
    <div className="relative w-full h-48 flex items-center justify-center overflow-hidden bg-[#0B131A] rounded border-2 border-black shadow-inner">
        {/* SVG Container */}
        <svg width="100%" height="100%" viewBox="-160 -60 320 120" className="overflow-visible">
            <defs>
                <filter id="pixelate" x="0%" y="0%" width="100%" height="100%">
                    {/* SVG filter for pixelation is complex, relying on CSS image-rendering instead on parent */}
                </filter>
            </defs>

            {/* Background Screw Thread */}
            <g transform="translate(-150, -15)">
                <ScrewThread width={300} height={30} />
            </g>

            {/* Ghost / Target Nut */}
            {showTarget && (
                <PixelNut x={targetX} angle={targetRotation} isGhost={true} />
            )}

            {/* Active User Nut */}
            <PixelNut x={currentX} angle={rotation} />
            
        </svg>
    </div>
  );
};
