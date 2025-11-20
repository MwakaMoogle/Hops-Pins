// app/components/ErrorDisplay.tsx
import { AppError } from '@/lib/errorHandler';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface ErrorDisplayProps {
  error: AppError | null;
  onRetry?: () => void;
  title?: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  error, 
  onRetry, 
  title = 'Something went wrong' 
}) => {
  if (!error) return null;

  return (
    <View className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
      <Text className="text-red-800 font-bold text-lg mb-1">{title}</Text>
      <Text className="text-red-600 text-sm mb-3">
        {error.userFriendly || error.message}
      </Text>
      {onRetry && (
        <TouchableOpacity
          onPress={onRetry}
          className="bg-red-600 px-4 py-2 rounded self-start"
        >
          <Text className="text-white font-medium">Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ErrorDisplay;