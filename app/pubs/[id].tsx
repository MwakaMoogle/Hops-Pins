import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';

const PubDetails = () => {
   const { id } = useLocalSearchParams();

  return (
    <View>
      <Text>Pub Details for {id}</Text>
    </View>
  )
}

export default PubDetails