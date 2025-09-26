export const domainToUrlSafe = (domain: string): string => {
  return encodeURIComponent(domain.replace(/\s+/g, '-'));
};

export const urlSafeToDomain = (urlSafeDomain: string): string => {
  const decoded = decodeURIComponent(urlSafeDomain);
  return decoded.replace(/-([^-]+)$/, ' $1');
};

export const urlSafeToOriginalDomain = (urlSafeDomain: string): string => {
  const decoded = decodeURIComponent(urlSafeDomain);
  if (decoded.includes('/')) {
    return decoded;
  }
  const parts = decoded.split('-');

  if (parts.length <= 2) {
    return decoded;
  }
  if (parts.length === 3) {
    return `${parts[0]}-${parts[1]} ${parts[2]}`;
  }

  if (parts.length > 3) {
    const tokenPair = `${parts[0]}-${parts[1]}`;
    const description = parts.slice(2).join(' ');
    return `${tokenPair} ${description}`;
  }
  
  return decoded;
};