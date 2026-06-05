import Constants from "expo-constants";

const GOOGLE_MAPS_API_KEY =
  (Constants.expoConfig as any)?.android?.config?.googleMaps?.apiKey ||
  (Constants.expoConfig as any)?.extra?.googleMapsApiKey ||
  "";

if (!GOOGLE_MAPS_API_KEY) {
  console.warn("Google Maps API key not found in app config");
}

type PlacePrediction = {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
};

type GeocodeResult = {
  formattedAddress: string;
  latitude: number;
  longitude: number;
  street?: string;
  city?: string;
  region?: string;
  country?: string;
};

export async function fetchPlaceAutocomplete(input: string): Promise<PlacePrediction[]> {
  if (!input.trim() || !GOOGLE_MAPS_API_KEY) return [];

  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${GOOGLE_MAPS_API_KEY}&components=country:ke`;
  const response = await fetch(url);
  const data = await response.json();
  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    console.warn("Places autocomplete error:", data.status, data.error_message);
    return [];
  }
  return (data.predictions || []).map((p: any) => ({
    placeId: p.place_id,
    description: p.description,
    mainText: p.structured_formatting?.main_text || p.description,
    secondaryText: p.structured_formatting?.secondary_text || "",
  }));
}

export async function fetchPlaceDetails(placeId: string): Promise<GeocodeResult | null> {
  if (!GOOGLE_MAPS_API_KEY) return null;

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_MAPS_API_KEY}&fields=geometry,formatted_address,address_components`;
  const response = await fetch(url);
  const data = await response.json();
  if (data.status !== "OK" || !data.result) return null;

  const result = data.result;
  const addressComponents = result.address_components || [];
  const getComponent = (types: string[]) => {
    const comp = addressComponents.find((c: any) => types.some((t) => c.types.includes(t)));
    return comp?.long_name || "";
  };

  return {
    formattedAddress: result.formatted_address || result.name || "",
    latitude: result.geometry?.location?.lat || 0,
    longitude: result.geometry?.location?.lng || 0,
    street: getComponent(["street_number"]) + " " + getComponent(["route"]),
    city: getComponent(["locality", "administrative_area_level_3", "postal_town"]),
    region: getComponent(["administrative_area_level_1"]),
    country: getComponent(["country"]),
  };
}

export async function reverseGeocode(latitude: number, longitude: number): Promise<GeocodeResult | null> {
  if (!GOOGLE_MAPS_API_KEY) return null;

  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}&language=en`;
  const response = await fetch(url);
  const data = await response.json();
  if (data.status !== "OK" || !data.results?.length) return null;

  const result = data.results[0];
  const addressComponents = result.address_components || [];
  const getComponent = (types: string[]) => {
    const comp = addressComponents.find((c: any) => types.some((t) => c.types.includes(t)));
    return comp?.long_name || "";
  };

  return {
    formattedAddress: result.formatted_address,
    latitude,
    longitude,
    street: getComponent(["street_number"]) + " " + getComponent(["route"]),
    city: getComponent(["locality", "administrative_area_level_3", "postal_town"]),
    region: getComponent(["administrative_area_level_1"]),
    country: getComponent(["country"]),
  };
}
