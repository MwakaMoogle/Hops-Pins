import React from 'react';
import { Alert, Image, Text, TouchableOpacity, View } from 'react-native';

const MapContainer: React.FC = () => {
  const onPressedButton = () => {
    Alert.alert('This is the map container');
  };
  return (
   <View className=' flex-grow w-full min-h-0 p-4' style={{ minHeight: 350 }}>
      <View className='flex-1 bg-blue-200 rounded-lg justify-center items-center'>
        <TouchableOpacity onPress={onPressedButton}>
          <Image
            source={require('../../assets/images/temp/tempMap.png')}
            style={{ width: 300, height: 300 }}
          />
        </TouchableOpacity>
        <Text className='text-lg font-bold mt-4'>Map Container</Text>
      </View>
   </View>
  );
};

export default MapContainer;