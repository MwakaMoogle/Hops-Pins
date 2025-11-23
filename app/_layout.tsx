// app/_layout.tsx - temporarily add this line
import { AuthProvider } from '@/contexts/AuthContext';
import { GuestProvider } from '@/contexts/GuestContext';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import './global.css';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <GuestProvider>
        <AuthProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="pubs/[id]" options={{ headerShown: false }} />
          </Stack>
        </AuthProvider>
      </GuestProvider>
    </SafeAreaProvider>
  );
}