const STORAGE_KEY = "puzzle-user-settings";
const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const PUBLIC_KEY_LENGTH = 44;

export interface IUserSettings {
  slippage: number;
  customNode?: string;
  backendUrl?: string;
  customPublicKey?: string;
}

export const isValidPublicKey = (key: string): boolean => {
  if (!key) return true;
  if (key.length !== PUBLIC_KEY_LENGTH) return false;
  return key.split("").every((char) => BASE58_ALPHABET.includes(char));
};

export const getUserSettings = (): IUserSettings | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const getCustomPublicKey = (): string | null => {
  const settings = getUserSettings();
  const key = settings?.customPublicKey?.trim();
  if (key && isValidPublicKey(key)) {
    return key;
  }
  return null;
};

export const getSlippage = (): number => {
  const settings = getUserSettings();
  return settings?.slippage ?? 1;
};

export const saveUserSettings = (settings: IUserSettings): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
};
