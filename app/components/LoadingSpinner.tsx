// app/components/LoadingSpinner.tsx
import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'large';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Loading...', 
  size = 'large' 
}) => {
  return (
    <View className="flex-row items-center justify-center p-4">
      <ActivityIndicator size={size} color="#8B5CF6" />
      <Text className="ml-3 text-purple-600">{message}</Text>
    </View>
  );
};

export default LoadingSpinner;