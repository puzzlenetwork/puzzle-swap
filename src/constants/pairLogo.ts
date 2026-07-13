const PAIR_PREFIX = "pairlogo::";
const MULTI_PREFIX = "multilogo::";
const PAIR_DELIMITER = "::";

export interface PairLogo {
  left: string;
  right: string;
}

/**
 * Encodes two token logo URLs into a single sentinel string so that a paired
 * (Puzzle Range index) token can carry both halves through the regular string
 * `logo` field used everywhere in the app. Icon components detect the sentinel
 * and render a split "cut in half and combine" icon (Uniswap-style).
 */
export function makePairLogo(left: string, right: string): string {
  return `${PAIR_PREFIX}${encodeURIComponent(left)}${PAIR_DELIMITER}${encodeURIComponent(right)}`;
}

export function parsePairLogo(src?: string | null): PairLogo | null {
  if (!src || !src.startsWith(PAIR_PREFIX)) return null;
  const [left, right] = src.slice(PAIR_PREFIX.length).split(PAIR_DELIMITER);
  if (!left || !right) return null;
  return { left: decodeURIComponent(left), right: decodeURIComponent(right) };
}

/**
 * Encodes N token logo URLs into a single sentinel string. Icon components
 * detect it and render the icon split into N equal pie slices (e.g. a 3-token
 * Puzzle Range pool -> three-way "pie" icon).
 */
export function makeMultiLogo(logos: string[]): string {
  return `${MULTI_PREFIX}${logos.map(encodeURIComponent).join(PAIR_DELIMITER)}`;
}

/**
 * Returns the list of logo URLs for a paired (2) or multi (N) sentinel string,
 * or null for a plain single logo. Unifies pair and multi handling for icons.
 */
export function parseLogoGroup(src?: string | null): string[] | null {
  if (!src) return null;
  if (src.startsWith(MULTI_PREFIX)) {
    const parts = src
      .slice(MULTI_PREFIX.length)
      .split(PAIR_DELIMITER)
      .filter(Boolean)
      .map(decodeURIComponent);
    return parts.length >= 2 ? parts : null;
  }
  const pair = parsePairLogo(src);
  return pair ? [pair.left, pair.right] : null;
}
