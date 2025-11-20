// app/components/RealMap.tsx
import { useLocation } from '@/hooks/useLocation';
import { usePubs } from '@/hooks/usePubs';
import { useRouter } from 'expo-router';
import React, { useRef } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import ErrorDisplay from './ErrorDisplay';
import LoadingSpinner from './LoadingSpinner';

const { width, height } = Dimensions.get('window');

const RealMap: React.FC = () => {
  const { markers, loading, error, searchNearbyPubs } = usePubs();
  const { location, loading: locationLoading, error: locationError } = useLocation();
  const searchTimeoutRef = useRef<number | null>(null);
  const router = useRouter();
  

  const handleRegionChangeComplete = async (region: Region) => {
    if (!loading) {
      // Debounce searches to prevent too many API calls
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          await searchNearbyPubs(region.latitude, region.longitude);
        } catch (err) {
          // Error handled by hook
        }
      }, 1000) as unknown as number; // Wait 1 second after user stops moving map
    }
  };

  const handleMapPress = async () => {
    if (location && !loading) {
      try {
        await searchNearbyPubs(location.latitude, location.longitude);
      } catch (err) {
        // Error handled by hook
      }
    }
  };

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  if (locationLoading) {
    return (
      <View style={styles.container}>
        <LoadingSpinner message="Getting your location..." />
      </View>
    );
  }

  if (locationError && !location) {
    return (
      <View style={styles.container}>
        <ErrorDisplay 
          error={locationError} 
          onRetry={() => {/* You can add retry logic here */}}
          title="Location Error"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={location || undefined}
        onRegionChangeComplete={handleRegionChangeComplete}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        toolbarEnabled={true}
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={marker.coordinate}
            title={marker.title}
            description={marker.description}
            pinColor={marker.pinColor}
            onPress={() => router.push(`/pubs/${marker.id}`)}
          />
        ))}
      </MapView>
      
      {/* Fix 4: Search Status Info Box */}
      <View style={styles.infoBox}>
        <Text className="text-sm font-medium text-gray-700">
          {markers.length} pubs found in this area
        </Text>
        {loading && (
          <Text className="text-xs text-gray-500 mt-1">
            Searching for more pubs...
          </Text>
        )}
      </View>
      
      {loading && (
        <View style={styles.loadingOverlay}>
          <LoadingSpinner message="Searching for pubs..." />
        </View>
      )}
      
      {(error || locationError) && (
        <View style={styles.errorOverlay}>
          <ErrorDisplay 
            error={error || locationError} 
            onRetry={() => location && searchNearbyPubs(location.latitude, location.longitude)}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 350,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  // Fix 4: Info Box Styles
  infoBox: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 80, // Moved down to avoid overlapping with infoBox
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 10,
  },
  errorOverlay: {
    position: 'absolute',
    top: 80, // Moved down to avoid overlapping with infoBox
    left: 10,
    right: 10,
  },
});

export default RealMap;