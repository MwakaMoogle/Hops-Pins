// app/components/PubImage.tsx - SIMPLE VERSION
import React from 'react';
import { Image, Text, View } from 'react-native';

interface PubImageProps {
  imageUrl?: string;
  pubName: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const PubImage = ({ imageUrl, pubName, size = 'medium', className = '' }: PubImageProps) => {
  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-20 h-20', 
    large: 'w-24 h-24'
  };

  const emojiSize = {
    small: 'text-xl',
    medium: 'text-2xl',
    large: 'text-3xl'
  };

  // If no image URL, show fallback beer emoji
  if (!imageUrl) {
    return (
      <View className={`${sizeClasses[size]} bg-purple-400 rounded-lg items-center justify-center ${className}`}>
        <Text className={`text-white font-bold ${emojiSize[size]}`}>🍺</Text>
      </View>
    );
  }

  // If we have image URL, try to show it
  return (
    <View className={`${sizeClasses[size]} rounded-lg overflow-hidden ${className}`}>
      <Image 
        source={{ uri: imageUrl }}
        className="w-full h-full"
        resizeMode="cover"
        onError={() => console.log('Image failed to load')}
      />
    </View>
  );
};

export default PubImage;