import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';

const PubDetails = () => {
   const { id } = useLocalSearchParams();

  return (
    <View className="flex-1 items-center justify-center">
      <Text className='text-5xl text-purple-400 font-bold pt-16'>{id}</Text>
      <View className="bg-green-400 w-full aspect-square rounded-full items-center justify-center mt-8 max-h-60">
        <View className="w-5/6 h-5/6 rounded-full items-center justify-center">
          <Text className="text-6xl">📷</Text>
          <Text className="text-sm text-gray-500 mt-2">No photo available</Text>
        </View>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mt-8 flex-grow-0"
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        {[...Array(8)].map((_, i) => (
          <View
            key={i}
            className="w-40 h-40 bg-white rounded-lg shadow-md mr-4 items-center justify-center"
          >
            <Text className="text-lg font-semibold">Box {i + 1}</Text>
            <Text className="text-sm text-gray-500">Horizontal item</Text>
          </View>
        ))}
      </ScrollView>

      <View className='flex-grow mt-8 p-4 bg-white rounded-lg shadow-md'>
        <Text className='text-xl font-semibold mb-2'>Reviews</Text>
        <View className="border border-black rounded-lg p-3 mb-4">
          <View className="space-y-3">
            <View>
              <Text className="font-semibold">User123</Text>
              <Text className="text-gray-600">Great atmosphere and friendly staff!</Text>
            </View>
            <View>
              <Text className="font-semibold">BeerLover</Text>
              <Text className="text-gray-600">Wide selection of craft beers.</Text>
            </View>
            <View>
              <Text className="font-semibold">NightOwl</Text>
              <Text className="text-gray-600">Perfect spot for late-night hangouts.</Text>
            </View>
          </View>
        </View>
        <Text className='text-xl font-semibold mb-2'>Pub Information</Text>
        <Text className='text-gray-600 mb-1'>Opening Times: 12 PM - 12 AM</Text>
        <Text className='text-gray-600 mb-1'>Contact: (123) 456-7890</Text>
        <Text className='text-gray-600'>Adress: 123 Main St, Hometown</Text>
      </View>
    </View>
  )
}

export default PubDetails