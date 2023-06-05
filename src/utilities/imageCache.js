// ImageCache.js
import CacheUtility from './cacheUtility';

const cacheImage = async (imageUrl) => {
  try {
    const imageData = await CacheUtility.fetchData(imageUrl);
    if (imageData) {
      return imageData;
    }
  } catch (error) {
    console.error('Error caching image:', error);
  }

  return null; // Return null if image caching fails
};

export default cacheImage;
