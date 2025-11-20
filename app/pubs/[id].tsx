// app/pubs/[id].tsx
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { usePubs } from '@/hooks/usePubs';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const PubDetails = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { pubs, createCheckin, loading: checkinLoading } = usePubs();
  const { user, loading: authLoading } = useAuth();
  
  const [selectedDrink, setSelectedDrink] = useState('');
  const [rating, setRating] = useState(0);
  const [customDrink, setCustomDrink] = useState('');

  const pub = pubs.find(p => p.id === id);

  const popularDrinks = [
    'Pint of Lager', 'Craft IPA', 'Guinness', 'Pale Ale', 
    'Cider', 'Wine', 'G&T', 'Whiskey', 'Vodka Coke'
  ];

  const handleCheckin = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to check in to pubs.');
      return;
    }

    const finalDrink = selectedDrink === 'Other' ? customDrink : selectedDrink;
    
    if (!finalDrink.trim()) {
      Alert.alert('Select a Drink', 'Please select or enter a drink for your check-in.');
      return;
    }

    if (rating === 0) {
      Alert.alert('Add Rating', 'Please rate this pub from 1 to 5 stars.');
      return;
    }

    try {
      await createCheckin({
        userId: user.uid,
        pubId: pub!.id,
        pubName: pub!.name,
        drink: finalDrink,
        rating: rating,
        note: `Rated ${rating} stars`
      });
      
      Alert.alert('Success!', `Checked in at ${pub!.name} with ${finalDrink} ⭐${rating}`);
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to check in. Please try again.');
    }
  };

  if (authLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <LoadingSpinner message="Loading..." />
      </View>
    );
  }

  if (!pub) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-xl text-gray-600 mb-4">Pub not found</Text>
        <TouchableOpacity 
          onPress={() => router.back()}
          className="bg-purple-600 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <View className="bg-purple-600 p-6">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="absolute top-12 left-4 z-10 bg-white/20 p-2 rounded-full"
        >
          <Text className="text-white text-lg">←</Text>
        </TouchableOpacity>
        <Text className="text-3xl font-bold text-white text-center mt-4">{pub.name}</Text>
        <Text className="text-purple-200 text-center mt-2">{pub.location.address}</Text>
      </View>

      <View className="p-4">
        {/* Stats Cards */}
        <View className="flex-row justify-between mb-6">
          <View className="bg-purple-50 p-4 rounded-lg flex-1 mr-2 items-center">
            <Text className="text-2xl font-bold text-purple-600">{pub.totalCheckins}</Text>
            <Text className="text-gray-600 text-sm">Total Check-ins</Text>
          </View>
          <View className="bg-green-50 p-4 rounded-lg flex-1 ml-2 items-center">
            <Text className="text-2xl font-bold text-green-600">{pub.averageRating}/5</Text>
            <Text className="text-gray-600 text-sm">Average Rating</Text>
          </View>
        </View>

        {/* Check-in Section */}
        <View className="bg-white border border-gray-200 rounded-xl p-5 mb-6 shadow-sm">
          <Text className="text-xl font-bold text-gray-800 mb-4">Check In</Text>
          
          {/* Drink Selection */}
          <Text className="text-sm font-medium text-gray-700 mb-3">What are you drinking?</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            className="mb-4"
          >
            <View className="flex-row">
              {[...popularDrinks, 'Other'].map((drink) => (
                <TouchableOpacity
                  key={drink}
                  onPress={() => {
                    setSelectedDrink(drink);
                    if (drink !== 'Other') setCustomDrink('');
                  }}
                  className={`px-4 py-3 rounded-full mr-2 ${
                    selectedDrink === drink ? 'bg-purple-600' : 'bg-gray-100'
                  }`}
                >
                  <Text className={
                    selectedDrink === drink ? 'text-white font-medium' : 'text-gray-700'
                  }>
                    {drink}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Custom Drink Input */}
          {selectedDrink === 'Other' && (
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Enter your drink:</Text>
              <View className="bg-gray-50 rounded-lg p-3">
                <Text className="text-gray-800">
                  {customDrink || 'Type your drink here...'}
                </Text>
              </View>
            </View>
          )}

          {/* Rating */}
          <Text className="text-sm font-medium text-gray-700 mb-3">Rate this pub:</Text>
          <View className="flex-row justify-center mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                className="mx-1"
              >
                <Text className="text-3xl">
                  {star <= rating ? '⭐' : '☆'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Check-in Button */}
          <TouchableOpacity
            onPress={handleCheckin}
            disabled={checkinLoading || !selectedDrink || rating === 0}
            className={`py-4 rounded-lg items-center ${
              checkinLoading || !selectedDrink || rating === 0 
                ? 'bg-gray-300' 
                : 'bg-purple-600'
            }`}
          >
            <Text className="text-white font-semibold text-lg">
              {checkinLoading ? 'Checking in...' : 'Check In Now'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Pub Information */}
        <View className="bg-gray-50 rounded-xl p-5">
          <Text className="text-lg font-bold text-gray-800 mb-3">Pub Information</Text>
          <View className="space-y-2">
            <View className="flex-row items-center">
              <Text className="text-gray-500 w-24">Address:</Text>
              <Text className="text-gray-800 flex-1">{pub.location.address}</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-gray-500 w-24">Coordinates:</Text>
              <Text className="text-gray-800 flex-1">
                {pub.location.latitude.toFixed(4)}, {pub.location.longitude.toFixed(4)}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-gray-500 w-24">Place ID:</Text>
              <Text className="text-gray-800 flex-1 text-xs">{pub.placeId || 'N/A'}</Text>
            </View>
          </View>
        </View>

        {/* Coming Soon Features */}
        <View className="mt-6 p-4 bg-blue-50 rounded-xl">
          <Text className="text-lg font-bold text-blue-800 mb-2">Coming Soon</Text>
          <Text className="text-blue-600 text-sm">
            • Photos from Google Places{'\n'}
            • Opening hours{'\n'}
            • User reviews and photos{'\n'}
            • Drink menu integration
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default PubDetails;