// app/components/pubCard.tsx
import { usePubs } from '@/hooks/usePubs';
import React from 'react';
import { Text, View } from 'react-native';
import ErrorDisplay from './ErrorDisplay';
import LoadingSpinner from './LoadingSpinner';

const PubCard = () => {
  const { pubs, loading, error, loadPubs } = usePubs();

  if (loading && pubs.length === 0) {
    return (
      <View className='flex-1 p-4 w-full min-h-50' style={{ maxHeight: 160 }}>
        <LoadingSpinner message="Loading pubs..." />
      </View>
    );
  }

  if (error && pubs.length === 0) {
    return (
      <View className='flex-1 p-4 w-full min-h-50' style={{ maxHeight: 160 }}>
        <ErrorDisplay error={error} onRetry={loadPubs} />
      </View>
    );
  }

  if (pubs.length === 0) {
    return (
      <View className='flex-1 p-4 w-full min-h-50' style={{ maxHeight: 160 }}>
        <View className='flex-1 bg-green-200 rounded-lg justify-center items-center p-4'>
          <Text className="text-center text-gray-600">
            No pubs found yet.{'\n'}Tap the map to search for pubs near London!
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className='flex-1 p-4 w-full'>
      {pubs.slice(0, 3).map((pub) => (
        <View 
          key={pub.id} 
          className='flex-1 bg-green-200 rounded-lg justify-center mb-4 p-4' 
          style={{ maxHeight: 160 }}
        >
          <View className="flex-row items-center">
            <View className="w-1/3 items-center">
              <View className="bg-green-400 w-16 h-16 rounded-full items-center justify-center">
                <Text className="text-white font-bold text-2xl">🍺</Text>
              </View>
            </View>
            <View className="w-2/3 pl-3 justify-center">
              <Text className="text-lg font-bold mb-1" numberOfLines={1}>
                {pub.name}
              </Text>
              <Text className="text-sm text-gray-600 mb-1" numberOfLines={2}>
                {pub.location.address}
              </Text>
              <Text className="text-xs text-gray-500">
                Checkins: {pub.totalCheckins} • Rating: {pub.averageRating}/5
              </Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

export default PubCard;