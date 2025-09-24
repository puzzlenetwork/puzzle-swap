export const normalizeUrl = (url: string): string => {
  let normalizedUrl = url.trim();
  if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
    normalizedUrl = 'https://' + normalizedUrl;
  }
  if (normalizedUrl.endsWith('/')) {
    normalizedUrl = normalizedUrl.slice(0, -1);
  }
  
  return normalizedUrl;
};

export const getBackendApiUrl = (): string => {
  const storageData = localStorage.getItem("puzzle-user-settings");
  if (storageData) {
    const settings = JSON.parse(storageData);
    if (settings.backendUrl && settings.backendUrl.trim()) {
      return normalizeUrl(settings.backendUrl);
    }
  }

  return process.env.REACT_APP_AGG_API || '';
};