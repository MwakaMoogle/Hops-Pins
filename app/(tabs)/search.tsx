import React from 'react'
import { Text, View } from 'react-native'
import SearchTab from '../components/searchTab'

const search = () => {
  return (
    <View className="flex-1 items-center justify-center">
      <Text className='text-5xl text-purple-400 font-bold pt-16'>Search</Text>
      <SearchTab />
      <SearchTab />
      <SearchTab />
      <SearchTab />
      <SearchTab />
      <SearchTab />
    </View>
  )
}

export default search