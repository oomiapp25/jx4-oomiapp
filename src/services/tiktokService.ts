/**
 * TikTok Service for Jx4
 * Handles TikTok oEmbed integration to fetch thumbnails and embed codes.
 */

export interface TikTokOEmbedResponse {
  thumbnail_url: string;
  author_name: string;
  author_url: string;
  html: string;
  title: string;
}

/**
 * Fetches TikTok oEmbed data for a given URL.
 * @param tiktokUrl The full URL of the TikTok video.
 * @returns The oEmbed response or null if it fails.
 */
export async function getTikTokOEmbed(tiktokUrl: string): Promise<TikTokOEmbedResponse | null> {
  try {
    // TikTok oEmbed endpoint
    const endpoint = `https://www.tiktok.com/oembed?url=${encodeURIComponent(tiktokUrl)}`;
    
    // In a real browser environment, this might hit CORS issues.
    // Usually, this would be proxied through a server-side route.
    // For now, we'll try to fetch it directly.
    const response = await fetch(endpoint);
    
    if (!response.ok) {
      throw new Error('Failed to fetch TikTok oEmbed data');
    }
    
    return await response.ok ? response.json() : null;
  } catch (error) {
    console.error('Error fetching TikTok oEmbed:', error);
    return null;
  }
}

/**
 * Extracts the video ID from a TikTok URL if needed, 
 * though oEmbed usually takes the full URL.
 */
export function extractTikTokId(url: string): string | null {
  const match = url.match(/\/video\/(\d+)/);
  return match ? match[1] : null;
}
