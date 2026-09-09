/**
 * Address gating for features that are not ready for everyone yet.
 *
 * This is a visibility gate, not a security boundary: the check runs in the
 * browser and the underlying contracts stay reachable without the UI. Use it to
 * roll a feature out gradually, never to protect anything.
 */

export type TGatedFeature = "dca";

export interface IFeatureAccess {
  /** When false the feature is open to everyone and the list below is ignored. */
  whitelistEnabled: boolean;
  /** Waves addresses (and/or ETH addresses for MetaMask logins) allowed to see the feature. */
  addresses: string[];
}

const parseAddressList = (raw?: string): string[] =>
  (raw ?? "")
    .split(",")
    .map((address) => address.trim())
    .filter((address) => address.length > 0);

export const FEATURE_ACCESS: Record<TGatedFeature, IFeatureAccess> = {
  dca: {
    whitelistEnabled: true,
    addresses: [
      // add addresses here, or set REACT_APP_DCA_WHITELIST=addr1,addr2 at build time
      ...parseAddressList(process.env.REACT_APP_DCA_WHITELIST),
    ],
  },
};

/** ETH addresses are compared case-insensitively, Waves addresses are base58 and are not. */
const matches = (allowed: string, address: string): boolean =>
  allowed === address || allowed.toLowerCase() === address.toLowerCase();

export const isFeatureAllowed = (feature: TGatedFeature, addresses: Array<string | null | undefined>): boolean => {
  const access = FEATURE_ACCESS[feature];
  if (!access.whitelistEnabled) return true;

  const owned = addresses.filter((address): address is string => address != null && address.length > 0);
  if (owned.length === 0) return false;

  return access.addresses.some((allowed) => owned.some((address) => matches(allowed, address)));
};
