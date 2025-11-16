import { useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import SearchTab from '../components/searchTab';

const search = () => {

  const router = useRouter();

  const onPressedButton = () => {
    router.push('../pubs/cozy'); // replace '/other' with the route you want to navigate to
  };

  return (
    <View className="flex-1 items-center justify-center">
      <Text className='text-5xl text-purple-400 font-bold pt-16'>Search</Text>
      <TouchableOpacity onPress={onPressedButton}>
        <SearchTab />
      </TouchableOpacity>
      <SearchTab />
      <SearchTab />
      <SearchTab />
      <SearchTab />
      <SearchTab />
    </View>
  )
}

export default search