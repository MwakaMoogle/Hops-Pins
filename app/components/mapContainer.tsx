// app/components/mapContainer.tsx
import { usePubs } from '@/hooks/usePubs';
import { AppError } from '@/lib/errorHandler';
import React from 'react';
import { Alert, Image, Text, TouchableOpacity, View } from 'react-native';
import ErrorDisplay from './ErrorDisplay';
import LoadingSpinner from './LoadingSpinner';

const MapContainer: React.FC = () => {
  const { searchNearbyPubs, loading, error } = usePubs();

  const handleSearch = async () => {
    try {
      await searchNearbyPubs(51.5074, -0.1278);
    } catch (err) {
      // Error is already handled in the hook, but we can show an alert too
      if (err instanceof AppError) {
        Alert.alert('Search Failed', err.userFriendly);
      }
    }
  };

  return (
    <View className='flex-grow w-full min-h-0 p-4' style={{ minHeight: 350 }}>
      <View className='flex-1 bg-blue-200 rounded-lg justify-center items-center p-4'>
        <TouchableOpacity 
          onPress={handleSearch} 
          disabled={loading}
          className="items-center"
        >
          <Image
            source={require('@/assets/images/temp/tempMap.png')}
            style={{ width: 300, height: 300 }}
            className="rounded-lg"
          />
        </TouchableOpacity>
        
        <Text className='text-lg font-bold mt-4 text-center'>
          {loading ? 'Searching for nearby pubs...' : 'Tap map to find pubs near London'}
        </Text>
        
        {loading && <LoadingSpinner message="Searching for pubs..." />}
        
        <ErrorDisplay 
          error={error} 
          onRetry={handleSearch}
          title="Search Failed"
        />
      </View>
    </View>
  );
};

export default MapContainer;