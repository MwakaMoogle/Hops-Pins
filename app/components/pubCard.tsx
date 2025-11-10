import React from 'react'
import { View } from 'react-native'

const PubCard = () => {
  return (
    <View className='flex-1 p-4 w-full min-h-50' style={{ maxHeight: 160}}>
      <View className='flex-1  bg-green-200 rounded-lg justify-center '>
        <View className="flex-row items-center px-2">
          <View className="w-1/3 items-center">
            <View className="bg-green-400 w-full aspect-square rounded-full" />
          </View>
          <View className="w-2/3 pl-3 justify-center">
            <View className="bg-green-300 w-full h-4 rounded-full mb-2" />
            <View className="bg-green-300 w-5/6 h-4 rounded-full" />
          </View>
        </View>
      </View>
    </View>
  )
}

export default PubCard