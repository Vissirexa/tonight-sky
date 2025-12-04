export interface SkyObject {
  name: string;
  type: 'Planet' | 'Constellation' | 'Star' | 'Moon' | 'Other';
  altitude: string;
  direction: string;
  bestTime: string;
  description: string;
  magnitude?: string;
}

export interface SkyDataResponse {
  objects: SkyObject[];
  summary: string;
}

export interface SkyDataAPIResponse {
  lat: number;
  lon: number;
  city: string;
  objects: SkyObject[];
}

export interface SimulationState {
  imageUrl: string | null;
  loading: boolean;
}