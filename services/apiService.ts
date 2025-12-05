import { SkyObject, SkyDataAPIResponse } from '../types';

const WORKER_URL = import.meta.env.VITE_WORKER_URL || 'https://tonights-sky-api.tikkanadityajyothi.workers.dev';
const VISIBLE_PLANETS_API = 'https://api.visibleplanets.dev/v3';

interface GeocodeResponse {
  lat: number;
  lon: number;
  name: string;
  country: string;
}

/**
 * Fetches sky data for a given city
 * @param city - City name to search for
 * @returns Promise with coordinates and sky objects
 * @throws Error if city not found or network fails
 */
export async function getSkyData(city: string): Promise<SkyDataAPIResponse> {
  if (!city || !city.trim()) {
    throw new Error('Please enter a city name');
  }

  try {
    // Step 1: Get coordinates from Cloudflare Worker
    const geocodeResponse = await fetch(`${WORKER_URL}/api/geocode?city=${encodeURIComponent(city.trim())}`);

    if (!geocodeResponse.ok) {
      if (geocodeResponse.status === 404) {
        throw new Error('City not found. Please check the spelling and try again.');
      }
      if (geocodeResponse.status === 429) {
        throw new Error('Too many requests. Please wait a moment and try again.');
      }
      throw new Error('Unable to retrieve location data. Please try again later.');
    }

    const geocodeData: GeocodeResponse = await geocodeResponse.json();

    // Validate geocode response
    if (!geocodeData.lat || !geocodeData.lon) {
      throw new Error('Invalid location data received. Please try again.');
    }

    // Step 2: Get visible planets/objects from Visible Planets API
    const planetsResponse = await fetch(`${VISIBLE_PLANETS_API}?latitude=${geocodeData.lat}&longitude=${geocodeData.lon}`);

    if (!planetsResponse.ok) {
      throw new Error('Unable to retrieve sky objects data. Please try again later.');
    }

    const planetsData = await planetsResponse.json();

    // Step 3: Get timezone information
    let timezone = '';
    let localTime = '';
    try {
      const timeResponse = await fetch(`https://timeapi.io/api/Time/current/coordinate?latitude=${geocodeData.lat}&longitude=${geocodeData.lon}`);
      if (timeResponse.ok) {
        const timeData = await timeResponse.json();
        timezone = timeData.timeZone || '';
        // Create a readable local time string
        if (timeData.dateTime) {
          const date = new Date(timeData.dateTime);
          localTime = date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          });
        }
      }
    } catch (error) {
      console.warn('Failed to fetch timezone data:', error);
      // Continue without timezone info
    }

    // Transform Visible Planets API response to our SkyObject format
    const skyObjects: SkyObject[] = transformVisiblePlanetsData(planetsData, localTime);

    return {
      lat: geocodeData.lat,
      lon: geocodeData.lon,
      city: geocodeData.name,
      objects: skyObjects,
      timezone,
      localTime,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error. Please check your connection and try again.');
  }
}

/**
 * Transforms Visible Planets API response to our SkyObject format
 */
function transformVisiblePlanetsData(data: any, localTime: string): SkyObject[] {
  const skyObjects: SkyObject[] = [];

  // Check if data has the expected structure
  if (!data || typeof data !== 'object') {
    return skyObjects;
  }

  // First pass: find the Sun's altitude to determine if it's daytime
  let sunAltitude = -90; // Default to well below horizon
  if (data.data && Array.isArray(data.data)) {
    const sunData = data.data.find((obj: any) => obj.name === 'Sun');
    if (sunData && sunData.altitude !== undefined) {
      sunAltitude = sunData.altitude;
    }
  }

  // Track constellations we've seen
  const constellationMap = new Map<string, { planets: string[], altitude: number, azimuth: number }>();

  // Process visible planets (only naked eye objects)
  if (data.data && Array.isArray(data.data)) {
    data.data.forEach((planet: any) => {
      if (planet.name && planet.altitude !== undefined && planet.altitude > 0) {
        // Only include naked eye visible objects
        if (planet.nakedEyeObject === true) {
          skyObjects.push({
            name: planet.name,
            type: 'Planet',
            altitude: Math.round(planet.altitude).toString(),
            direction: getDirectionFromAzimuth(planet.azimuth || 0),
            bestTime: calculateBestTime(planet.altitude, planet.azimuth || 0, planet.name, localTime, sunAltitude),
            description: generatePlanetDescription(planet.name, planet.constellation),
            magnitude: planet.magnitude?.toString(),
          });

          // Track constellation
          if (planet.constellation) {
            if (!constellationMap.has(planet.constellation)) {
              constellationMap.set(planet.constellation, {
                planets: [planet.name],
                altitude: planet.altitude,
                azimuth: planet.azimuth || 0
              });
            } else {
              const existing = constellationMap.get(planet.constellation)!;
              existing.planets.push(planet.name);
              // Use average altitude and azimuth
              existing.altitude = (existing.altitude + planet.altitude) / 2;
              existing.azimuth = (existing.azimuth + (planet.azimuth || 0)) / 2;
            }
          }
        }
      }
    });
  }

  // Add constellation cards
  constellationMap.forEach((info, constName) => {
    skyObjects.push({
      name: constName,
      type: 'Constellation',
      altitude: Math.round(info.altitude).toString(),
      direction: '', // Will be derived from planets
      bestTime: calculateBestTime(info.altitude, info.azimuth, constName, localTime, sunAltitude),
      description: `The ${constName} constellation is currently hosting ${info.planets.join(', ')}.`,
      magnitude: undefined,
    });
  });

  return skyObjects;
}

