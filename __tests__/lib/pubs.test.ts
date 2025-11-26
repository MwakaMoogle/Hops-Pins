// __tests__/lib/api/pubs.test.ts
import {
    addCheckin,
    addPub,
    calculateDistance,
    getPubByPlaceId,
    getPubs,
    updatePubWithImage
} from '@/lib/api/pubs';
import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    Timestamp,
    updateDoc,
    where
} from 'firebase/firestore';

// Mock Firebase
jest.mock('firebase/firestore');
jest.mock('@/lib/firebase', () => ({
  db: {},
}));

const mockCollection = collection as jest.MockedFunction<typeof collection>;
const mockDoc = doc as jest.MockedFunction<typeof doc>;
const mockGetDoc = getDoc as jest.MockedFunction<typeof getDoc>;
const mockGetDocs = getDocs as jest.MockedFunction<typeof getDocs>;
const mockAddDoc = addDoc as jest.MockedFunction<typeof addDoc>;
const mockUpdateDoc = updateDoc as jest.MockedFunction<typeof updateDoc>;
const mockQuery = query as jest.MockedFunction<typeof query>;
const mockWhere = where as jest.MockedFunction<typeof where>;
const mockOrderBy = orderBy as jest.MockedFunction<typeof orderBy>;

// Mock the pubs collection
const mockPubsRef = {};
const mockCheckinsRef = {};

