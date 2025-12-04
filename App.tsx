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
          <div className="max-w-md mx-auto mb-12 p-4 bg-red-900/20 border border-red-900/50 rounded text-red-400 text-center animate-fade-in text-sm tracking-wide">
            {error}
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
            {skyObjects.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
                {skyObjects.map((obj, idx) => (
                  <SkyCard key={`${obj.name}-${idx}`} data={obj} index={idx} />
                ))}
              </div>
            )}

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