const PAIR_PREFIX = "pairlogo::";
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
