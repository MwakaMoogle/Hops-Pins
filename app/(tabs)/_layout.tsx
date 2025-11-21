// app/(tabs)/_layout.tsx
import { useAuthContext } from '@/contexts/AuthContext';
import { useGuestContext } from '@/contexts/GuestContext';
import { Tabs, useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function TabLayout() {
  const { isAuthenticated, initialized } = useAuthContext();
  const { isGuest } = useGuestContext();
  const router = useRouter();

  useEffect(() => {
    if (initialized) {
      // Allow access if authenticated OR in guest mode
      const shouldRedirect = !isAuthenticated && !isGuest;
      if (shouldRedirect) {
        router.replace('/(auth)/login' as any);
      }
    }
  }, [isAuthenticated, initialized, isGuest]);

  if (!initialized) {
    return null;
  }

  // Don't show tabs if not authenticated and not guest
  if (!isAuthenticated && !isGuest) {
    return null;
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