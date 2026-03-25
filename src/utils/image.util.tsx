/**
 * Normalizes an image path to an absolute Cloudflare R2 URL.
 * Maps legacy local storage paths to the Cloudflare bucket.
 *
 * @param {string | null | undefined} imagePath - The path to the image
 * @returns {string} The normalized URL or an empty string if nothing is provided
 */
export function getImageUrl(imagePath?: string | null): string {
  if (!imagePath) return '';

  // If already fully qualified, return untouched
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Strip leading '/public/', '/uploads/' and '/'
  const rawFileName = imagePath
    .replace(/^\/(public|uploads)\//, '')
    .replace(/^\//, '');

  // Get the public domain from environment variables, or use the default R2 dev domain
  const publicDomain = process.env.NEXT_PUBLIC_R2_DOMAIN || 'https://pub-b15ba39a844442478b781f47b6e00e99.r2.dev';
  const cleanDomain = publicDomain.endsWith('/') ? publicDomain.slice(0, -1) : publicDomain;

  return `${cleanDomain}/${rawFileName}`;
}
