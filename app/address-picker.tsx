import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, { MapPressEvent, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { COLORS } from "../styles/colors";

export default function AddressPickerScreen() {
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState({
    latitude: -1.2921,
    longitude: 36.8219,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [selectedCoords, setSelectedCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [addressText, setAddressText] = useState("");
  const [geocoding, setGeocoding] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({});
        const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
        const newRegion = { ...coords, latitudeDelta: 0.05, longitudeDelta: 0.05 };
        setRegion(newRegion);
        setSelectedCoords(coords);
        // ✅ Animate map to user's actual location
        mapRef.current?.animateToRegion(newRegion, 600);
        reverseGeocode(coords);
      }
    })();
  }, []);

  const reverseGeocode = async (coords: { latitude: number; longitude: number }) => {
    setGeocoding(true);
    try {
      const results = await Location.reverseGeocodeAsync(coords);
      if (results.length > 0) {
        const r = results[0];
        // ✅ Fixed: avoid street/name duplicates, build a clean address
        const parts = [
          r.name !== r.street ? r.name : null, // only include name if different from street
          r.street,
          r.district,
          r.city,
          r.region,
        ].filter(Boolean);
        setAddressText([...new Set(parts)].join(", ")); // deduplicate
      } else {
        setAddressText("Address not found — try moving the pin");
      }
    } catch {
      setAddressText("Could not fetch address. Check your connection.");
    } finally {
      setGeocoding(false);
    }
  };

  const handleMapPress = async (e: MapPressEvent) => {
    const coords = e.nativeEvent.coordinate;
    setSelectedCoords(coords);
    // ✅ Animate map to center on tapped location
    mapRef.current?.animateToRegion(
      { ...coords, latitudeDelta: region.latitudeDelta, longitudeDelta: region.longitudeDelta },
      300
    );
    await reverseGeocode(coords);
  };

  const handleDragEnd = async (coords: { latitude: number; longitude: number }) => {
    setSelectedCoords(coords);
    // ✅ Re-center map after drag
    mapRef.current?.animateToRegion(
      { ...coords, latitudeDelta: region.latitudeDelta, longitudeDelta: region.longitudeDelta },
      300
    );
    await reverseGeocode(coords);
  };

  const handleConfirm = () => {
    if (!selectedCoords || geocoding) return;
    router.navigate({
      pathname: returnTo || "/checkout",
      params: {
        pickedAddress: addressText,
        pickedLat: selectedCoords.latitude,
        pickedLng: selectedCoords.longitude,
      },
    });
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={region}
        // ✅ Removed onRegionChangeComplete — it was fighting selectedCoords
        onPress={handleMapPress}
      >
        {selectedCoords && (
          <Marker
            coordinate={selectedCoords}
            title="Delivery Address"
            description={addressText}
            draggable
            onDragEnd={(e) => handleDragEnd(e.nativeEvent.coordinate)}
          />
        )}
      </MapView>

      <View style={styles.bottomCard}>
        <View style={styles.addressRow}>
          <Ionicons name="location" size={20} color={COLORS.primary} />
          {geocoding ? (
            <ActivityIndicator size="small" color={COLORS.primary} style={{ marginLeft: 8 }} />
          ) : (
            <Text style={styles.addressText} numberOfLines={2}>
              {addressText || "Tap on the map to set your delivery location"}
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.confirmButton, (!selectedCoords || geocoding) && styles.disabled]}
          onPress={handleConfirm}
          disabled={!selectedCoords || geocoding}
        >
          <Text style={styles.confirmText}>Confirm Location</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  bottomCard: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  addressText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 22,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  disabled: { opacity: 0.5 },
  confirmText: { color: "#fff", fontSize: 17, fontWeight: "bold" },
});