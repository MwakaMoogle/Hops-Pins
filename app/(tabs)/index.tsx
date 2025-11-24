// app/index.tsx - USING CONTAINER COMPONENT
import { ScrollView, Text, View } from "react-native";
import MapContainer from "../components/mapContainer";
import PubCardsContainer from "../components/PubCardsContainer";

export default function Index() {
  return (
    <View className="flex-1 bg-white">
      <View className="pt-16 pb-2 px-4">
        <Text className="text-5xl text-purple-400 font-bold text-center">
          Welcome! 👋
        </Text>
      </View>
      
      <View style={{ height: 350 }}>
        <MapContainer />
      </View>
      
      <View className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false}>
          <PubCardsContainer />
        </ScrollView>
      </View>
    </View>
  );
}