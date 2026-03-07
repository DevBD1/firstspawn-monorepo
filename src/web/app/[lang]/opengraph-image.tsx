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
    new URL('../../assets/fonts/PressStart2P-Regular.ttf', import.meta.url)
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
            padding: '48px',
            border: '3px solid #333',
            background: '#050505',
            boxShadow: '8px 8px 0 rgba(0,0,0,0.5)',
          }}
        >
          {/* Label */}
          <div
            style={{
              fontSize: 14,
              letterSpacing: '2px',
              color: '#22d3ee',
              textTransform: 'uppercase',
              marginBottom: 12,
              fontWeight: 600,
            }}
          >
            Verified Discovery Node
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 56,
              fontWeight: 900,
              color: 'white',
              lineHeight: 1,
              marginBottom: 24,
              letterSpacing: '-2px',
              textShadow: '0 0 20px rgba(255,255,255,0.2)',
            }}
          >
            FIRSTSPAWN
          </div>

          {/* Subtitle / Description */}
          <div
            style={{
              fontSize: 20,
              color: '#a1a1aa',
              textAlign: 'center',
              maxWidth: 800,
              fontWeight: 400,
              lineHeight: 1.5,
            }}
          >
            The only reliable infrastructure for Minecraft & Hytale servers. We systematically prevent fake votes and bots, ensuring you discover servers based on technical performance and genuine community love.
          </div>

          {/* Status Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginTop: 48,
              gap: 24,
              padding: '14px 28px',
              background: 'rgba(34, 211, 238, 0.1)',
              border: '2px solid rgba(34, 211, 238, 0.2)',
              backgroundColor: 'rgba(34, 211, 238, 0.05)',
            }}
          >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                }}
            >
                <div style={{ width: 10, height: 10, background: '#4ade80', borderRadius: '50%', boxShadow: '0 0 8px #4ade80' }} />
                <span style={{ color: '#4ade80', fontSize: 16, fontWeight: 700 }}>SYSTEMS ONLINE</span>
            </div>
            <div style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.1)' }} />
            <div style={{ color: '#94a3b8', fontSize: 16 }}>100% COMMUNITY</div>
          </div>
        </div>
 
        {/* Pixel Corners */}
        <div style={{ position: 'absolute', top: 38, left: 38, width: 12, height: 4, background: '#22d3ee' }} />
        <div style={{ position: 'absolute', top: 38, left: 38, width: 4, height: 12, background: '#22d3ee' }} />
        
        <div style={{ position: 'absolute', bottom: 38, right: 38, width: 12, height: 4, background: '#22d3ee' }} />
        <div style={{ position: 'absolute', bottom: 38, right: 38, width: 4, height: 12, background: '#22d3ee' }} />
 
        <div style={{ position: 'absolute', top: 38, right: 38, width: 12, height: 4, background: '#22d3ee' }} />
        <div style={{ position: 'absolute', top: 38, right: 38, width: 4, height: 12, background: '#22d3ee' }} />
 
        <div style={{ position: 'absolute', bottom: 38, left: 38, width: 12, height: 4, background: '#22d3ee' }} />
        <div style={{ position: 'absolute', bottom: 38, left: 38, width: 4, height: 12, background: '#22d3ee' }} />
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
