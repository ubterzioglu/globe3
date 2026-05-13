export type PinType = 'person' | 'business' | 'ngo' | 'creator' | 'event';

export type PinStatus = 'pending' | 'approved' | 'rejected';

export interface PinFormValues {
  pinType: PinType;
  displayName: string;
  description: string;
  placeId: string;
  sessionToken: string;
}

export interface PinListItem {
  id: string;
  pinType: PinType;
  displayName: string;
  description: string | null;
  city: string;
  country: string;
  countryCode: string | null;
  lat: number;
  lng: number;
  status: PinStatus;
  rejectionReason: string | null;
  createdAt: string;
}

export const PIN_TYPE_LABELS: Record<PinType, string> = {
  person: 'Kişi',
  business: 'İşletme',
  ngo: 'STK',
  creator: 'İçerik Üretici',
  event: 'Etkinlik',
};

export const PIN_TYPE_OPTIONS = Object.entries(PIN_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));
