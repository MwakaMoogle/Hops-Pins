// app/components/DrinkSearch.tsx
import { useBeer } from '@/hooks/useBeer';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface DrinkSearchProps {
  onDrinkSelect: (drinkName: string) => void;
  selectedDrink?: string;
}

const DrinkSearch: React.FC<DrinkSearchProps> = ({ onDrinkSelect, selectedDrink }) => {
  const { beers, loading, searchBeer, loadRandomBeer, error: beerError } = useBeer(); // Add error from hook
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);

  const popularDrinks = [
    'Pint of Lager', 'Guinness', 'Craft IPA', 'Pale Ale', 'Stout',
    'Cider', 'Wine', 'G&T', 'Whiskey', 'Vodka Coke', 'Rum & Coke'
  ];

  useEffect(() => {
    if (searchQuery.length > 2) {
      searchBeer(searchQuery);
      setShowResults(true);
    } else if (searchQuery.length === 0) {
      setShowResults(false);
    }
  }, [searchQuery]);

  const handleDrinkSelect = (drink: string) => {
    onDrinkSelect(drink);
    setSearchQuery('');
    setShowResults(false);
  };

  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-gray-700 mb-2">Search for a beer or select below:</Text>
      
      {/* Search Input */}
      <View className="bg-gray-50 rounded-lg p-3 mb-3 border border-gray-200">
        <TextInput
          placeholder="Search beers (e.g., IPA, Stout, Lager...)"
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="text-gray-800"
        />
      </View>

      {/* Loading State */}
      {loading && (
        <View className="flex-row items-center justify-center py-2">
          <ActivityIndicator size="small" color="#8B5CF6" />
          <Text className="text-purple-600 ml-2">Searching beers...</Text>
        </View>
      )}

      {/* Search Results */}
      {showResults && beers.length > 0 && (
        <View className="bg-white border border-gray-200 rounded-lg max-h-40 mb-3">
          <ScrollView>
            {beers.slice(0, 5).map((beer) => (
              <TouchableOpacity
                key={beer.id}
                onPress={() => handleDrinkSelect(beer.name)}
                className="px-4 py-3 border-b border-gray-100"
              >
                <Text className="font-medium text-gray-800">{beer.name}</Text>
                <Text className="text-xs text-gray-500 mt-1">
                  {beer.tagline} • {beer.abv}% ABV
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Network Error Message - Use beerError from hook */}
      {beerError && beerError.code === 'NETWORK_ERROR' && (
        <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
          <Text className="text-yellow-800 text-sm">
            ⚠️ Can't search beers right now. Check your internet connection or use the popular drinks below.
          </Text>
        </View>
      )}

      {/* No Results (only show if not network error) */}
      {showResults && !loading && beers.length === 0 && searchQuery.length > 2 && !beerError && (
        <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
          <Text className="text-yellow-800 text-sm">
            No beers found for "{searchQuery}". Try a different search.
          </Text>
        </View>
      )}

      {/* Popular Drinks */}
      <Text className="text-sm font-medium text-gray-700 mb-2">Popular Drinks:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
        <View className="flex-row">
          {popularDrinks.map((drink) => (
            <TouchableOpacity
              key={drink}
              onPress={() => handleDrinkSelect(drink)}
              className={`px-4 py-2 rounded-full mr-2 ${
                selectedDrink === drink ? 'bg-purple-600' : 'bg-gray-100'
              }`}
            >
              <Text className={
                selectedDrink === drink ? 'text-white font-medium' : 'text-gray-700'
              }>
                {drink}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Random Beer Button */}
      <TouchableOpacity
        onPress={async () => {
          await loadRandomBeer();
          if (beers.length > 0) {
            handleDrinkSelect(beers[0].name);
          }
        }}
        disabled={loading}
        className="bg-purple-100 py-2 rounded-lg items-center"
      >
        <Text className="text-purple-700 font-medium">
          {loading ? 'Loading...' : '🎲 Surprise Me with a Random Beer'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default DrinkSearch;