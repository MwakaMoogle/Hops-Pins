// app/(tabs)/_layout.tsx
import { useAuthContext } from '@/contexts/AuthContext';
import { Tabs, useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function TabLayout() {
  const { isAuthenticated, initialized } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (initialized && !isAuthenticated) {
      // Redirect to login if not authenticated
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, initialized]);

  if (!initialized) {
    return null; // Or a loading screen
  }

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