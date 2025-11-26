// __tests__/setup.ts
import 'react-native';


// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(),
  multiRemove: jest.fn(),
}));

// Mock Firebase
jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  updateProfile: jest.fn(),
  onAuthStateChanged: jest.fn(),
  getReactNativePersistence: jest.fn(),
  initializeAuth: jest.fn(),
  getAuth: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  Timestamp: {
    now: jest.fn(() => ({ toDate: () => new Date() })),
    fromDate: jest.fn(() => ({ toDate: () => new Date() })),
  },
}));

// Mock Expo Location
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  Accuracy: {
    Balanced: 'balanced',
  },
}));

// Mock environment variables
process.env.EXPO_PUBLIC_FIREBASE_API_KEY = 'test-firebase-key';
process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY = 'test-google-key';
process.env.EXPO_PUBLIC_RAPID_API_KEY = 'test-rapidapi-key';

// Mock Firebase instance with proper structure
jest.mock('@/lib/firebase', () => ({
  auth: {
    currentUser: null,
  },
  db: {},
  default: {},
}));

// Global fetch mock with proper implementation
global.fetch = jest.fn();

// Mock console methods to reduce test noise but allow errors
const originalConsole = { ...console };
console.error = jest.fn((...args) => {
  // Only show errors that aren't from React internal warnings
  if (typeof args[0] === 'string' && args[0].includes('Warning: ReactDOM.render is no longer supported')) {
    return;
  }
  originalConsole.error(...args);
});

console.warn = jest.fn((...args) => {
  // Allow warnings to be captured but not clutter output
  originalConsole.warn(...args);
});

// Restore console for after tests
afterAll(() => {
  console.error = originalConsole.error;
  console.warn = originalConsole.warn;
});