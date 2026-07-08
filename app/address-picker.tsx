import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, { MapPressEvent, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useApp } from "../hooks/useApp";

export default function AddressPickerScreen() {
  const params = useLocalSearchParams<Record<string, string>>();
  const { colors, t } = useApp();
  const returnTo = params.returnTo;
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
        const parts = [
          r.name !== r.street ? r.name : null,
          r.street,
          r.district,
          r.city,
          r.region,
        ].filter(Boolean);
        setAddressText([...new Set(parts)].join(", "));
      } else {
        setAddressText(t("common.addressNotFound"));
      }
    } catch {
      setAddressText(t("common.couldNotFetchAddress"));
    } finally {
      setGeocoding(false);
    }
  };

  const handleMapPress = async (e: MapPressEvent) => {
    const coords = e.nativeEvent.coordinate;
    setSelectedCoords(coords);
    mapRef.current?.animateToRegion(
      { ...coords, latitudeDelta: region.latitudeDelta, longitudeDelta: region.longitudeDelta },
      300
    );
    await reverseGeocode(coords);
  };

  const handleDragEnd = async (coords: { latitude: number; longitude: number }) => {
    setSelectedCoords(coords);
    mapRef.current?.animateToRegion(
      { ...coords, latitudeDelta: region.latitudeDelta, longitudeDelta: region.longitudeDelta },
      300
    );
    await reverseGeocode(coords);
  };

  const handleConfirm = () => {
    if (!selectedCoords || geocoding) return;
    const passThrough: Record<string, string> = {};
    for (const key of Object.keys(params)) {
      if (key.startsWith("return")) passThrough[key] = params[key];
    }
    router.navigate({
      pathname: returnTo || "/checkout",
      params: {
        pickedAddress: addressText,
        pickedLat: selectedCoords.latitude,
        pickedLng: selectedCoords.longitude,
        ...passThrough,
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

      <View style={[styles.bottomCard, { backgroundColor: colors.card }]}>
        <View style={styles.addressRow}>
          <Ionicons name="location" size={20} color={colors.primary} />
          {geocoding ? (
            <ActivityIndicator size="small" color={colors.primary} style={{ marginLeft: 8 }} />
          ) : (
            <Text style={[styles.addressText, { color: colors.text }]} numberOfLines={2}>
              {addressText || t("common.tapMapToSet")}
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.confirmButton, { backgroundColor: colors.primary }, (!selectedCoords || geocoding) && styles.disabled]}
          onPress={handleConfirm}
          disabled={!selectedCoords || geocoding}
          accessibilityLabel={t("common.confirmLocation")}
          accessibilityRole="button"
          accessibilityState={{ disabled: !selectedCoords || geocoding }}
        >
          <Text style={styles.confirmText}>{t("common.confirmLocation")}</Text>
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
    lineHeight: 22,
  },
  confirmButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  disabled: { opacity: 0.5 },
  confirmText: { color: "#fff", fontSize: 17, fontWeight: "bold" },
});