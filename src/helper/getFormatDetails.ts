import { getSupportedFormats } from './getSupportedFormats';
import { SupportedFormat } from '../types';

/**
 * Returns format details of a supported image format (for example `image/png`).
 * @param mimeType MIME-Type of a supported image format.
 * @returns Format details or null if not found
 */
export function getFormatDetails(mimeType: string): SupportedFormat | null {
  const supportedFormats = getSupportedFormats();

  // Iterate over all supported formats
  for (let i = 0; i < supportedFormats.length; i++) {
    // Format entry
    const f = supportedFormats[i];

    // Check mime type
    if (f.mimeType === mimeType || f.mime_type === mimeType) {
      // Return founded format
      return f;
    }
  }

  return null;
}

export default getFormatDetails;
