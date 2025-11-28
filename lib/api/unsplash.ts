import { createApi } from 'unsplash-js';
import { ImageSearchResult } from '@/types/collage';

if (!process.env.UNSPLASH_ACCESS_KEY) {
  throw new Error('UNSPLASH_ACCESS_KEY environment variable is required');
}

const unsplash = createApi({
  accessKey: process.env.UNSPLASH_ACCESS_KEY,
});

export async function searchImages(query: string, perPage: number = 20): Promise<ImageSearchResult[]> {
  try {
    const result = await unsplash.search.getPhotos({
      query,
      page: 1,
      perPage,
      orientation: 'squarish',
    });

    if (result.type === 'error') {
      throw new Error(result.errors[0]);
    }

    return result.response.results.map(image => ({
      id: image.id,
      url: image.urls.small,
      fullUrl: image.urls.regular,
      alt: image.alt_description || query,
      photographer: image.user.name,
      photographerUrl: image.user.links.html,
    }));
  } catch (error) {
    console.error('Unsplash search error:', error);
    return [];
  }
}

export async function trackDownload(downloadUrl: string): Promise<void> {
  try {
    await fetch(downloadUrl);
  } catch (error) {
    console.error('Failed to track download:', error);
  }
}
