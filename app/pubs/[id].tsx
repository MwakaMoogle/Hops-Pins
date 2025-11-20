// app/pubs/[id].tsx
import CheckinHistory from '@/components/CheckinHistory';
import DrinkSearch from '@/components/DrinkSearch';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { usePubs } from '@/hooks/usePubs';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const PubDetails = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { pubs, createCheckin, loading: checkinLoading, pubCheckins, loadPubCheckins } = usePubs();
  const { user, loading: authLoading } = useAuth();
  
  const [selectedDrink, setSelectedDrink] = useState('');
  const [rating, setRating] = useState(0);
  const [note, setNote] = useState('');

  const pub = pubs.find(p => p.id === id as string);

  useEffect(() => {
    if (pub) {
      loadPubCheckins(pub.id);
    }
  }, [pub]);

  const handleCheckin = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to check in to pubs.');
      return;
    }

    if (!selectedDrink) {
      Alert.alert('Select a Drink', 'Please select a drink for your check-in.');
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
        drink: selectedDrink,
        rating: rating,
        note: note || `Rated ${rating} stars`
      });
      
      // Reload checkins after successful checkin
      loadPubCheckins(pub!.id);
      
      Alert.alert('Success!', `Checked in at ${pub!.name} with ${selectedDrink} ⭐${rating}`);
      // Reset form
      setSelectedDrink('');
      setRating(0);
      setNote('');
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

  const currentPubCheckins = pubCheckins[pub.id] || [];

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
          
          {/* Enhanced Drink Search */}
          <DrinkSearch 
            onDrinkSelect={setSelectedDrink}
            selectedDrink={selectedDrink}
          />

          {/* Current Selection Display */}
          {selectedDrink && (
            <View className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <Text className="text-green-800 font-medium">
                Selected: {selectedDrink}
              </Text>
            </View>
          )}

          {/* Rating */}
          <Text className="text-sm font-medium text-gray-700 mb-3">Rate this pub:</Text>
          <View className="flex-row justify-center mb-4">
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

          {/* Optional Note */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Add a note (optional):</Text>
            <View className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <Text className="text-gray-800">
                {note || 'Great atmosphere, friendly staff...'}
              </Text>
            </View>
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
              {checkinLoading ? 'Checking in...' : `Check In with ${selectedDrink}`}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Check-in History */}
        <CheckinHistory 
          checkins={currentPubCheckins}
          pubId={pub.id}
        />

        {/* Pub Information */}
        <View className="bg-gray-50 rounded-xl p-5 mt-6">
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
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default PubDetails;