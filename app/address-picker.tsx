import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
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

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({});
        const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
        setRegion({ ...coords, latitudeDelta: 0.05, longitudeDelta: 0.05 });
        setSelectedCoords(coords);
        reverseGeocode(coords);
      }
    })();
  }, []);

  const reverseGeocode = async (coords: { latitude: number; longitude: number }) => {
    const results = await Location.reverseGeocodeAsync(coords);
    if (results.length > 0) {
      const r = results[0];
      setAddressText([r.street, r.name, r.district, r.city, r.region].filter(Boolean).join(", "));
    }
  };

  const handleMapPress = async (e: MapPressEvent) => {
    const coords = e.nativeEvent.coordinate;
    setSelectedCoords(coords);
    await reverseGeocode(coords);
  };

  const handleConfirm = () => {
    if (!selectedCoords) return;
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
        onRegionChangeComplete={setRegion}
        onPress={handleMapPress}
      >
        {selectedCoords && (
          <Marker
            coordinate={selectedCoords}
            title="Delivery Address"
            description={addressText}
            draggable
            onDragEnd={async (e) => {
              const coords = e.nativeEvent.coordinate;
              setSelectedCoords(coords);
              await reverseGeocode(coords);
            }}
          />
        )}
      </MapView>

      <View style={styles.bottomCard}>
        <View style={styles.addressRow}>
          <Ionicons name="location" size={20} color={COLORS.primary} />
          <Text style={styles.addressText} numberOfLines={2}>
            {addressText || "Tap on the map to set your delivery location"}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.confirmButton, !selectedCoords && styles.disabled]}
          onPress={handleConfirm}
          disabled={!selectedCoords}
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
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 16,
  },
  addressText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 22,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  confirmText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },
  disabled: { opacity: 0.5 },
});
