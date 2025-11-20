// app/components/mapContainer.tsx
import { useLocation } from '@/hooks/useLocation';
import React from 'react';
import { Text, View } from 'react-native';
import ErrorDisplay from './ErrorDisplay';
import LoadingSpinner from './LoadingSpinner';
import RealMap from './RealMap';

const MapContainer: React.FC = () => {
  const { location, loading: locationLoading, error: locationError } = useLocation();

  return (
    <View className='flex-grow w-full min-h-0 p-4' style={{ minHeight: 350 }}>
      <View className='flex-1 bg-gray-100 rounded-lg overflow-hidden'>
        <View className="p-3 bg-white border-b border-gray-200">
          <Text className="text-lg font-bold text-center text-purple-600">
            {locationLoading ? 'Finding your location...' : 'Pubs Near You'}
          </Text>
          {location && !locationLoading && (
            <Text className="text-sm text-gray-600 text-center">
              Move the map or tap to search for pubs
            </Text>
          )}
        </View>
        
        {locationLoading ? (
          <View className="flex-1 justify-center items-center">
            <LoadingSpinner message="Loading map..." />
          </View>
        ) : locationError && !location ? (
          <View className="flex-1 justify-center items-center p-4">
            <ErrorDisplay 
              error={locationError}
              title="Location Required"
            />
            <Text className="text-gray-500 text-center mt-4">
              Showing pubs in London as fallback
            </Text>
          </View>
        ) : (
          <RealMap />
        )}
      </View>
    </View>
  );
};

export default MapContainer;