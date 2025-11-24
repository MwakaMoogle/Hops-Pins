// app/components/PubImage.tsx - DEBUGGING VERSION
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Text, View } from 'react-native';

interface PubImageProps {
  imageUrl?: string;
  pubName: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const PubImage = ({ imageUrl, pubName, size = 'medium', className = '' }: PubImageProps) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState('');

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

  // Reset states when imageUrl changes
  useEffect(() => {
    setImageError(false);
    setImageLoading(true);
    setDebugInfo(`Starting load for: ${imageUrl}`);
    console.log('🔄 PubImage - URL changed:', imageUrl);
  }, [imageUrl]);

  const handleImageLoad = () => {
    console.log('✅ PubImage - Load successful:', imageUrl);
    setImageLoading(false);
    setDebugInfo('Image loaded successfully');
  };

  const handleImageError = (error: any) => {
    console.log('❌ PubImage - Load failed:', imageUrl);
    console.log('❌ Error details:', error.nativeEvent.error);
    setImageError(true);
    setImageLoading(false);
    setDebugInfo(`Load failed: ${error.nativeEvent?.error || 'Unknown error'}`);
  };

  const handleLoadStart = () => {
    console.log('🔄 PubImage - Load started:', imageUrl);
    setDebugInfo('Load started...');
  };

  // If no image URL or error occurred, show fallback
  if (!imageUrl || imageError) {
    console.log('🔄 PubImage - Showing fallback, URL:', imageUrl, 'Error:', imageError);
    return (
      <View className={`${sizeClasses[size]} bg-purple-400 rounded-lg items-center justify-center ${className}`}>
        <Text className={`text-white font-bold ${emojiSize[size]}`}>🍺</Text>
        {__DEV__ && (
          <Text className="text-white text-xs mt-1 text-center">
            {imageError ? 'Failed' : 'No URL'}
          </Text>
        )}
      </View>
    );
  }

  return (
    <View className={`${sizeClasses[size]} rounded-lg overflow-hidden bg-gray-200 ${className}`}>
      {imageLoading && (
        <View className="absolute inset-0 bg-gray-200 items-center justify-center z-10">
          <ActivityIndicator size="small" color="#8B5CF6" />
          {__DEV__ && (
            <Text className="text-xs text-gray-600 mt-1">Loading...</Text>
          )}
        </View>
      )}
      
      <Image 
        source={{ 
          uri: imageUrl,
          // Add cache control to help with loading
          cache: 'force-cache'
        }}
        className="w-full h-full"
        resizeMode="cover"
        onError={handleImageError}
        onLoad={handleImageLoad}
        onLoadStart={handleLoadStart}
        onLoadEnd={() => {
          console.log('🏁 PubImage - Load ended:', imageUrl);
        }}
      />
      
      {__DEV__ && (
        <View className="absolute bottom-0 left-0 right-0 bg-black/70 p-1">
          <Text className="text-white text-xs text-center">
            {imageLoading ? 'Loading' : 'Loaded'}
          </Text>
        </View>
      )}
    </View>
  );
};

export default PubImage;