describe('Pubs API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    mockCollection.mockImplementation((db, collectionName) => {
      if (collectionName === 'pubs') return mockPubsRef as any;
      if (collectionName === 'checkins') return mockCheckinsRef as any;
      return {} as any;
    });

    mockDoc.mockImplementation((db, collectionName, id) => {
      return { id } as any;
    });
  });

  describe('calculateDistance', () => {
    it('should calculate distance in miles correctly', () => {
      // Very close coordinates to ensure non-zero distance
      const lat1 = 51.5074;
      const lng1 = -0.1278;
      const lat2 = 51.5075;
      const lng2 = -0.1279;

      const distance = calculateDistance(lat1, lng1, lat2, lng2, 'miles');
      
      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(1);
    });

    it('should calculate distance in kilometers correctly', () => {
      const lat1 = 51.5074;
      const lng1 = -0.1278;
      const lat2 = 51.5075;
      const lng2 = -0.1279;

      const distance = calculateDistance(lat1, lng1, lat2, lng2, 'kilometers');
      
      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(2);
    });

    it('should handle same coordinates', () => {
      const distance = calculateDistance(51.5074, -0.1278, 51.5074, -0.1278, 'miles');
      
      expect(distance).toBe(0);
    });
  });

  describe('addPub', () => {
    it('should add a new pub successfully', async () => {
      const mockPubData = {
        name: 'Test Pub',
        location: {
          latitude: 51.5074,
          longitude: -0.1278,
          address: '123 Test St'
        },
        placeId: 'place123'
      };

      // Mock that no existing pub found
      const getPubByPlaceIdMock = jest.spyOn(require('@/lib/api/pubs'), 'getPubByPlaceId');
      getPubByPlaceIdMock.mockResolvedValueOnce(null);

      // Mock addDoc to return a document reference
      const mockDocRef = { id: 'pub123' };
      mockAddDoc.mockResolvedValueOnce(mockDocRef as any);

      const result = await addPub(mockPubData);

      expect(mockAddDoc).toHaveBeenCalledWith(
        mockPubsRef,
        expect.objectContaining({
          name: 'Test Pub',
          placeId: 'place123',
          totalCheckins: 0,
          averageRating: 0,
          createdAt: expect.anything()
        })
      );
      expect(result).toBe('pub123');
    });

    it('should return existing pub ID if pub already exists', async () => {
      const mockPubData = {
        name: 'Existing Pub',
        location: {
          latitude: 51.5074,
          longitude: -0.1278,
          address: '123 Existing St'
        },
        placeId: 'existingPlace123'
      };

      const existingPub = {
        id: 'existing123',
        name: 'Existing Pub',
        location: {
          latitude: 51.5074,
          longitude: -0.1278,
          address: '123 Existing St'
        },
        placeId: 'existingPlace123',
        totalCheckins: 10,
        averageRating: 4.2,
        createdAt: Timestamp.now()
      };

      // Mock that existing pub is found
      const getPubByPlaceIdMock = jest.spyOn(require('@/lib/api/pubs'), 'getPubByPlaceId');
      getPubByPlaceIdMock.mockResolvedValueOnce(existingPub as any);

      const result = await addPub(mockPubData);

      expect(result).toBe('existing123');
      expect(mockAddDoc).not.toHaveBeenCalled();
    });
  });

  describe('getPubByPlaceId', () => {
    it('should return pub when found by placeId', async () => {
      const mockPub = {
        id: 'pub123',
        name: 'Test Pub',
        location: {
          latitude: 51.5074,
          longitude: -0.1278,
          address: '123 Test St'
        },
        placeId: 'place123',
        totalCheckins: 5,
        averageRating: 4.0,
        createdAt: Timestamp.now()
      };

      const mockQuerySnapshot = {
        empty: false,
        docs: [{
          id: 'pub123',
          data: () => mockPub
        }]
      };

      mockQuery.mockReturnValueOnce({} as any);
      mockWhere.mockReturnValueOnce({} as any);
      mockGetDocs.mockResolvedValueOnce(mockQuerySnapshot as any);

      const result = await getPubByPlaceId('place123');

      expect(result).toEqual({ ...mockPub, id: 'pub123' });
      expect(mockWhere).toHaveBeenCalledWith('placeId', '==', 'place123');
    });

    it('should return null when no pub found', async () => {
      const mockQuerySnapshot = {
        empty: true,
        docs: []
      };

      mockQuery.mockReturnValueOnce({} as any);
      mockWhere.mockReturnValueOnce({} as any);
      mockGetDocs.mockResolvedValueOnce(mockQuerySnapshot as any);

      const result = await getPubByPlaceId('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getPubs', () => {
    it('should return pubs with distances when user location provided', async () => {
      const mockPubs = [
        {
          id: 'pub1',
          name: 'Pub 1',
          location: {
            latitude: 51.5074,
            longitude: -0.1278,
            address: 'Address 1'
          },
          totalCheckins: 10,
          averageRating: 4.0,
          createdAt: Timestamp.now()
        },
        {
          id: 'pub2',
          name: 'Pub 2',
          location: {
            latitude: 51.5080, // Slightly further away
            longitude: -0.1280,
            address: 'Address 2'
          },
          totalCheckins: 5,
          averageRating: 3.5,
          createdAt: Timestamp.now()
        }
      ];

      const mockQuerySnapshot = {
        docs: mockPubs.map(pub => ({
          id: pub.id,
          data: () => pub
        }))
      };

      mockGetDocs.mockResolvedValueOnce(mockQuerySnapshot as any);

      const userLat = 51.5074;
      const userLng = -0.1278;
      const result = await getPubs(userLat, userLng);

      expect(result).toHaveLength(2);
      expect(result[0].distance).toBeDefined();
      expect(result[1].distance).toBeDefined();
      // First pub should be closer (same coordinates)
      expect(result[0].distance).toBeLessThan(result[1].distance!);
    });

    it('should return pubs without distances when no user location', async () => {
      const mockPubs = [
        {
          id: 'pub1',
          name: 'Pub 1',
          location: {
            latitude: 51.5074,
            longitude: -0.1278,
            address: 'Address 1'
          },
          totalCheckins: 10,
          averageRating: 4.0,
          createdAt: Timestamp.now()
        }
      ];

      const mockQuerySnapshot = {
        docs: mockPubs.map(pub => ({
          id: pub.id,
          data: () => pub
        }))
      };

      mockGetDocs.mockResolvedValueOnce(mockQuerySnapshot as any);

      const result = await getPubs();

      expect(result).toHaveLength(1);
      expect(result[0].distance).toBeUndefined();
    });
  });

  describe('addCheckin', () => {
    it('should add checkin and update pub stats', async () => {
      const mockCheckinData = {
        userId: 'user123',
        pubId: 'pub123',
        pubName: 'Test Pub',
        drink: 'Test Beer',
        rating: 5
      };

      const mockPubData = {
        totalCheckins: 5,
        averageRating: 4.0
      };

      // Mock addDoc for checkin
      const mockCheckinRef = { id: 'checkin123' };
      mockAddDoc.mockResolvedValueOnce(mockCheckinRef as any);

      // Mock getDoc for pub
      const mockPubDoc = {
        exists: jest.fn().mockReturnValue(true),
        data: jest.fn().mockReturnValue(mockPubData)
      };
      mockGetDoc.mockResolvedValueOnce(mockPubDoc as any);

      const result = await addCheckin(mockCheckinData);

      expect(mockAddDoc).toHaveBeenCalledWith(
        mockCheckinsRef,
        expect.objectContaining({
          userId: 'user123',
          pubId: 'pub123',
          pubName: 'Test Pub',
          drink: 'Test Beer',
          rating: 5,
          createdAt: expect.anything()
        })
      );
      expect(result).toBe('checkin123');
    });
  });

  describe('updatePubWithImage', () => {
    it('should update pub with image URL', async () => {
      const mockPubRef = { id: 'pub123' };
      mockDoc.mockReturnValueOnce(mockPubRef as any);

      await updatePubWithImage('pub123', 'https://example.com/image.jpg');

      expect(mockUpdateDoc).toHaveBeenCalledWith(
        mockPubRef,
        {
          imageUrl: 'https://example.com/image.jpg'
        }
      );
    });
  });
});