import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
} from "react-native";

import MapView, {
  Marker,
  MapPressEvent,
} from "react-native-maps";

import ErrorMessage from "../components/ErrorMessage";
import { getUserLocation } from "../utils/location";

export default function MapScreen() {
  const [region, setRegion] = useState<any>(null);

  const [selectedLocation, setSelectedLocation] =
    useState<any>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    loadLocation();
  }, []);

  const loadLocation = async () => {
    try {
      setLoading(true);

      const location = await getUserLocation();

      const mapRegion = {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      setRegion(mapRegion);
      setSelectedLocation(mapRegion);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMapPress = (
    event: MapPressEvent
  ) => {
    const coordinate =
      event.nativeEvent.coordinate;

    setSelectedLocation(coordinate);
  };

  // Loading State
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text>Loading map...</Text>
      </View>
    );
  }

  if (error) {
    return <ErrorMessage title="Location Error" message={error} onRetry={loadLocation} />;
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={region}
        onPress={handleMapPress}
        showsUserLocation
      >
        {selectedLocation && (
          <Marker
            coordinate={selectedLocation}
            title="Delivery Location"
          />
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  map: {
    flex: 1,
  },

  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  retryButton: {
    marginTop: 20,
    backgroundColor: "#ff6600",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },

  retryText: {
    color: "white",
    fontWeight: "bold",
  },
});