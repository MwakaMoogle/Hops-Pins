import { Text, View } from "react-native";
import MapContainer from "../components/mapContainer";
import PubCard from "../components/pubCard";

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-5xl text-purple-400 font-bold pt-16">Welcome! 👋</Text>
      <MapContainer />
      <PubCard />
    </View>
  );
}
