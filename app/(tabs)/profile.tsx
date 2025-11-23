// app/(tabs)/profile.tsx
import { useAuthContext } from '@/contexts/AuthContext';
import { useGuestContext } from '@/contexts/GuestContext';
import { RequestBudget } from '@/lib/api/beer';
import { CacheManager } from '@/lib/cache';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const Profile = () => {
  const { user, userProfile, logout, isAuthenticated } = useAuthContext();
  const { isGuest, setGuest } = useGuestContext();
  const router = useRouter();
  const [requestCount, setRequestCount] = useState(0);
  const [cacheStats, setCacheStats] = useState({ totalItems: 0 });

  useEffect(() => {
    loadBudgetInfo();
    loadCacheStats();
  }, []);

  const loadBudgetInfo = async () => {
    const count = await RequestBudget.getCount();
    setRequestCount(count);
  };

  const loadCacheStats = async () => {
    const stats = await CacheManager.getStats();
    setCacheStats(stats);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setGuest(false);
      Alert.alert('Logged Out', 'You have been successfully logged out.');
    } catch (error) {
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };

  const handleSignIn = () => {
    router.push('/(auth)/login');
  };

  const handleSignUp = () => {
    router.push('/(auth)/signup');
  };

  const clearCache = async () => {
    try {
      await CacheManager.clear();
      await loadCacheStats();
      Alert.alert('Success', 'Cache cleared successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to clear cache. Please try again.');
    }
  };

  const getCacheStats = async () => {
    await loadCacheStats();
    Alert.alert('Cache Info', `Total cached items: ${cacheStats.totalItems}`);
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 min-h-screen p-6">
        {/* Header */}
        <View className="items-center mb-8 pt-8">
          <Text className="text-4xl font-bold text-purple-600 mb-2">Hops & Pins</Text>
          <Text className="text-lg text-gray-600">Your Profile</Text>
        </View>

        {/* User Info Card */}
        <View className="bg-purple-50 rounded-xl p-6 mb-6 border border-purple-200">
          {isAuthenticated && user ? (
            <>
              <Text className="text-2xl font-bold text-purple-800 mb-2">
                {user.displayName || userProfile?.displayName || 'User'}
              </Text>
              <Text className="text-purple-600 mb-1">{user.email}</Text>
              <Text className="text-purple-500 text-sm">
                Member since {userProfile?.createdAt?.toDate?.()?.toLocaleDateString() || 'recently'}
              </Text>
              {userProfile && (
                <View className="mt-4 flex-row justify-between">
                  <View className="items-center">
                    <Text className="text-lg font-bold text-purple-700">{userProfile.totalCheckins || 0}</Text>
                    <Text className="text-purple-500 text-sm">Check-ins</Text>
                  </View>
                  {userProfile.favoriteBeer && (
                    <View className="items-center">
                      <Text className="text-lg font-bold text-purple-700">⭐</Text>
                      <Text className="text-purple-500 text-sm">Favorite</Text>
                    </View>
                  )}
                </View>
              )}
            </>
          ) : isGuest ? (
            <>
              <Text className="text-2xl font-bold text-purple-800 mb-2">Guest User</Text>
              <Text className="text-purple-600">You're browsing as a guest</Text>
              <Text className="text-purple-500 text-sm mt-2">
                Sign up to save your check-ins and access all features!
              </Text>
            </>
          ) : (
            <>
              <Text className="text-2xl font-bold text-purple-800 mb-2">Welcome!</Text>
              <Text className="text-purple-600">Please sign in to access your profile</Text>
            </>
          )}
        </View>

        {/* API Usage Info */}
        <View className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-200">
          <Text className="text-lg font-bold text-blue-800 mb-2">API Usage</Text>
          <Text className="text-blue-600">
            Requests this month: {requestCount}/450
          </Text>
          <Text className="text-blue-500 text-sm mt-1">
            {requestCount >= 400 
              ? '⚠️ Approaching limit' 
              : requestCount >= 300
              ? 'ℹ️ Moderate usage'
              : '✅ Within budget'
            }
          </Text>
          <Text className="text-blue-500 text-sm mt-2">
            Cached items: {cacheStats.totalItems}
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="space-y-4">
          {isAuthenticated ? (
            <TouchableOpacity
              onPress={handleLogout}
              className="bg-red-600 py-4 rounded-lg items-center"
            >
              <Text className="text-white font-semibold text-lg">Sign Out</Text>
            </TouchableOpacity>
          ) : isGuest ? (
            <>
              <TouchableOpacity
                onPress={handleSignIn}
                className="bg-purple-600 py-4 rounded-lg items-center"
              >
                <Text className="text-white font-semibold text-lg">Sign In</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSignUp}
                className="bg-green-600 py-4 rounded-lg items-center"
              >
                <Text className="text-white font-semibold text-lg">Create Account</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                onPress={handleSignIn}
                className="bg-purple-600 py-4 rounded-lg items-center"
              >
                <Text className="text-white font-semibold text-lg">Sign In</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setGuest(true);
                  Alert.alert('Guest Mode', 'You can now browse pubs as a guest!');
                }}
                className="bg-gray-600 py-4 rounded-lg items-center"
              >
                <Text className="text-white font-semibold text-lg">Continue as Guest</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Cache Management Section */}
          <View className="mt-8 pt-6 border-t border-gray-200">
            <Text className="text-lg font-bold text-gray-800 mb-4">App Settings</Text>
            
            <TouchableOpacity
              onPress={clearCache}
              className="bg-yellow-500 py-3 rounded-lg items-center mb-3"
            >
              <Text className="text-white font-semibold">Clear Local Cache</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={getCacheStats}
              className="bg-blue-500 py-3 rounded-lg items-center mb-3"
            >
              <Text className="text-white font-semibold">Refresh Cache Info</Text>
            </TouchableOpacity>

            <Text className="text-gray-500 text-sm text-center mt-3">
              Clearing cache will remove saved search results and reload fresh data
            </Text>
          </View>

          {/* App Info */}
          <View className="mt-8 pt-6 border-t border-gray-200">
            <Text className="text-lg font-bold text-gray-800 mb-4">About Hops & Pins</Text>
            <Text className="text-gray-600 text-sm mb-2">
              • Discover and track your favorite pubs
            </Text>
            <Text className="text-gray-600 text-sm mb-2">
              • Check in with your favorite drinks
            </Text>
            <Text className="text-gray-600 text-sm mb-2">
              • Share experiences with friends
            </Text>
            <Text className="text-gray-600 text-sm">
              • Built with React Native & Firebase
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default Profile;