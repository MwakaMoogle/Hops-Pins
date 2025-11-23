// app/test-beer.tsx (temporary file)
import { testBeerApi } from '@/lib/api/beer';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function BeerTestScreen() {
  const [beerName, setBeerName] = useState('ipa');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const runTest = async () => {
    if (!beerName.trim()) return;
    
    setLoading(true);
    setResult(null);
    
    try {
      const apiResult = await testBeerApi(beerName);
      setResult(apiResult);
      Alert.alert('Success', 'API test completed! Check console for details.');
    } catch (error: any) {
      setResult({ error: error.message });
      Alert.alert('Error', `Test failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold text-center mb-6">🍺 Beer API Test</Text>
      
      <View className="mb-4">
        <Text className="text-lg font-semibold mb-2">Beer Name to Test:</Text>
        <TextInput
          value={beerName}
          onChangeText={setBeerName}
          placeholder="Enter beer name (e.g., ipa, lager)"
          className="border border-gray-300 rounded-lg p-3 text-lg"
        />
      </View>

      <TouchableOpacity
        onPress={runTest}
        disabled={loading}
        className={`py-3 rounded-lg items-center mb-6 ${
          loading ? 'bg-gray-400' : 'bg-purple-600'
        }`}
      >
        <Text className="text-white font-semibold text-lg">
          {loading ? 'Testing...' : 'Run API Test'}
        </Text>
      </TouchableOpacity>

      {result && (
        <View className="border border-gray-300 rounded-lg p-3">
          <Text className="text-lg font-semibold mb-2">Result:</Text>
          <Text className="text-gray-700 text-sm">
            {JSON.stringify(result, null, 2)}
          </Text>
        </View>
      )}

      <View className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <Text className="font-semibold text-yellow-800">Test Cases to Try:</Text>
        <Text className="text-yellow-700 text-sm mt-1">• "ipa" (should work)</Text>
        <Text className="text-yellow-700 text-sm">• "lager" (should work)</Text>
        <Text className="text-yellow-700 text-sm">• "asahi" (should work)</Text>
        <Text className="text-yellow-700 text-sm">• "nonexistentbeer123" (should fail gracefully)</Text>
      </View>
    </ScrollView>
  );
}