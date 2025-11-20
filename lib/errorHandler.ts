// lib/errorHandler.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public userFriendly?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const handleFirebaseError = (error: any): AppError => {
  console.error('Firebase Error:', error);
  
  if (error.code) {
    switch (error.code) {
      case 'permission-denied':
        return new AppError(
          error.message,
          'PERMISSION_DENIED',
          'You do not have permission to perform this action.'
        );
      case 'unavailable':
        return new AppError(
          error.message,
          'SERVICE_UNAVAILABLE',
          'Service is temporarily unavailable. Please try again.'
        );
      case 'not-found':
        return new AppError(
          error.message,
          'NOT_FOUND',
          'The requested data was not found.'
        );
      default:
        return new AppError(
          error.message,
          'FIREBASE_ERROR',
          'A database error occurred. Please try again.'
        );
    }
  }
  
  return new AppError(
    error.message || 'Unknown error occurred',
    'UNKNOWN_ERROR',
    'An unexpected error occurred.'
  );
};

export const handleApiError = (error: any): AppError => {
  console.error('API Error:', error);
  
  if (error.message?.includes('Network request failed')) {
    return new AppError(
      error.message,
      'NETWORK_ERROR',
      'Network connection failed. Please check your internet connection.'
    );
  }
  
  if (error.status === 404) {
    return new AppError(
      error.message,
      'API_NOT_FOUND',
      'The service is currently unavailable.'
    );
  }
  
  return new AppError(
    error.message || 'API request failed',
    'API_ERROR',
    'Failed to fetch data. Please try again.'
  );
};