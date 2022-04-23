import nodeService from "@src/services/nodeService";
import { NODE_URL_MAP } from "@src/constants";
import { MAINNET_CONTRACTS_ADDRESSES } from "@src/constants/mainnetConfig";

export default async function checkDomainPaid(domain: string, address: string) {
  const checkDomainPaid = await nodeService.nodeKeysRequest(
    NODE_URL_MAP.W,
    MAINNET_CONTRACTS_ADDRESSES.createArtefacts,
    `domain_${domain}_purchasedBy`
  );
  return checkDomainPaid.some(({ value }) => value === address);
}
