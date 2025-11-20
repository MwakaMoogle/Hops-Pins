// hooks/useLocation.ts
import { AppError } from '@/lib/errorHandler';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

export interface UserLocation {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export const useLocation = () => {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AppError | null>(null);

  const requestPermissions = async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setError(new AppError(
          'Location permission denied',
          'PERMISSION_DENIED',
          'Please enable location services to find pubs near you.'
        ));
        return false;
      }
      return true;
    } catch (err: any) {
      setError(new AppError(
        err.message,
        'PERMISSION_ERROR',
        'Failed to request location permissions.'
      ));
      return false;
    }
  };

  const getCurrentLocation = async (): Promise<UserLocation | null> => {
    try {
      setLoading(true);
      setError(null);

      const hasPermission = await requestPermissions();
      if (!hasPermission) return null;

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const userLocation: UserLocation = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };

      setLocation(userLocation);
      return userLocation;
    } catch (err: any) {
      const locationError = new AppError(
        err.message,
        'LOCATION_ERROR',
        'Unable to get your current location. Using default location.'
      );
      setError(locationError);
      
      // Fallback to London coordinates
      const fallbackLocation: UserLocation = {
        latitude: 51.5074,
        longitude: -0.1278,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      
      setLocation(fallbackLocation);
      return fallbackLocation;
    } finally {
      setLoading(false);
    }
  };

  const searchNearby = async (latitude: number, longitude: number): Promise<UserLocation> => {
    const searchLocation: UserLocation = {
      latitude,
      longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    };
    
    setLocation(searchLocation);
    return searchLocation;
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  return {
    location,
    loading,
    error,
    getCurrentLocation,
    searchNearby,
  };
};