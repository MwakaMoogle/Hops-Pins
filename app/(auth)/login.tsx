// app/(auth)/login.tsx
import { useAuthContext } from '@/contexts/AuthContext';
import { useGuestContext } from '@/contexts/GuestContext';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, loading, error, clearError } = useAuthContext();
  const { setGuest } = useGuestContext();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    const { success, error } = await signIn(email, password);
    
    if (success) {
      Alert.alert('Success', 'Welcome back!');
      router.replace('/(tabs)');
    } else {
      Alert.alert('Login Failed', error || 'An error occurred');
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 min-h-screen p-6 justify-center">
        {/* Header */}
        <View className="items-center mb-12">
          <Text className="text-4xl font-bold text-purple-600 mb-2">Hops & Pins</Text>
          <Text className="text-lg text-gray-600">Welcome back! Sign in to continue.</Text>
        </View>

        {/* Login Form */}
        <View className="space-y-4">
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">Email</Text>
            <TextInput
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-800"
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">Password</Text>
            <TextInput
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-800"
            />
          </View>

          {/* Error Message */}
          {error && (
            <View className="bg-red-50 border border-red-200 rounded-lg p-3">
              <Text className="text-red-800 text-sm">{error}</Text>
            </View>
          )}

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            className={`py-4 rounded-lg items-center ${
              loading ? 'bg-gray-400' : 'bg-purple-600'
            }`}
          >
            <Text className="text-white font-semibold text-lg">
              {loading ? 'Signing In...' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          {/* Sign Up Link */}
          <View className="flex-row justify-center items-center mt-4">
            <Text className="text-gray-600">Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
              <Text className="text-purple-600 font-semibold">Sign Up</Text>
            </TouchableOpacity>
          </View>

          {/* Continue as Guest */}
          <TouchableOpacity
            onPress={() => {
              setGuest(true); // Set guest mode
              router.replace('/(tabs)' as any);
            }}
            className="py-3 rounded-lg items-center border border-gray-300 mt-4"
          >
            <Text className="text-gray-700 font-medium">Continue as Guest</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}