/**
 * Converts azimuth degrees to compass direction
 */
function getDirectionFromAzimuth(azimuth: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(azimuth / 45) % 8;
  return directions[index];
}

/**
 * Calculates best viewing time based on altitude, azimuth, local time, and Sun position
 */
function calculateBestTime(altitude: number, azimuth: number, name: string, localTime: string, sunAltitude: number): string {
  // If we have local time, parse it to get the current hour at the location
  let currentHour = 12; // Default to noon if we can't determine
  if (localTime) {
    const match = localTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (match) {
      let hour = parseInt(match[1]);
      const period = match[3].toUpperCase();
      if (period === 'PM' && hour !== 12) hour += 12;
      if (period === 'AM' && hour === 12) hour = 0;
      currentHour = hour;
    }
  }

  // Helper to format hour in 12-hour format
  const format12Hour = (hour24: number): string => {
    const period = hour24 >= 12 ? 'PM' : 'AM';
    const hour12 = hour24 % 12 || 12;
    return `${hour12}:00 ${period}`;
  };

  // For the Sun, best time is around noon (solar noon)
  if (name === 'Sun') {
    // Sun is best viewed at transit (highest point), which is roughly at azimuth 180° (south)
    // If azimuth is close to 180°, it's near noon
    if (Math.abs(azimuth - 180) < 30) {
      return 'Now (near noon)';
    } else if (azimuth < 180) {
      // Sun is still rising, best time is later (closer to noon)
      const hoursToNoon = Math.round((180 - azimuth) / 15); // Rough estimate: 15° per hour
      return `${format12Hour((currentHour + hoursToNoon) % 24)} (local)`;
    } else {
      // Sun is setting, best time was earlier
      return `${format12Hour((currentHour - 1 + 24) % 24)} (local)`;
    }
  }

  // For planets and constellations, they're only visible when the Sun is well below the horizon
  // Sun altitude > -6° = Civil twilight (too bright for most stars/planets)
  // Sun altitude > -12° = Nautical twilight (some bright planets visible)
  // Sun altitude > -18° = Astronomical twilight (darker, more stars visible)
  // Sun altitude <= -18° = True night (best viewing)

  const isDaytime = sunAltitude > -6; // Sun above horizon or in civil twilight
  const isTwilight = sunAltitude > -18 && sunAltitude <= -6; // Nautical/astronomical twilight

  if (isDaytime) {
    // It's daytime or civil twilight - planets/constellations not visible
    // Estimate sunset time: if Sun is high, it sets in a few hours
    // Very rough estimate: Sun moves ~15° per hour, and sets when altitude reaches -6°
    const hoursToTwilight = Math.max(1, Math.round((sunAltitude + 6) / 15));

    if (hoursToTwilight <= 3) {
      const sunsetTime = (currentHour + hoursToTwilight) % 24;
      return `After sunset (~${format12Hour(sunsetTime)})`;
    } else {
      return 'After sunset';
    }
  }

  if (isTwilight) {
    // During twilight - only very bright objects visible
    // Estimate when astronomical twilight begins (Sun at -18°)
    const hoursToDark = Math.max(0.5, Math.round((sunAltitude + 18) / 15));

    if (hoursToDark <= 2) {
      const darkTime = (currentHour + hoursToDark) % 24;
      return `After dark (~${format12Hour(darkTime)})`;
    } else {
      return 'After dark';
    }
  }

  // It's nighttime - use the original logic for best viewing time
  if (altitude > 60) {
    // Object is high in the sky - best time is now
    return 'Now';
  } else if (altitude > 40 && Math.abs(azimuth - 180) < 45) {
    // Object is moderately high and near transit - best time is now or very soon
    return 'Now';
  } else if (azimuth < 180) {
    // Object is in the eastern sky (rising) - best time is later
    const hoursToTransit = Math.round((180 - azimuth) / 15);
    if (hoursToTransit <= 2) {
      return `${format12Hour((currentHour + hoursToTransit) % 24)} (local)`;
    } else {
      return `${format12Hour((currentHour + 2) % 24)} (local)`;
    }
  } else {
    // Object is in the western sky (setting) - best time is now or was earlier
    if (altitude > 30) {
      return 'Now';
    } else {
      return `${format12Hour(currentHour)} (local)`;
    }
  }
}

