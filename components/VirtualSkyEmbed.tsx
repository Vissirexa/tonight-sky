import React, { useEffect, useRef, useState } from 'react';

interface VirtualSkyEmbedProps {
  latitude: number;
  longitude: number;
  city: string;
}

// Declare VirtualSky on window object
declare global {
  interface Window {
    VirtualSky: any;
  }
}

export const VirtualSkyEmbed: React.FC<VirtualSkyEmbedProps> = ({
  latitude,
  longitude,
  city,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const virtualSkyInstance = useRef<any>(null);

  useEffect(() => {
    // Check if VirtualSky is available
    if (typeof window.VirtualSky === 'undefined') {
      setError('VirtualSky library not loaded');
      setLoading(false);
      return;
    }

    // Wait for container to be ready
    if (!containerRef.current) return;

    try {
      // Clear any existing instance
      if (virtualSkyInstance.current) {
        containerRef.current.innerHTML = '';
      }

      // Initialize VirtualSky
      virtualSkyInstance.current = window.VirtualSky({
        id: containerRef.current,
        projection: 'stereo', // Stereographic projection for natural look
        latitude: latitude,
        longitude: longitude,
        clock: new Date(), // Current time
        showstarlabels: true,
        showplanets: true,
        showplanetlabels: true,
        showconstellations: true,
        showconstellationlabels: true,
        showdate: false,
        showposition: false,
        ground: true,
        gradient: true,
        cardinalpoints: true,
        az: 180, // Looking south by default
        live: true, // Update in real-time
        transparent: false,
        keyboard: false, // Disable keyboard controls for embedded view
        mouse: true, // Allow mouse interaction
      });

      setLoading(false);
      setError(null);
    } catch (err) {
      console.error('Error initializing VirtualSky:', err);
      setError('Unable to load sky visualization');
      setLoading(false);
    }

    // Cleanup on unmount
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      virtualSkyInstance.current = null;
    };
  }, [latitude, longitude]);

  return (
    <div className="w-full relative rounded-2xl overflow-hidden border border-slate-800 bg-[#0b0d14] shadow-2xl aspect-video md:aspect-[21/9]">
      {/* Live Indicator */}
      <div className="absolute top-6 left-6 z-20 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_2px_rgba(239,68,68,0.5)]"></div>
        <span className="text-[10px] font-bold tracking-[0.2em] text-slate-300 uppercase">
          Simulated Feed
        </span>
      </div>

      {/* VirtualSky Container */}
      <div className="absolute inset-0 flex items-center justify-center bg-[#050608]">
        {loading && (
          <div className="flex flex-col items-center gap-4 text-slate-600 z-10">
            <div className="w-12 h-12 border-2 border-slate-700 border-t-cyan-500 rounded-full animate-spin"></div>
            <span className="text-xs tracking-[0.2em] uppercase">Initializing Sky Map...</span>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center gap-4 text-red-400 z-10">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-xs tracking-[0.2em] uppercase">{error}</span>
          </div>
        )}

        {/* VirtualSky will be rendered here */}
        <div
          ref={containerRef}
          className="w-full h-full"
          style={{ display: loading || error ? 'none' : 'block' }}
        />

        {/* Grid Overlay Effect */}
        {!loading && !error && (
          <div
            className="absolute inset-0 pointer-events-none opacity-10"
            style={{
              backgroundImage:
                'linear-gradient(rgba(56, 189, 248, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(56, 189, 248, 0.2) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
        )}

        {/* Gradient Overlay - fade to dark at bottom */}
        {!loading && !error && (
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#030508] via-transparent to-transparent opacity-60"></div>
        )}
      </div>
    </div>
  );
};
