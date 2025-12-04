import React from 'react';

interface InputSectionProps {
  city: string;
  setCity: (city: string) => void;
  onSearch: () => void;
  loading: boolean;
  hasSearched: boolean;
}

export const InputSection: React.FC<InputSectionProps> = ({
  city,
  setCity,
  onSearch,
  loading,
  hasSearched,
}) => {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !loading && city.trim()) {
      onSearch();
    }
  };

  return (
    <div className={`text-center transition-all duration-700 ${hasSearched ? 'py-8 md:py-12' : 'py-20 md:py-32'}`}>
      {/* Title - only show when not searched or make smaller after search */}
      <h1 className={`font-bold text-white mb-3 transition-all duration-700 ${
        hasSearched
          ? 'text-3xl md:text-4xl'
          : 'text-5xl md:text-7xl lg:text-8xl'
      }`}>
        TONIGHT'S SKY
      </h1>

      {/* Subtitle */}
      <p className={`text-cyan-400 font-light mb-8 md:mb-12 transition-all duration-700 ${
        hasSearched
          ? 'text-xs md:text-sm tracking-[0.3em]'
          : 'text-sm md:text-base tracking-[0.4em]'
      }`}>
        PLANETARY ALIGNMENT & CONSTELLATION TRACKER
      </p>

      {/* Search Input */}
      <div className="max-w-md mx-auto px-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter city name"
            disabled={loading}
            className="flex-1 px-5 py-3 bg-slate-900/50 border border-slate-700/50 rounded-lg
                     text-white placeholder-slate-500
                     focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all duration-200"
            aria-label="City name"
          />
          <button
            onClick={onSearch}
            disabled={loading || !city.trim()}
            className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400
                     text-slate-900 font-semibold rounded-lg
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-cyan-500
                     transition-all duration-200
                     tracking-widest text-sm
                     shadow-lg shadow-cyan-500/20 hover:shadow-cyan-400/30"
            aria-label="Search for city"
          >
            {loading ? 'SEARCHING...' : 'OBSERVE'}
          </button>
        </div>
      </div>
    </div>
  );
};
