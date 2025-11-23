// app/(tabs)/_layout.tsx (should already be set up)
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          headerShown: false
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          headerShown: false
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerShown: false
        }}
      />
    </Tabs>
  );
}