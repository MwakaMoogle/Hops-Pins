// app/(tabs)/history.tsx
import { useAuthContext } from '@/contexts/AuthContext';
import { useGuestContext } from '@/contexts/GuestContext';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// Mock data structure - you'll replace this with real data from your checkins
interface Checkin {
  id: string;
  pubId: string;
  pubName: string;
  drink: string;
  rating: number;
  note?: string;
  createdAt: Date;
  location: string;
}

const History = () => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthContext();
  const { isGuest } = useGuestContext();
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'recent' | 'favorites'>('all');

  // Mock data - replace with actual API call to getUserCheckins
  const loadCheckins = async () => {
    setLoading(true);
    
    try {
      // TODO: Replace with actual API call
      // const userCheckins = await getUserCheckins(user.uid);
      
      // Mock data for demonstration
      const mockCheckins: Checkin[] = [
        {
          id: '1',
          pubId: 'pub1',
          pubName: 'The Red Lion',
          drink: 'Craft IPA',
          rating: 5,
          note: 'Great atmosphere!',
          createdAt: new Date('2024-01-15'),
          location: 'London'
        },
        {
          id: '2',
          pubId: 'pub2',
          pubName: 'The Crown',
          drink: 'Guinness',
          rating: 4,
          note: 'Perfect pour',
          createdAt: new Date('2024-01-10'),
          location: 'London'
        },
        {
          id: '3',
          pubId: 'pub3',
          pubName: 'The Rose & Crown',
          drink: 'Pale Ale',
          rating: 3,
          createdAt: new Date('2024-01-05'),
          location: 'London'
        }
      ];
      
      setCheckins(mockCheckins);
    } catch (error) {
      console.error('Error loading checkins:', error);
      Alert.alert('Error', 'Failed to load your check-in history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated || isGuest) {
      loadCheckins();
    }
  }, [isAuthenticated, isGuest]);

  const handlePubPress = (pubId: string) => {
    router.push(`/pubs/${pubId}`);
  };

  const handleSignIn = () => {
    router.push('/(auth)/login');
  };

  const filteredCheckins = checkins.filter(checkin => {
    if (filter === 'recent') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return checkin.createdAt > oneWeekAgo;
    }
    // Add more filters as needed
    return true;
  });

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!isAuthenticated && !isGuest) {
    return (
      <View className="flex-1 bg-white items-center justify-center p-6">
        <Text className="text-3xl font-bold text-purple-600 mb-4">Your History</Text>
        <Text className="text-lg text-gray-600 text-center mb-8">
          Sign in to view your check-in history and track your pub visits
        </Text>
        
        <TouchableOpacity
          onPress={handleSignIn}
          className="bg-purple-600 py-4 px-8 rounded-lg"
        >
          <Text className="text-white font-semibold text-lg">Sign In</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => router.push('/(auth)/signup')}
          className="bg-green-600 py-4 px-8 rounded-lg mt-4"
        >
          <Text className="text-white font-semibold text-lg">Create Account</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-purple-600 p-6">
        <Text className="text-3xl font-bold text-white text-center">Your History</Text>
        <Text className="text-purple-200 text-center mt-2">
          {isGuest ? 'Guest session' : `Welcome back, ${user?.displayName || 'friend'}!`}
        </Text>
      </View>

      {/* Filter Tabs */}
      <View className="flex-row border-b border-gray-200">
        {['all', 'recent', 'favorites'].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setFilter(tab as any)}
            className={`flex-1 py-3 items-center ${
              filter === tab ? 'border-b-2 border-purple-600' : ''
            }`}
          >
            <Text className={`font-medium ${
              filter === tab ? 'text-purple-600' : 'text-gray-500'
            }`}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Checkins List */}
      <ScrollView className="flex-1 p-4">
        {loading ? (
          <View className="items-center py-8">
            <ActivityIndicator size="large" color="#8B5CF6" />
            <Text className="text-gray-600 mt-2">Loading your history...</Text>
          </View>
        ) : filteredCheckins.length === 0 ? (
          <View className="items-center py-8">
            <Text className="text-gray-500 text-lg mb-2">No check-ins yet</Text>
            <Text className="text-gray-400 text-center">
              {filter === 'recent' 
                ? 'No recent check-ins. Visit some pubs!'
                : 'Start exploring pubs and check in to see your history here.'
              }
            </Text>
            
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/search')}
              className="bg-purple-600 py-3 px-6 rounded-lg mt-4"
            >
              <Text className="text-white font-semibold">Find Pubs</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <Text className="text-lg font-semibold text-gray-800 mb-4">
              {filteredCheckins.length} Check-in{filteredCheckins.length !== 1 ? 's' : ''}
            </Text>
            
            {filteredCheckins.map((checkin) => (
              <TouchableOpacity
                key={checkin.id}
                onPress={() => handlePubPress(checkin.pubId)}
                className="bg-white border border-gray-200 rounded-xl p-4 mb-3 shadow-sm"
              >
                <View className="flex-row justify-between items-start mb-2">
                  <Text className="text-xl font-bold text-gray-900 flex-1">
                    {checkin.pubName}
                  </Text>
                  <View className="flex-row items-center">
                    <Text className="text-yellow-500 mr-1">⭐</Text>
                    <Text className="text-gray-700 font-medium">
                      {checkin.rating}/5
                    </Text>
                  </View>
                </View>
                
                <View className="mb-2">
                  <Text className="text-gray-600">
                    <Text className="font-medium">Drink:</Text> {checkin.drink}
                  </Text>
                  {checkin.note && (
                    <Text className="text-gray-600 mt-1">
                      <Text className="font-medium">Note:</Text> {checkin.note}
                    </Text>
                  )}
                </View>
                
                <View className="flex-row justify-between items-center">
                  <Text className="text-gray-500 text-sm">
                    {formatDate(checkin.createdAt)}
                  </Text>
                  <Text className="text-purple-600 text-sm font-medium">
                    {checkin.location}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Stats Section */}
        {!loading && checkins.length > 0 && (
          <View className="mt-8 bg-purple-50 rounded-xl p-4 border border-purple-200">
            <Text className="text-lg font-semibold text-purple-800 mb-3">
              Your Pub Stats
            </Text>
            
            <View className="flex-row justify-between">
              <View className="items-center">
                <Text className="text-2xl font-bold text-purple-600">{checkins.length}</Text>
                <Text className="text-purple-700 text-sm">Total Check-ins</Text>
              </View>
              
              <View className="items-center">
                <Text className="text-2xl font-bold text-purple-600">
                  {Math.max(...checkins.map(c => c.rating))}
                </Text>
                <Text className="text-purple-700 text-sm">Highest Rating</Text>
              </View>
              
              <View className="items-center">
                <Text className="text-2xl font-bold text-purple-600">
                  {new Set(checkins.map(c => c.pubId)).size}
                </Text>
                <Text className="text-purple-700 text-sm">Unique Pubs</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default History;