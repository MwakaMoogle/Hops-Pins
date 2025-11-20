// app/components/mapContainer.tsx
import { usePubs } from '@/hooks/usePubs';
import React from 'react';
import { Alert, Image, Text, TouchableOpacity, View } from 'react-native';

const MapContainer: React.FC = () => {
  const { searchNearbyPubs, loading } = usePubs();

  const onPressedButton = async () => {
    // For now, use London coordinates - you'll replace this with actual location later
    await searchNearbyPubs(51.5074, -0.1278);
    Alert.alert('Searching for nearby pubs...');
  };

  return (
   <View className='flex-grow w-full min-h-0 p-4' style={{ minHeight: 350 }}>
      <View className='flex-1 bg-blue-200 rounded-lg justify-center items-center'>
        <TouchableOpacity onPress={onPressedButton} disabled={loading}>
          <Image
            source={require('../../assets/images/temp/tempMap.png')}
            style={{ width: 300, height: 300 }}
          />
        </TouchableOpacity>
        <Text className='text-lg font-bold mt-4'>
          {loading ? 'Searching for pubs...' : 'Tap map to find pubs'}
        </Text>
      </View>
   </View>
  );
};

export default MapContainer;