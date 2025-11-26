// __tests__/lib/errorHandler.test.ts
import { AppError, handleFirebaseError, handleApiError } from '@/lib/errorHandler';

describe('Error Handler', () => {
  describe('AppError', () => {
    it('should create an AppError with correct properties', () => {
      const error = new AppError('Test message', 'TEST_CODE', 'User friendly message');
      
      expect(error.message).toBe('Test message');
      expect(error.code).toBe('TEST_CODE');
      expect(error.userFriendly).toBe('User friendly message');
      expect(error.name).toBe('AppError');
    });

    it('should create AppError with default values', () => {
      const error = new AppError('Test message');
      
      expect(error.message).toBe('Test message');
      expect(error.code).toBeUndefined();
      expect(error.userFriendly).toBeUndefined();
    });
  });

  describe('handleFirebaseError', () => {
    it('should handle permission denied error', () => {
      const firebaseError = { code: 'permission-denied', message: 'Permission denied' };
      const result = handleFirebaseError(firebaseError);
      
      expect(result.code).toBe('PERMISSION_DENIED');
      expect(result.userFriendly).toBe('You do not have permission to perform this action.');
      expect(result.message).toBe('Permission denied');
    });

    it('should handle unavailable error', () => {
      const firebaseError = { code: 'unavailable', message: 'Service unavailable' };
      const result = handleFirebaseError(firebaseError);
      
      expect(result.code).toBe('SERVICE_UNAVAILABLE');
      expect(result.userFriendly).toBe('Service is temporarily unavailable. Please try again.');
    });

    it('should handle not-found error', () => {
      const firebaseError = { code: 'not-found', message: 'Not found' };
      const result = handleFirebaseError(firebaseError);
      
      expect(result.code).toBe('NOT_FOUND');
      expect(result.userFriendly).toBe('The requested data was not found.');
    });

    it('should handle unknown Firebase error', () => {
      const firebaseError = { code: 'unknown-code', message: 'Unknown error' };
      const result = handleFirebaseError(firebaseError);
      
      expect(result.code).toBe('FIREBASE_ERROR');
      expect(result.userFriendly).toBe('A database error occurred. Please try again.');
    });

    it('should handle error without code', () => {
      const firebaseError = { message: 'Generic error' };
      const result = handleFirebaseError(firebaseError);
      
      expect(result.code).toBe('UNKNOWN_ERROR');
      expect(result.userFriendly).toBe('An unexpected error occurred.');
    });

    it('should handle empty error object', () => {
      const firebaseError = {};
      const result = handleFirebaseError(firebaseError);
      
      expect(result.code).toBe('UNKNOWN_ERROR');
      expect(result.userFriendly).toBe('An unexpected error occurred.');
    });
  });

  describe('handleApiError', () => {
    it('should handle network errors', () => {
      const apiError = { message: 'Network request failed' };
      const result = handleApiError(apiError);
      
      expect(result.code).toBe('NETWORK_ERROR');
      expect(result.userFriendly).toBe('Network connection failed. Please check your internet connection.');
    });

    it('should handle 404 errors', () => {
      const apiError = { status: 404, message: 'Not found' };
      const result = handleApiError(apiError);
      
      expect(result.code).toBe('API_NOT_FOUND');
      expect(result.userFriendly).toBe('The service is currently unavailable.');
    });

    it('should handle generic API errors', () => {
      const apiError = { message: 'API request failed' };
      const result = handleApiError(apiError);
      
      expect(result.code).toBe('API_ERROR');
      expect(result.userFriendly).toBe('Failed to fetch data. Please try again.');
    });

    it('should handle error without message', () => {
      const apiError = {};
      const result = handleApiError(apiError);
      
      expect(result.code).toBe('API_ERROR');
      expect(result.userFriendly).toBe('Failed to fetch data. Please try again.');
    });
  });
});