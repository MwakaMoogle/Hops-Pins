// app/test-firestore.tsx
import { usePubs } from '@/hooks/usePubs';
import React from 'react';
import { Button, Text, View } from 'react-native';

export default function TestFirestore() {
  const { pubs, searchNearbyPubs, loading, error } = usePubs();

  return (
    <View className="p-4">
      <Text className="text-xl font-bold mb-4">Firestore Test</Text>
      
      <Button 
        title={loading ? "Searching..." : "Search London Pubs"} 
        onPress={() => searchNearbyPubs(51.5074, -0.1278)} 
        disabled={loading}
      />
      
      <Text className="mt-4">Status: {loading ? 'Loading...' : 'Ready'}</Text>
      <Text>Pubs found: {pubs.length}</Text>
      
      {error && (
        <Text className="text-red-500 mt-2">Error: {error}</Text>
      )}
      
      {pubs.map(pub => (
        <View key={pub.id} className="bg-gray-100 p-2 mt-2 rounded">
          <Text className="font-bold">{pub.name}</Text>
          <Text className="text-sm">{pub.location.address}</Text>
          <Text className="text-xs text-gray-500">
            Checkins: {pub.totalCheckins} • Rating: {pub.averageRating}/5
          </Text>
        </View>
      ))}
    </View>
  );
}