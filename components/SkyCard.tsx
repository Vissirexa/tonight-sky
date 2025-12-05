import React from 'react';
import { SkyObject } from '../types';

interface SkyCardProps {
  data: SkyObject;
  index: number;
}

export const SkyCard: React.FC<SkyCardProps> = ({ data, index }) => {
  // Get color for type badge
  const getTypeColor = (type: SkyObject['type']) => {
    switch (type) {
      case 'Planet':
        return 'text-amber-500'; // Yellow/orange
      case 'Constellation':
        return 'text-cyan-400'; // Cyan
      case 'Star':
        return 'text-cyan-400'; // Cyan
      case 'Moon':
        return 'text-slate-200'; // White
      default:
        return 'text-slate-400';
    }
  };

  return (
    <div
      className="glass-panel rounded-lg p-6 relative overflow-hidden group hover:border-cyan-500/30 transition-all duration-300"
      style={{
        animation: `fadeIn 0.6s ease-out ${index * 0.1}s both`,
      }}
    >
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {/* Main Layout: Name/Type on left, Altitude on right */}
      <div className="flex justify-between items-start mb-6">
        {/* Left side: Name and Type */}
        <div className="flex-1">
          <h3 className="text-2xl md:text-3xl font-semibold text-white mb-2">
            {data.name}
          </h3>
          <span className={`text-xs font-bold tracking-[0.2em] uppercase ${getTypeColor(data.type)}`}>
            {data.type}
          </span>
        </div>

        {/* Right side: Altitude */}
        <div className="text-right ml-4">
          <div className="text-[10px] tracking-[0.2em] text-slate-500 uppercase mb-1">
            Altitude
          </div>
          <div className="text-4xl md:text-5xl font-light text-white">
            {data.altitude}°
          </div>
        </div>
      </div>

      {/* Direction and Best Time - aligned horizontally */}
      <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-slate-800/50">
        <div>
          <div className="text-[10px] tracking-[0.2em] text-slate-500 uppercase mb-1">
            Direction
          </div>
          <div className="text-lg font-medium text-white">
            {data.direction}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] tracking-[0.2em] text-slate-500 uppercase mb-1">
            Best Time
          </div>
          <div className="text-lg font-medium text-white">
            {data.bestTime}
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-slate-400 leading-relaxed line-clamp-3">
        {data.description}
      </p>

      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-cyan-500/0 group-hover:from-cyan-500/5 group-hover:to-transparent transition-all duration-300 pointer-events-none rounded-lg" />
    </div>
  );
};
