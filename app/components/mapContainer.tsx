// ...existing code...
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';

type Pin = { id: number; label: string };

/**
 * MapContainer now:
 * - Uses flex-grow and min-h-0 so it fills remaining space instead of forcing its own height.
 * - Does not use SafeAreaView so it respects the parent view layout (index.tsx).
 * - The map placeholder will expand to whatever vertical space remains between siblings (above/below).
 */
const MapContainer: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [pins, setPins] = useState<Pin[]>([]);

  const loadMockPins = () => {
    setLoading(true);
    setPins([]);
    setTimeout(() => {
      setPins([
        { id: 1, label: 'Pin A' },
        { id: 2, label: 'Pin B' },
        { id: 3, label: 'Pin C' },
      ]);
      setLoading(false);
    }, 800);
  };

  return (
    // Use flex-grow and min-h-0 so this component takes remaining space but can shrink
    // to keep other siblings (like the welcome text) visible.
    <View className="flex-grow w-full min-h-0">
      <View className="flex-1 min-h-0 p-4">
        {/* Map placeholder area - expands to remaining vertical space */}
        <View className="flex-1 min-h-0 rounded-lg bg-gray-100 items-center justify-center overflow-hidden">
          {loading ? (
            <View className="items-center">
              <ActivityIndicator size="large" />
              <Text className="mt-2 text-gray-600">Loading map data…</Text>
            </View>
          ) : pins.length === 0 ? (
            <View className="items-center">
              <Text className="text-gray-500 mb-2">Map placeholder</Text>
              <Text className="text-gray-400 text-sm">
                No pins yet — load mock data to preview layout.
              </Text>
            </View>
          ) : (
            <View className="items-center">
              <Text className="text-gray-700 mb-3">Mock Pins</Text>
              {pins.map((p) => (
                <View
                  key={p.id}
                  className="px-3 py-1 bg-white rounded-full border border-gray-200 mb-2"
                >
                  <Text className="text-sm text-gray-800">{p.label}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Bottom controls */}
        <View className="flex-row items-center justify-between mt-4 px-1">
          <Pressable
            onPress={loadMockPins}
            className="bg-primary px-4 py-2 rounded-md"
            accessibilityRole="button"
          >
            <Text className="text-white">Load Map Data</Text>
          </Pressable>

          <Pressable
            onPress={() => Alert.alert('Placeholder', 'Add Pin (placeholder)')}
            className="bg-accent px-4 py-2 rounded-md"
            accessibilityRole="button"
          >
            <Text className="text-white">Add Pin</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

export default MapContainer;