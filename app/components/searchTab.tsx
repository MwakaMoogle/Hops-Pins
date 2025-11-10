import React from 'react'
import { View } from 'react-native'

const SearchTab = () => {
	return (
		<View className='flex-1 p-2 w-full min-h-50' style={{ maxHeight: 80}}>
			<View className='flex-1 bg-red-200 rounded-lg justify-center'>
				<View className='flex-row items-center px-2'>
					<View className='w-1/3 items-start pl-0'>
						<View className='bg-red-400 w-full aspect-square h-14 -ml-0' />
					</View>
					<View className='w-2/3 pl-3 justify-center'>
						<View className='bg-red-300 w-full h-4 rounded-full -ml-12' />
					</View>
				</View>
			</View>
		</View>
	)
}

export default SearchTab

