import * as Location from "expo-location";

// Restaurant location (GoGourmet kitchen)
export const RESTAURANT_COORDS = {
  latitude: -1.286389,
  longitude: 36.817223,
};

// Haversine distance in km between two lat/lng points
export function distanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function deliveryFeeFromCoords(
  lat?: number,
  lng?: number,
): { fee: number; km: number } {
  if (lat == null || lng == null) {
    return { fee: 0, km: 0 };
  }
  const km = distanceKm(
    RESTAURANT_COORDS.latitude,
    RESTAURANT_COORDS.longitude,
    lat,
    lng,
  );
  // KES 50 base + KES 30 per km, capped at KES 500
  const fee = Math.min(Math.round(50 + km * 30), 500);
  return { fee, km: Math.round(km * 10) / 10 };
}

export const getUserLocation = async () => {
  const { status } =
    await Location.requestForegroundPermissionsAsync();

  if (status !== "granted") {
    throw new Error("Location permission denied");
  }

  const location =
    await Location.getCurrentPositionAsync({});

  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };
};