// app/components/ImageTest.tsx
import React, { useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const ImageTest = () => {
  const [testResults, setTestResults] = useState<{[key: string]: string}>({});

  const testUrls = {
    'Google Photo': 'https://lh3.googleusercontent.com/places/ANXAkqG05ARZ3ErllLAEunq5ORAciSYOKdRqO6JDxP5ywHDLCyc7FkAJLtyooksOFc7WqXp0lnhwV6LxVIQknno5_q6OXJGr5bujAN0=s4800-w400-h400',
    'Regular HTTPS': 'https://reactjs.org/logo-og.png',
    'PNG Image': 'https://via.placeholder.com/400x400.png',
  };

  const testImage = async (name: string, url: string) => {
    setTestResults(prev => ({ ...prev, [name]: 'Testing...' }));
    
    try {
      const response = await fetch(url);
      console.log(`🔍 ${name} - Status:`, response.status);
      console.log(`🔍 ${name} - Headers:`, Object.fromEntries(response.headers));
      
      if (response.ok) {
        setTestResults(prev => ({ ...prev, [name]: `✅ OK (${response.status})` }));
      } else {
        setTestResults(prev => ({ ...prev, [name]: `❌ Failed (${response.status})` }));
      }
    } catch (error: any) {
      console.log(`❌ ${name} - Error:`, error);
      setTestResults(prev => ({ ...prev, [name]: `❌ Error: ${error.message}` }));
    }
  };

  return (
    <ScrollView className="p-4">
      <Text className="text-lg font-bold mb-4">Image URL Test</Text>
      
      {Object.entries(testUrls).map(([name, url]) => (
        <View key={name} className="mb-6 border border-gray-300 rounded-lg p-4">
          <Text className="font-semibold mb-2">{name}</Text>
          <Text className="text-sm text-gray-600 mb-2" numberOfLines={2}>
            {url}
          </Text>
          
          <TouchableOpacity 
            onPress={() => testImage(name, url)}
            className="bg-blue-500 p-3 rounded-lg mb-3"
          >
            <Text className="text-white text-center font-semibold">
              Test URL
            </Text>
          </TouchableOpacity>
          
          <Text className="text-sm mb-3">
            Status: {testResults[name] || 'Not tested'}
          </Text>
          
          <View className="border-t border-gray-300 pt-3">
            <Text className="text-sm font-medium mb-2">Image Preview:</Text>
            <Image 
              source={{ uri: url }}
              className="w-32 h-32 rounded-lg self-center"
              resizeMode="cover"
              onError={(e) => console.log(`❌ ${name} preview failed:`, e.nativeEvent.error)}
              onLoad={() => console.log(`✅ ${name} preview loaded`)}
            />
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

export default ImageTest;