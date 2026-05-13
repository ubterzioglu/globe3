export interface GlobePinItem {
  id: string;
  pinType: string;
  displayName: string;
  description: string | null;
  city: string;
  country: string;
  countryCode: string | null;
  lat: number;
  lng: number;
  createdAt: string;
}

export interface FlyToCoordsInput {
  lat: number;
  lng: number;
  duration?: number;
}

export interface GlobeController {
  flyToCoords: (input: FlyToCoordsInput) => void;
}
