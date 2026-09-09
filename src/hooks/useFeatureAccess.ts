import { isFeatureAllowed, TGatedFeature } from "@src/constants/featureAccess";
import { useStores } from "@stores";

/**
 * Whether the connected account may see a gated feature. Read it inside an
 * `observer` component so it re-evaluates when the user connects or switches
 * accounts.
 */
export const useFeatureAccess = (feature: TGatedFeature): boolean => {
  const { accountStore } = useStores();
  return isFeatureAllowed(feature, [accountStore.address, accountStore.smartAccountAddress, accountStore.ethAddress]);
};
