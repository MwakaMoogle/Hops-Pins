// __tests__/lib/api/users.test.ts
import {
    createUserProfile,
    getUserProfile,
    incrementUserCheckins,
    updateUserProfile,
    UserProfile
} from '@/lib/api/users';
import { doc, getDoc, setDoc, Timestamp, updateDoc } from 'firebase/firestore';

// Mock Firebase
jest.mock('firebase/firestore');
jest.mock('@/lib/firebase', () => ({
  db: {},
}));

const mockDoc = doc as jest.MockedFunction<typeof doc>;
const mockGetDoc = getDoc as jest.MockedFunction<typeof getDoc>;
const mockSetDoc = setDoc as jest.MockedFunction<typeof setDoc>;
const mockUpdateDoc = updateDoc as jest.MockedFunction<typeof updateDoc>;

describe('Users API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createUserProfile', () => {
    it('should create user profile successfully', async () => {
      const userData = {
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: 'https://example.com/photo.jpg'
      };

      await createUserProfile('user123', userData);

      expect(mockSetDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          uid: 'user123',
          email: 'test@example.com',
          displayName: 'Test User',
          photoURL: 'https://example.com/photo.jpg',
          totalCheckins: 0
        })
      );
    });

    it('should handle errors', async () => {
      const userData = {
        email: 'test@example.com',
        displayName: 'Test User'
      };

      mockSetDoc.mockRejectedValueOnce(new Error('Firestore error'));

      await expect(createUserProfile('user123', userData)).rejects.toThrow();
    });
  });

  describe('getUserProfile', () => {
    it('should return user profile when found', async () => {
      const mockProfile: UserProfile = {
        uid: 'user123',
        email: 'test@example.com',
        displayName: 'Test User',
        createdAt: Timestamp.now() as any,
        lastLogin: Timestamp.now() as any,
        totalCheckins: 5,
        favoriteBeer: 'IPA',
        bio: 'Test bio'
      };

      const mockDocSnap = {
        exists: jest.fn().mockReturnValue(true),
        data: jest.fn().mockReturnValue(mockProfile)
      };

      mockGetDoc.mockResolvedValueOnce(mockDocSnap as any);

      const result = await getUserProfile('user123');

      expect(result).toEqual(mockProfile);
    });

    it('should return null when user not found', async () => {
      const mockDocSnap = {
        exists: jest.fn().mockReturnValue(false)
      };

      mockGetDoc.mockResolvedValueOnce(mockDocSnap as any);

      const result = await getUserProfile('nonexistent');

      expect(result).toBeNull();
    });

    it('should handle errors', async () => {
      mockGetDoc.mockRejectedValueOnce(new Error('Firestore error'));

      const result = await getUserProfile('user123');

      expect(result).toBeNull();
    });
  });

  describe('updateUserProfile', () => {
    it('should update user profile successfully', async () => {
      const updates = {
        displayName: 'Updated Name',
        bio: 'Updated bio'
      };

      await updateUserProfile('user123', updates);

      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          displayName: 'Updated Name',
          bio: 'Updated bio',
          lastLogin: expect.anything()
        })
      );
    });

    it('should handle errors', async () => {
      const updates = { displayName: 'New Name' };
      mockUpdateDoc.mockRejectedValueOnce(new Error('Update error'));

      await expect(updateUserProfile('user123', updates)).rejects.toThrow();
    });
  });

  describe('incrementUserCheckins', () => {
    it('should increment user checkins', async () => {
      const mockProfile: UserProfile = {
        uid: 'user123',
        email: 'test@example.com',
        displayName: 'Test User',
        createdAt: Timestamp.now() as any,
        lastLogin: Timestamp.now() as any,
        totalCheckins: 5
      };

      // Mock getUserProfile to return existing profile
      const getUserProfileMock = jest.spyOn(require('@/lib/api/users'), 'getUserProfile');
      getUserProfileMock.mockResolvedValueOnce(mockProfile);

      await incrementUserCheckins('user123');

      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        {
          totalCheckins: 6,
          lastLogin: expect.anything()
        }
      );
    });

    it('should handle missing user profile', async () => {
      const getUserProfileMock = jest.spyOn(require('@/lib/api/users'), 'getUserProfile');
      getUserProfileMock.mockResolvedValueOnce(null);

      await incrementUserCheckins('user123');

      expect(mockUpdateDoc).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      const mockProfile: UserProfile = {
        uid: 'user123',
        email: 'test@example.com',
        displayName: 'Test User',
        createdAt: Timestamp.now() as any,
        lastLogin: Timestamp.now() as any,
        totalCheckins: 5
      };

      const getUserProfileMock = jest.spyOn(require('@/lib/api/users'), 'getUserProfile');
      getUserProfileMock.mockResolvedValueOnce(mockProfile);
      mockUpdateDoc.mockRejectedValueOnce(new Error('Update error'));

      await expect(incrementUserCheckins('user123')).resolves.not.toThrow();
    });
  });
});