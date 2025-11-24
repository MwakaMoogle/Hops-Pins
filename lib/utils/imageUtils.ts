// lib/utils/imageUtils.ts
export const testImageUrl = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url);
    return response.ok;
  } catch (error) {
    console.log('❌ Image URL test failed:', url, error);
    return false;
  }
};

export const isValidGooglePhotoUrl = (url: string): boolean => {
  return url.includes('maps.googleapis.com/maps/api/place/photo');
};