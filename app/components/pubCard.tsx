// app/components/pubCard.tsx - UPDATED
import { usePubs } from '@/hooks/usePubs';
import { useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import ErrorDisplay from './ErrorDisplay';
import LoadingSpinner from './LoadingSpinner';
import PubImage from './PubImage';

const PubCard = () => {
  const { pubs, loading, error, loadPubs } = usePubs();
  const router = useRouter();

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
            No pubs found yet.{'\n'}Tap the map to search for pubs!
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className='flex-1 p-4 w-full'>
      {pubs.slice(0, 3).map((pub) => (
        <TouchableOpacity
          key={pub.id}
          onPress={() => router.push(`/pubs/${pub.id}`)}
          className='flex-1 bg-white rounded-xl mb-4 p-4 shadow-sm border border-gray-200'
          style={{ maxHeight: 140 }}
        >
          <View className="flex-row items-center h-full">
            {/* Pub Image using new component */}
            <View className="w-1/3 h-full items-center justify-center">
              <PubImage 
                imageUrl={pub.imageUrl}
                pubName={pub.name}
                size="medium"
              />
            </View>
            
            {/* Pub Details */}
            <View className="w-2/3 pl-4 justify-center h-full">
              <Text className="text-lg font-bold mb-1" numberOfLines={1}>
                {pub.name}
              </Text>
              <Text className="text-sm text-gray-600 mb-2" numberOfLines={2}>
                {pub.location.address}
              </Text>
              
              {/* Rating and Checkins */}
              <View className="flex-row items-center mb-2">
                <View className="flex-row items-center mr-4">
                  <Text className="text-xs text-yellow-500">⭐</Text>
                  <Text className="text-xs text-gray-700 ml-1 font-medium">
                    {pub.averageRating}/5
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Text className="text-xs text-gray-500">👥</Text>
                  <Text className="text-xs text-gray-700 ml-1 font-medium">
                    {pub.totalCheckins}
                  </Text>
                </View>
              </View>
              
              {/* Distance */}
              {pub.distance && (
                <Text className="text-xs text-purple-600 font-medium">
                  {pub.distance} miles away
                </Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default PubCard;