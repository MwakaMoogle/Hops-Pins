// app/components/PubCardsContainer.tsx - UPDATED LAYOUT
import { usePubs } from '@/hooks/usePubs';
import React from 'react';
import { Text, View } from 'react-native';
import ErrorDisplay from './ErrorDisplay';
import LoadingSpinner from './LoadingSpinner';
import PubCard from './pubCard';

const PubCardsContainer = () => {
  const { pubs, loading, error, loadPubs } = usePubs();

  if (loading && pubs.length === 0) {
    return (
      <View className='p-4'>
        <LoadingSpinner message="Loading pubs..." />
      </View>
    );
  }

  if (error && pubs.length === 0) {
    return (
      <View className='p-4'>
        <ErrorDisplay error={error} onRetry={loadPubs} />
      </View>
    );
  }

  if (pubs.length === 0) {
    return (
      <View className='p-4'>
        <View className='bg-green-50 rounded-lg justify-center items-center p-6 border border-green-200'>
          <Text className="text-center text-gray-600 text-base">
            No pubs found yet.{'\n'}Tap the map to search for pubs!
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="p-4">
      <Text className="text-xl font-bold mb-4 text-gray-800">
        Nearby Pubs ({pubs.length})
      </Text>
      {pubs.slice(0, 5).map((pub) => (
        <PubCard key={pub.id} pub={pub} />
      ))}
    </View>
  );
};

export default PubCardsContainer;