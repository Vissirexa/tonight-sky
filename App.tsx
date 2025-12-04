import React, { useState } from 'react';
import { StarryBackground } from './components/StarryBackground';
import { InputSection } from './components/InputSection';
import { SkyCard } from './components/SkyCard';
import { VirtualSkyEmbed } from './components/VirtualSkyEmbed';
import { SkyObject } from './types';
import { getSkyData, generateSummary } from './services/apiService';

const App: React.FC = () => {
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [skyObjects, setSkyObjects] = useState<SkyObject[]>([]);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [summary, setSummary] = useState<string>('');
  const [hasSearched, setHasSearched] = useState(false);
  const [searchedCity, setSearchedCity] = useState('');

  const handleSearch = async () => {
    if (!city.trim()) return;

    setLoading(true);
    setError(null);
    setSkyObjects([]);
    setCoords(null);
    setSummary('');
    setHasSearched(true);
    setSearchedCity(city);

    try {
      // Get sky data from Cloudflare Worker
      const response = await getSkyData(city);

      // Extract coordinates and objects
      setCoords({ lat: response.lat, lon: response.lon });
      setSkyObjects(response.objects);

      // Generate summary from objects
      const generatedSummary = generateSummary(response.objects);
      setSummary(generatedSummary);

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unable to retrieve sky data. Please try again.");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative text-slate-200 bg-[#030508] overflow-x-hidden selection:bg-cyan-500/30">
      <StarryBackground />

      <main className="container mx-auto px-4 lg:px-8 relative z-10 pb-20 max-w-7xl">
        <InputSection
          city={city}
          setCity={setCity}
          onSearch={handleSearch}
          loading={loading && skyObjects.length === 0}
          hasSearched={hasSearched}
        />

        {error && (
          <div className="max-w-md mx-auto mb-12 p-6 bg-red-900/20 border border-red-900/50 rounded-lg text-center animate-fade-in">
            <div className="flex flex-col items-center gap-4">
              <svg className="w-12 h-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-red-400 text-sm tracking-wide">{error}</p>
              <button
                onClick={handleSearch}
                className="mt-2 px-6 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-300 rounded-lg text-sm font-medium transition-all duration-200"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {hasSearched && (skyObjects.length > 0 || loading) && (
          <div className="animate-fade-in flex flex-col gap-16">

            {/* Simulation Section */}
            <div className="flex flex-col items-center gap-8">
              {!loading && coords && (
                <div className="text-center space-y-4 animate-fade-in">
                  <h2 className="text-2xl md:text-3xl text-white font-light">
                    Observing from <span className="text-cyan-400 font-medium">{searchedCity}</span>
                  </h2>
                  <p className="text-slate-400 italic font-light max-w-2xl mx-auto leading-relaxed">
                    "{summary || 'Calibrating instruments for observation...'}"
                  </p>
                </div>
              )}

              {/* VirtualSky Embed */}
              {coords ? (
                <VirtualSkyEmbed
                  latitude={coords.lat}
                  longitude={coords.lon}
                  city={searchedCity}
                />
              ) : (
                <div className="w-full relative rounded-2xl overflow-hidden border border-slate-800 bg-[#0b0d14] shadow-2xl aspect-video md:aspect-[21/9]">
                  <div className="absolute inset-0 flex items-center justify-center bg-[#050608]">
                    <div className="flex flex-col items-center gap-4 text-slate-600">
                      <div className="w-12 h-12 border-2 border-slate-700 border-t-cyan-500 rounded-full animate-spin"></div>
                      <span className="text-xs tracking-[0.2em] uppercase">Loading Sky Data...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Results Grid */}
            {loading && skyObjects.length === 0 ? (
              // Skeleton loaders while loading
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="glass-panel rounded-lg p-6 animate-pulse"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex-1">
                        <div className="h-8 bg-slate-700/50 rounded w-2/3 mb-2"></div>
                        <div className="h-4 bg-slate-700/30 rounded w-1/3"></div>
                      </div>
                      <div className="ml-4">
                        <div className="h-12 w-12 bg-slate-700/50 rounded"></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-slate-800/50">
                      <div>
                        <div className="h-3 bg-slate-700/30 rounded w-1/2 mb-2"></div>
                        <div className="h-5 bg-slate-700/50 rounded w-1/3"></div>
                      </div>
                      <div>
                        <div className="h-3 bg-slate-700/30 rounded w-1/2 mb-2"></div>
                        <div className="h-5 bg-slate-700/50 rounded w-2/3"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-slate-700/30 rounded w-full"></div>
                      <div className="h-3 bg-slate-700/30 rounded w-5/6"></div>
                      <div className="h-3 bg-slate-700/30 rounded w-4/6"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : skyObjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
                {skyObjects.map((obj, idx) => (
                  <SkyCard key={`${obj.name}-${idx}`} data={obj} index={idx} />
                ))}
              </div>
            ) : !loading && hasSearched && !error ? (
              // Empty state when no objects found
              <div className="text-center py-16 px-4">
                <svg className="w-16 h-16 mx-auto mb-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2m12-10a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <h3 className="text-xl text-slate-400 mb-2">No Visible Objects</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  Major celestial objects are currently below the horizon for this location. Try searching for a different city or check back later.
                </p>
              </div>
            ) : null}

            <footer className="text-center text-[10px] text-slate-600 tracking-[0.2em] uppercase mb-8">
              Real-Time Sky Data • Visibility Subject to Weather
            </footer>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;