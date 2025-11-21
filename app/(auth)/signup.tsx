// app/(auth)/signup.tsx
import { useAuthContext } from '@/contexts/AuthContext';
import { useGuestContext } from '@/contexts/GuestContext';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SignupScreen() {
  const router = useRouter();
  const { signUp, loading, error, clearError } = useAuthContext();
  const { setGuest } = useGuestContext();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignUp = async () => {
    if (!email || !password || !displayName) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    const { success, error } = await signUp(email, password, displayName);
    
    if (success) {
      Alert.alert('Success', 'Account created successfully!');
      router.replace('/(tabs)');
    } else {
      Alert.alert('Sign Up Failed', error || 'An error occurred');
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 min-h-screen p-6 justify-center">
        {/* Header */}
        <View className="items-center mb-12">
          <Text className="text-4xl font-bold text-purple-600 mb-2">Hops & Pins</Text>
          <Text className="text-lg text-gray-600">Create your account</Text>
        </View>

        {/* Sign Up Form */}
        <View className="space-y-4">
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">Display Name</Text>
            <TextInput
              placeholder="What should we call you?"
              value={displayName}
              onChangeText={setDisplayName}
              className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-800"
            />
          </View>

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
              placeholder="Create a password (min. 6 characters)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-800"
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">Confirm Password</Text>
            <TextInput
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
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

          {/* Sign Up Button */}
          <TouchableOpacity
            onPress={handleSignUp}
            disabled={loading}
            className={`py-4 rounded-lg items-center ${
              loading ? 'bg-gray-400' : 'bg-purple-600'
            }`}
          >
            <Text className="text-white font-semibold text-lg">
              {loading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </TouchableOpacity>

          {/* Login Link */}
          <View className="flex-row justify-center items-center mt-4">
            <Text className="text-gray-600">Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text className="text-purple-600 font-semibold">Sign In</Text>
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