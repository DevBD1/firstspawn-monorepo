import { ImageResponse } from 'next/og';
 
export const runtime = 'edge';
 
// Image metadata
export const alt = 'FirstSpawn - Find your forever server';
export const size = {
  width: 1200,
  height: 630,
};
 
export const contentType = 'image/png';
 
export default async function Image() {
  const pressStart2P = await fetch(
    'https://fonts.gstatic.com/s/pressstart2p/v15/e3t4euO8wC8HsKJxtQRhT8E5kQLX.woff'
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#050505',
          fontFamily: '"Press Start 2P"',
          position: 'relative',
        }}
      >
        {/* Background Grid */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              'linear-gradient(to right, #1a1a1a 1px, transparent 1px), linear-gradient(to bottom, #1a1a1a 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            opacity: 0.3,
          }}
        />

        {/* Radial Glow */}
        <div
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'radial-gradient(circle at center, rgba(34, 211, 238, 0.15) 0%, transparent 70%)',
            }}
        />

        {/* Content Container */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            zIndex: 10,
            padding: '40px',
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(5,5,5,0.9)',
            borderRadius: '16px',
            boxShadow: '0 0 40px rgba(0,0,0,0.5)',
          }}
        >
          {/* Label */}
          <div
            style={{
              fontSize: 12,
              letterSpacing: '2px',
              color: '#22d3ee',
              textTransform: 'uppercase',
              marginBottom: 10,
              fontWeight: 600,
            }}
          >
            Verified Discovery Node
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 50,
              fontWeight: 900,
              color: 'white',
              lineHeight: 1,
              marginBottom: 20,
              letterSpacing: '-2px',
              textShadow: '0 0 20px rgba(255,255,255,0.2)',
            }}
          >
            FIRSTSPAWN
          </div>

          {/* Subtitle / Description */}
          <div
            style={{
              fontSize: 18,
              color: '#a1a1aa',
              textAlign: 'center',
              maxWidth: 700,
              fontWeight: 400,
              lineHeight: 1.5,
            }}
          >
            The infrastructure for reliable voxel multiplayer. Verified uptime, no pay-to-win placements.
          </div>

          {/* Status Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginTop: 40,
              gap: 20,
              padding: '12px 24px',
              background: 'rgba(34, 211, 238, 0.1)',
              border: '1px solid rgba(34, 211, 238, 0.2)',
              borderRadius: '999px',
            }}
          >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                }}
            >
                <div style={{ width: 8, height: 8, background: '#4ade80', borderRadius: '50%', boxShadow: '0 0 8px #4ade80' }} />
                <span style={{ color: '#4ade80', fontSize: 14, fontWeight: 700 }}>SYSTEMS ONLINE</span>
            </div>
            <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)' }} />
            <div style={{ color: '#94a3b8', fontSize: 14 }}>100% FAKE VOTES BLOCKED</div>
          </div>
        </div>

        {/* Decorative Corners */}
        <div style={{ position: 'absolute', top: 40, left: 40, width: 20, height: 2, background: '#333' }} />
        <div style={{ position: 'absolute', top: 40, left: 40, width: 2, height: 20, background: '#333' }} />
        <div style={{ position: 'absolute', bottom: 40, right: 40, width: 20, height: 2, background: '#333' }} />
        <div style={{ position: 'absolute', bottom: 40, right: 40, width: 2, height: 20, background: '#333' }} />
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'Press Start 2P',
          data: pressStart2P,
          style: 'normal',
          weight: 400,
        },
      ],
    }
  );
}
