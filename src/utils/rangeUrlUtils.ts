// Utility functions for converting range domains to URL-safe format and back

/**
 * Converts a range domain to URL-safe format by encoding slashes and spaces
 * @param domain - The original range domain (e.g., "ranges/BURN/Mega/details" or "R-U symmetric")
 * @returns URL-safe domain (e.g., "ranges%2FBURN%2FMega%2Fdetails" or "R-U-symmetric")
 */
export const domainToUrlSafe = (domain: string): string => {
  return encodeURIComponent(domain.replace(/\s+/g, '-'));
};

/**
 * Converts a URL-safe domain back to the original format
 * @param urlSafeDomain - The URL-safe domain (e.g., "ranges%2FBURN%2FMega%2Fdetails" or "R-U-symmetric") 
 * @returns Original domain (e.g., "ranges/BURN/Mega/details" or "R-U symmetric")
 */
export const urlSafeToDomain = (urlSafeDomain: string): string => {
  const decoded = decodeURIComponent(urlSafeDomain);
  // Handle the specific case of ranges that already have dashes
  // We need to be careful not to replace legitimate dashes
  // For now, we'll assume the last dash in a multi-dash sequence represents a space
  return decoded.replace(/-([^-]+)$/, ' $1');
};

/**
 * More sophisticated conversion that handles multiple words and slashes
 * This function attempts to intelligently convert URL-safe domains back to original format
 * @param urlSafeDomain - The URL-safe domain (encoded)
 * @returns Original domain with proper spacing and slashes
 */
export const urlSafeToOriginalDomain = (urlSafeDomain: string): string => {
  // First decode any URI encoding (this handles slashes and other special characters)
  const decoded = decodeURIComponent(urlSafeDomain);
  
  // If the decoded string contains slashes, return it as-is (it's likely a path)
  if (decoded.includes('/')) {
    return decoded;
  }
  
  // Handle common patterns for range domains without slashes
  // Pattern 1: "R-U-symmetric" -> "R-U symmetric"
  // Pattern 2: "BTC-USDT-range" -> "BTC-USDT range"
  // Pattern 3: "simple-range" -> "simple range"
  
  const parts = decoded.split('-');
  
  // If only one or two parts, return as-is (e.g., "R" or "R-U")
  if (parts.length <= 2) {
    return decoded;
  }
  
  // Check if it looks like a token pair pattern (e.g., "BTC-USDT-symmetric")
  // We'll assume the last part after the second dash is the descriptive word
  if (parts.length === 3) {
    // For 3-part domains like "R-U-symmetric" or "BTC-USDT-range"
    return `${parts[0]}-${parts[1]} ${parts[2]}`;
  }
  
  // For longer domains, keep first two parts connected and join the rest with spaces
  if (parts.length > 3) {
    const tokenPair = `${parts[0]}-${parts[1]}`;
    const description = parts.slice(2).join(' ');
    return `${tokenPair} ${description}`;
  }
  
  return decoded;
};