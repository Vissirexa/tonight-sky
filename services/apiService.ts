import { SkyObject, SkyDataAPIResponse } from '../types';

const WORKER_URL = import.meta.env.VITE_WORKER_URL || 'https://tonights-sky-api.tikkanadityajyothi.workers.dev';

/**
 * Fetches sky data for a given city from the Cloudflare Worker
 * @param city - City name to search for
 * @returns Promise with coordinates and sky objects
 * @throws Error if city not found or network fails
 */
export async function getSkyData(city: string): Promise<SkyDataAPIResponse> {
  if (!city || !city.trim()) {
    throw new Error('Please enter a city name');
  }

  try {
    const response = await fetch(`${WORKER_URL}/api/geocode?city=${encodeURIComponent(city.trim())}`);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('City not found. Please check the spelling and try again.');
      }
      if (response.status === 429) {
        throw new Error('Too many requests. Please wait a moment and try again.');
      }
      throw new Error('Unable to retrieve sky data. Please try again later.');
    }

    const data: SkyDataAPIResponse = await response.json();

    // Validate response structure
    if (!data.lat || !data.lon || !data.objects) {
      throw new Error('Invalid response from server. Please try again.');
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error. Please check your connection and try again.');
  }
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
