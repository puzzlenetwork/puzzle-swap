import nodeService from "@src/services/nodeService";
import { CONTRACT_ADDRESSES, NODE_URL } from "@src/constants";

export default async function checkDomainPaid(domain: string, address: string) {
  const checkDomainPaid = await nodeService.nodeKeysRequest(
    NODE_URL,
    CONTRACT_ADDRESSES.createArtefacts,
    `domain_${domain}_purchasedBy`
  );
  return checkDomainPaid.some(({ value }) => value === address);
}
