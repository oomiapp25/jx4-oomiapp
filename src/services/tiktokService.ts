/**
 * TikTok Service for Jx4
 * Handles TikTok oEmbed integration to fetch thumbnails and embed codes.
 */

/**
 * TikTok Service for Jx4 - Senior Implementation
 */

export interface TikTokData {
  id: string;
  thumbnail_url: string;
  author_name: string;
  title: string;
}

/**
 * Extrae el ID de TikTok de cualquier formato de URL.
 * Soporta: tiktok.com/@user/video/ID, vm.tiktok.com/ID, etc.
 */
export function extractTikTokId(url: string): string | null {
  try {
    // Caso 1: URL estándar /video/123456789
    const standardMatch = url.match(/\/video\/(\d+)/);
    if (standardMatch) return standardMatch[1];

    // Para URLs cortas (vm.tiktok.com), el ID se obtiene mejor vía oEmbed
    // ya que requiere una redirección que el cliente no siempre puede seguir.
    return null; 
  } catch (e) {
    return null;
  }
}

/**
 * Obtiene metadatos de TikTok vía oEmbed.
 * TikTok permite pasar la URL corta directamente a este endpoint.
 */
export async function fetchTikTokMetadata(url: string): Promise<TikTokData | null> {
  try {
    const response = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`);
    if (!response.ok) throw new Error('TikTok privado o inválido');
    
    const data = await response.json();
    
    // Extraemos el ID del HTML que devuelve oEmbed
    const idMatch = data.html.match(/data-video-id="(\d+)"/);
    const videoId = idMatch ? idMatch[1] : extractTikTokId(url);

    if (!videoId) throw new Error('No se pudo extraer el ID del video');

    return {
      id: videoId,
      thumbnail_url: data.thumbnail_url,
      author_name: data.author_name,
      title: data.title
    };
  } catch (error) {
    console.error('TikTok Fetch Error:', error);
    return null;
  }
}
