// lib/utils/placesTest.ts
export const testPlacesPhotoAccess = async (photoReference: string): Promise<boolean> => {
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    console.error('❌ No Google Places API key found');
    return false;
  }

  const testUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=100&photoreference=${photoReference}&key=${apiKey}`;
  
  try {
    const response = await fetch(testUrl);
    console.log('🔍 Photo API Response Status:', response.status);
    console.log('🔍 Photo API Response OK:', response.ok);
    console.log('🔍 Photo API Response URL:', response.url);
    
    if (response.ok) {
      console.log('✅ Photo API access is working!');
      return true;
    } else {
      console.log('❌ Photo API access failed with status:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Photo API test error:', error);
    return false;
  }
};