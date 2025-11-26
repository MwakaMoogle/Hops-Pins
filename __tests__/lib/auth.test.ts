// __tests__/lib/auth.test.ts
import { createUserProfile } from '@/lib/api/users';
import { getCurrentUser, logout, onAuthStateChange, signIn, signUp } from '@/lib/auth';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';

// Mock the dependencies
jest.mock('firebase/auth');
jest.mock('@/lib/api/users');
jest.mock('@/lib/firebase', () => ({
  auth: {
    currentUser: null,
  },
}));

const mockCreateUserWithEmailAndPassword = createUserWithEmailAndPassword as jest.MockedFunction<typeof createUserWithEmailAndPassword>;
const mockSignInWithEmailAndPassword = signInWithEmailAndPassword as jest.MockedFunction<typeof signInWithEmailAndPassword>;
const mockSignOut = signOut as jest.MockedFunction<typeof signOut>;
const mockUpdateProfile = updateProfile as jest.MockedFunction<typeof updateProfile>;
const mockCreateUserProfile = createUserProfile as jest.MockedFunction<typeof createUserProfile>;
const mockOnAuthStateChanged = onAuthStateChanged as jest.MockedFunction<typeof onAuthStateChanged>;

describe('Auth API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signUp', () => {
    it('should successfully sign up a user', async () => {
      const mockUser = { 
        uid: '123', 
        updateProfile: jest.fn().mockResolvedValue(undefined)
      };
      
      mockCreateUserWithEmailAndPassword.mockResolvedValueOnce({
        user: mockUser as any,
        providerId: null,
        operationType: 'signIn'
      });

      const result = await signUp('test@example.com', 'password123', 'Test User');

      expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), 'test@example.com', 'password123');
      expect(mockUpdateProfile).toHaveBeenCalledWith(mockUser, {
        displayName: 'Test User'
      });
      expect(mockCreateUserProfile).toHaveBeenCalledWith('123', {
        email: 'test@example.com',
        displayName: 'Test User',
      });
      expect(result.user).toEqual(mockUser);
      expect(result.error).toBeNull();
    });

    it('should handle email already in use error', async () => {
      const error = { code: 'auth/email-already-in-use', message: 'Email already in use' };
      mockCreateUserWithEmailAndPassword.mockRejectedValueOnce(error);

      const result = await signUp('test@example.com', 'password123', 'Test User');

      expect(result.user).toBeNull();
      expect(result.error).toBe('This email is already registered. Please sign in instead.');
    });

    it('should handle weak password error', async () => {
      const error = { code: 'auth/weak-password', message: 'Weak password' };
      mockCreateUserWithEmailAndPassword.mockRejectedValueOnce(error);

      const result = await signUp('test@example.com', '123', 'Test User');

      expect(result.user).toBeNull();
      expect(result.error).toBe('Password should be at least 6 characters.');
    });

    it('should handle invalid email error', async () => {
      const error = { code: 'auth/invalid-email', message: 'Invalid email' };
      mockCreateUserWithEmailAndPassword.mockRejectedValueOnce(error);

      const result = await signUp('invalid-email', 'password123', 'Test User');

      expect(result.user).toBeNull();
      expect(result.error).toBe('Please enter a valid email address.');
    });

    it('should handle configuration not found error', async () => {
      const error = { code: 'auth/configuration-not-found', message: 'Configuration error' };
      mockCreateUserWithEmailAndPassword.mockRejectedValueOnce(error);

      const result = await signUp('test@example.com', 'password123', 'Test User');

      expect(result.user).toBeNull();
      expect(result.error).toBe('Firebase configuration error. Please check your environment variables.');
    });
  });

  describe('signIn', () => {
    it('should successfully sign in a user', async () => {
      const mockUser = { uid: '123' };
      mockSignInWithEmailAndPassword.mockResolvedValueOnce({
        user: mockUser as any,
        providerId: null,
        operationType: 'signIn'
      });

      const result = await signIn('test@example.com', 'password123');

      expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), 'test@example.com', 'password123');
      expect(result.user).toEqual(mockUser);
      expect(result.error).toBeNull();
    });

    it('should handle user not found error', async () => {
      const error = { code: 'auth/user-not-found', message: 'User not found' };
      mockSignInWithEmailAndPassword.mockRejectedValueOnce(error);

      const result = await signIn('test@example.com', 'password123');

      expect(result.user).toBeNull();
      expect(result.error).toBe('No account found with this email. Please sign up first.');
    });

    it('should handle wrong password error', async () => {
      const error = { code: 'auth/wrong-password', message: 'Wrong password' };
      mockSignInWithEmailAndPassword.mockRejectedValueOnce(error);

      const result = await signIn('test@example.com', 'wrongpassword');

      expect(result.user).toBeNull();
      expect(result.error).toBe('Incorrect password. Please try again.');
    });

    it('should handle invalid email error', async () => {
      const error = { code: 'auth/invalid-email', message: 'Invalid email' };
      mockSignInWithEmailAndPassword.mockRejectedValueOnce(error);

      const result = await signIn('invalid-email', 'password123');

      expect(result.user).toBeNull();
      expect(result.error).toBe('Please enter a valid email address.');
    });
  });

  describe('logout', () => {
    it('should successfully logout', async () => {
      mockSignOut.mockResolvedValueOnce();

      const result = await logout();

      expect(mockSignOut).toHaveBeenCalled();
      expect(result.error).toBeNull();
    });

    it('should handle logout error', async () => {
      const error = { message: 'Logout failed' };
      mockSignOut.mockRejectedValueOnce(error);

      const result = await logout();

      expect(result.error).toBe('Logout failed');
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user', () => {
      const mockUser = { uid: '123', email: 'test@example.com' };
      const { auth } = require('@/lib/firebase');
      auth.currentUser = mockUser;

      const result = getCurrentUser();

      expect(result).toEqual(mockUser);
    });

    it('should return null when no user is logged in', () => {
      const { auth } = require('@/lib/firebase');
      auth.currentUser = null;

      const result = getCurrentUser();

      expect(result).toBeNull();
    });
  });

  describe('onAuthStateChange', () => {
    it('should register auth state change listener', () => {
      const callback = jest.fn();
      
      onAuthStateChange(callback);

      expect(mockOnAuthStateChanged).toHaveBeenCalledWith(expect.anything(), callback);
    });
  });
});