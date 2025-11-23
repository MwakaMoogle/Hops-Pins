// app/(tabs)/search.tsx
import { useLocation } from '@/hooks/useLocation';
import { usePubs } from '@/hooks/usePubs';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const Search = () => {
  const router = useRouter();
  const { pubs, loading, searchNearbyPubs } = usePubs();
  const { location } = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Filter pubs based on search query
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    // Simple client-side search - you could enhance this with fuzzy search
    const filtered = pubs.filter(pub => 
      pub.name.toLowerCase().includes(query.toLowerCase()) ||
      pub.location.address.toLowerCase().includes(query.toLowerCase())
    );
    
    setSearchResults(filtered);
    setIsSearching(false);
  };

  // Search nearby pubs when component mounts
  useEffect(() => {
    if (location && pubs.length === 0) {
      searchNearbyPubs(location.latitude, location.longitude);
    }
  }, [location]);

  const handlePubPress = (pubId: string) => {
    router.push(`/pubs/${pubId}`);
  };

  const handleSearchNearby = async () => {
    if (location) {
      await searchNearbyPubs(location.latitude, location.longitude);
      Alert.alert('Success', `Found ${pubs.length} pubs nearby!`);
    }
  };

  const displayResults = searchQuery ? searchResults : pubs;

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-purple-600 p-6">
        <Text className="text-3xl font-bold text-white text-center">Search Pubs</Text>
        <Text className="text-purple-200 text-center mt-2">
          Find your next favorite spot
        </Text>
      </View>

      {/* Search Bar */}
      <View className="p-4 border-b border-gray-200">
        <View className="flex-row items-center">
          <TextInput
            placeholder="Search by pub name or location..."
            value={searchQuery}
            onChangeText={handleSearch}
            className="flex-1 bg-gray-100 rounded-lg p-4 text-gray-800"
          />
        </View>
        
        {/* Quick Actions */}
        <View className="flex-row mt-3 space-x-2">
          <TouchableOpacity
            onPress={handleSearchNearby}
            disabled={loading}
            className="bg-purple-500 px-4 py-2 rounded-lg"
          >
            <Text className="text-white font-medium">
              {loading ? 'Searching...' : 'Search Nearby'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => setSearchQuery('')}
            className="bg-gray-500 px-4 py-2 rounded-lg"
          >
            <Text className="text-white font-medium">Clear</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Results */}
      <ScrollView className="flex-1 p-4">
        {loading && (
          <View className="items-center py-8">
            <ActivityIndicator size="large" color="#8B5CF6" />
            <Text className="text-gray-600 mt-2">Searching for pubs...</Text>
          </View>
        )}

        {!loading && displayResults.length === 0 && (
          <View className="items-center py-8">
            <Text className="text-gray-500 text-lg">No pubs found</Text>
            <Text className="text-gray-400 text-center mt-2">
              {searchQuery 
                ? 'Try a different search term or search nearby pubs'
                : 'Search for pubs by name or use "Search Nearby"'
              }
            </Text>
          </View>
        )}

        {!loading && displayResults.length > 0 && (
          <View>
            <Text className="text-lg font-semibold text-gray-800 mb-4">
              {searchQuery ? 'Search Results' : 'Nearby Pubs'} ({displayResults.length})
            </Text>
            
            {displayResults.map((pub) => (
              <TouchableOpacity
                key={pub.id}
                onPress={() => handlePubPress(pub.id)}
                className="bg-white border border-gray-200 rounded-xl p-4 mb-3 shadow-sm"
              >
                <Text className="text-xl font-bold text-gray-900 mb-1">
                  {pub.name}
                </Text>
                <Text className="text-gray-600 text-sm mb-2">
                  {pub.location.address}
                </Text>
                
                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center">
                    <Text className="text-yellow-500 mr-1">⭐</Text>
                    <Text className="text-gray-700 font-medium">
                      {pub.averageRating > 0 ? pub.averageRating.toFixed(1) : 'No ratings'}
                    </Text>
                  </View>
                  
                  <View className="flex-row items-center">
                    <Text className="text-purple-600 font-medium">
                      {pub.totalCheckins} check-in{pub.totalCheckins !== 1 ? 's' : ''}
                    </Text>
                  </View>
                </View>
                
                {/* Quick stats */}
                <View className="flex-row mt-3 space-x-3">
                  <View className="bg-purple-100 px-2 py-1 rounded">
                    <Text className="text-purple-700 text-xs font-medium">
                      📍 {Math.random().toFixed(1)}km
                    </Text>
                  </View>
                  <View className="bg-green-100 px-2 py-1 rounded">
                    <Text className="text-green-700 text-xs font-medium">
                      🍺 Popular
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Search Tips */}
        {!searchQuery && !loading && (
          <View className="mt-8 bg-blue-50 rounded-xl p-4 border border-blue-200">
            <Text className="text-lg font-semibold text-blue-800 mb-2">
              Search Tips
            </Text>
            <Text className="text-blue-700 text-sm mb-1">
              • Search by pub name (e.g., "The Red Lion")
            </Text>
            <Text className="text-blue-700 text-sm mb-1">
              • Search by area (e.g., "Soho", "Camden")
            </Text>
            <Text className="text-blue-700 text-sm">
              • Use "Search Nearby" to find pubs around you
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default Search;