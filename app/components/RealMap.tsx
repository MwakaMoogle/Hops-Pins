// app/components/RealMap.tsx
import { useLocation } from '@/hooks/useLocation';
import { usePubs } from '@/hooks/usePubs';
import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import ErrorDisplay from './ErrorDisplay';
import LoadingSpinner from './LoadingSpinner';

const { width, height } = Dimensions.get('window');

const RealMap: React.FC = () => {
  const { markers, loading, error, searchNearbyPubs } = usePubs();
  const { location, loading: locationLoading, error: locationError } = useLocation();

  const handleRegionChangeComplete = async (region: Region) => {
    if (!loading) {
      try {
        await searchNearbyPubs(region.latitude, region.longitude);
      } catch (err) {
        // Error handled by hook
      }
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
        onPress={handleMapPress}
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
          />
        ))}
      </MapView>
      
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
  loadingOverlay: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 10,
  },
  errorOverlay: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
  },
});

export default RealMap;