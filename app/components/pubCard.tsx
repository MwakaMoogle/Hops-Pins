// app/components/pubCard.tsx - UPDATED TO MATCH SEARCH STYLE WITH IMAGE
import { Pub } from '@/lib/api/pubs';
import { useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import PubImage from './PubImage';

interface PubCardProps {
  pub: Pub;
}

const PubCard = ({ pub }: PubCardProps) => {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.push(`/pubs/${pub.id}`)}
      className='bg-white rounded-lg mb-3 p-4 shadow-sm border border-gray-200'
    >
      <View className="flex-row items-start">
        {/* Pub Image */}
        <View className="mr-3">
          <PubImage 
            imageUrl={pub.imageUrl}
            pubName={pub.name}
            size="small"
          />
        </View>
        
        {/* Pub Details */}
        <View className="flex-1">
          <Text className="text-lg font-semibold mb-1" numberOfLines={1}>
            {pub.name}
          </Text>
          
          <Text className="text-sm text-gray-600 mb-2" numberOfLines={2}>
            {pub.location.address}
          </Text>
          
          {/* Rating and Distance Row */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              {/* Rating */}
              <View className="flex-row items-center mr-4">
                <Text className="text-xs text-yellow-500">⭐</Text>
                <Text className="text-xs text-gray-700 ml-1 font-medium">
                  {pub.averageRating}/5
                </Text>
              </View>
              
              {/* Checkins */}
              <View className="flex-row items-center">
                <Text className="text-xs text-gray-500">👥</Text>
                <Text className="text-xs text-gray-700 ml-1 font-medium">
                  {pub.totalCheckins}
                </Text>
              </View>
            </View>
            
            {/* Distance */}
            {pub.distance && (
              <Text className="text-xs text-purple-600 font-medium bg-purple-50 px-2 py-1 rounded">
                {pub.distance} miles
              </Text>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default PubCard;