/**
 * Generates a description for a planet
 */
function generatePlanetDescription(name: string, constellation?: string): string {
  const descriptions: { [key: string]: string } = {
    'Mercury': 'The swift messenger, closest planet to the Sun, visible low on the horizon.',
    'Venus': 'The brilliant Evening Star, a stunning sight in the twilight sky.',
    'Mars': 'The red planet, shining with its distinctive rusty hue.',
    'Jupiter': 'The gas giant, brightest object after Venus and the Moon.',
    'Saturn': 'The ringed planet, a jewel of the night sky.',
    'Uranus': 'The ice giant, faintly visible to the naked eye under dark skies.',
    'Neptune': 'The distant ice giant, requiring binoculars or telescope to observe.',
  };

  let desc = descriptions[name] || `${name}, a celestial wonder in tonight's sky.`;

  if (constellation) {
    desc += ` Currently in ${constellation}.`;
  }

  return desc;
}

/**
 * Generates a dynamic summary text from sky objects
 * @param objects - Array of visible sky objects
 * @returns Human-readable summary string
 */
export function generateSummary(objects: SkyObject[]): string {
  if (!objects || objects.length === 0) {
    return "Clear skies tonight, though major celestial objects are currently below the horizon";
  }

  // Separate by type and prioritize
  const planets = objects.filter(obj => obj.type === 'Planet');
  const constellations = objects.filter(obj => obj.type === 'Constellation');
  const stars = objects.filter(obj => obj.type === 'Star');
  const moon = objects.filter(obj => obj.type === 'Moon');

  const highlights: string[] = [];

  // Add Moon if visible
  if (moon.length > 0) {
    highlights.push('the Moon');
  }

  // Add planets (up to 3)
  if (planets.length > 0) {
    const planetNames = planets.slice(0, 3).map(p => p.name);
    if (planets.length > 3) {
      highlights.push(`${planetNames.join(', ')}, and ${planets.length - 3} more planet${planets.length - 3 > 1 ? 's' : ''}`);
    } else {
      highlights.push(...planetNames);
    }
  }

  // Add constellations (up to 2)
  if (constellations.length > 0) {
    const constNames = constellations.slice(0, 2).map(c => `the ${c.name} constellation`);
    highlights.push(...constNames);
  }

  // Add bright stars (up to 1)
  if (stars.length > 0 && highlights.length < 5) {
    highlights.push(stars[0].name);
  }

  // Construct the summary
  if (highlights.length === 0) {
    return "Several celestial objects are visible in tonight's sky";
  }

  let summary = "Tonight's sky offers excellent views of ";

  if (highlights.length === 1) {
    summary += highlights[0];
  } else if (highlights.length === 2) {
    summary += `${highlights[0]} and ${highlights[1]}`;
  } else {
    const lastItem = highlights.pop();
    summary += `${highlights.join(', ')}, and ${lastItem}`;
  }

  // Add time context if we have evening planets
  const eveningPlanets = planets.filter(p => {
    const time = p.bestTime.toLowerCase();
    return time.includes('pm') && !time.includes('11') && !time.includes('12');
  });

  if (eveningPlanets.length > 0) {
    summary += " in the early evening";
  } else if (planets.length > 0 || constellations.length > 0) {
    summary += " tonight";
  }

  return summary;
}
