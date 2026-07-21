export interface LatLng {
  lat: number;
  lng: number;
}

const isValidLatLng = ({ lat, lng }: LatLng): boolean =>
  !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;

/** Matches a plain "lat, lng" pair, e.g. "24.7136, 46.6753". */
function parseCoordinatePair(value: string): LatLng | null {
  const match = value.trim().match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
  if (!match) return null;

  const candidate = { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
  return isValidLatLng(candidate) ? candidate : null;
}

// Covers the coordinate patterns Google Maps embeds in its share links, e.g.
// ".../@24.7136,46.6753,15z", "?q=24.7136,46.6753" and "?ll=24.7136,46.6753".
// Shortened links (maps.app.goo.gl/...) can't be resolved client-side since
// that requires following a redirect, so those are left unmatched on purpose.
const GOOGLE_MAPS_URL_PATTERNS = [
  /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
  /[?&]q=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
  /[?&]ll=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
];

function parseGoogleMapsUrl(value: string): LatLng | null {
  for (const pattern of GOOGLE_MAPS_URL_PATTERNS) {
    const match = value.match(pattern);
    if (!match) continue;

    const candidate = { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
    if (isValidLatLng(candidate)) return candidate;
  }
  return null;
}

/**
 * Parses a location entered as either raw "lat, lng" coordinates or a
 * Google Maps link. Returns null if the value doesn't match either format.
 */
export function parseLocationInput(value: string): LatLng | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (/^https?:\/\//i.test(trimmed)) {
    return parseGoogleMapsUrl(trimmed);
  }

  return parseCoordinatePair(trimmed);
}
