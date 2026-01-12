import { IEvaluateScript, ITransaction } from "@src/utils/types";
import makeNodeRequest from "@src/utils/makeNodeRequest";
import { CONTRACT_ADDRESSES } from "@src/constants";

const DRY_RUN_CONTRACT = CONTRACT_ADDRESSES.dryRun;

export interface INodeData {
  key: string;
  type: "integer" | "string";
  value: number | string;
}

export interface IAsset {
  assetId: string;
  issueHeight: number;
  issueTimestamp: number;
  issuer: string;
  issuerPublicKey: string;
  name: string;
  description: string;
  decimals: number;
  reissuable: boolean;
  quantity: number;
  scripted: boolean;
  minSponsoredAssetFee: null | number;
  originTransactionId: string;
}

export interface INFT {
  assetId: string;
  decimals: number;
  description: string;
  issueHeight: number;
  issueTimestamp: number;
  issuer: string;
  issuerPublicKey: string;
  minSponsoredAssetFee: null | any;
  name: string;
  originTransactionId: string;
  quantity: number;
  reissuable: boolean;
  scripted: boolean;
  typeId?: string;
}

interface IBalance {
  assetId: string;
  balance: number;
}

interface IAssetDetails {
  assetId: string;
  issueHeight: number;
  issueTimestamp: number;
  issuer: string;
  issuerPublicKey: string;
  name: string;
  description: string;
  decimals: number;
  reissuable: boolean;
  quantity: number;
  scripted: boolean;
  minSponsoredAssetFee: null | any;
  originTransactionId: string;
}

export interface IDryRunResult {
  success: boolean;
  estimatedOut?: string;
  height?: string;
  error?: string;
}

const nodeService = {
  blocksHeight: async (): Promise<{ height: number }> => {
    const url = `/blocks/height`;
    const { data } = await makeNodeRequest(url);
    return data;
  },
  getAddressNfts: async (address: string): Promise<INFT[]> => {
    const url = `/assets/nft/${address}/limit/1000`;
    const { data } = await makeNodeRequest(url);
    return data;
  },
  evaluate: async (address: string, expression: string): Promise<IEvaluateScript> => {
    const url = `/utils/script/evaluate/${address}`;
    const { data } = await makeNodeRequest(url, {
      postData: { expr: expression }
    });
    return data;
  },
  getAssetDetails: async (assetId: string): Promise<IAsset | null> => {
    const url = `/assets/details/${assetId}`;
    const { data } = await makeNodeRequest(url);
    return data;
  },
  getAddressBalances: async (address: string | null): Promise<IBalance[]> => {
    if (address == null) return [];
    const assetsUrl = `/assets/balance/${address}`;
    const wavesUrl = `/addresses/balance/details/${address}`;
    return (
      await Promise.all([
        makeNodeRequest(assetsUrl).then(({ data }) => data),
        makeNodeRequest(wavesUrl).then(({ data }) => ({
          balances: [{ balance: data.available, assetId: "WAVES" }]
        }))
      ])
    ).reduce<{ assetId: string; balance: number }[]>((acc, { balances }) => [...acc, ...balances], []);
  },
  nodeKeysRequest: async (contract: string, keys: string[] | string): Promise<INodeData[]> => {
    const searchKeys = typeof keys === "string" ? [keys] : keys;
    const search = new URLSearchParams(searchKeys?.map((s) => ["key", s]));
    const keysArray = search.toString();
    const response = await makeNodeRequest(`/addresses/data/${contract}?${keysArray}`);
    if (response.data) {
      return response.data;
    } else {
      return [];
    }
  },
  getNFTPictures: async (): Promise<INodeData[]> => {
    const response = await makeNodeRequest(`/addresses/data/${CONTRACT_ADDRESSES.nfts}?matches=nft_(.*)_image`);
    if (response.data) {
      return response.data;
    } else {
      return [];
    }
  },
  nodeMatchRequest: async (contract: string, match: string): Promise<INodeData[]> => {
    const url = `/addresses/data/${contract}?matches=${match}`;
    const response: { data: INodeData[] } = await makeNodeRequest(url);
    if (response.data) {
      return response.data;
    } else {
      return [];
    }
  },
  transactionInfo: async (txId: string): Promise<ITransaction | null> => {
    const url = `/transactions/info/${txId}`;
    const response: { data: ITransaction } = await makeNodeRequest(url);
    if (response.data) {
      return response.data;
    } else {
      return null;
    }
  },
  transactions: async (address: string, limit = 10, after?: string): Promise<ITransaction[] | null> => {
    const url = `/transactions/address/${address}/limit/${limit}${after ? `?after=${after}` : ""}`;
    const response: { data: [ITransaction[]] } = await makeNodeRequest(url);
    return response.data[0] ?? null;
  },
  assetDetails: async (assetId: string): Promise<IAssetDetails | null> => {
    const url = `/assets/details/${assetId}`;
    const response: { data: IAssetDetails } = await makeNodeRequest(url);
    if (response.data) {
      return response.data;
    } else {
      return null;
    }
  },

  dryRunSwap: async (
    senderPublicKey: string,
    route: string,
    minToReceive: string,
    tokenOut: string,
    payment: { assetId: string | null; amount: string }
  ): Promise<IDryRunResult> => {
    const url = `/utils/script/evaluate/${DRY_RUN_CONTRACT}`;
    const tx = {
      type: 16,
      version: 2,
      senderPublicKey,
      dApp: DRY_RUN_CONTRACT,
      call: {
        function: "call",
        args: [
          { type: "string", value: route },
          { type: "integer", value: parseInt(minToReceive) },
          { type: "string", value: tokenOut }
        ]
      },
      payment: [{ assetId: payment.assetId, amount: parseInt(payment.amount) }],
      fee: 500000,
      feeAssetId: null,
      proofs: []
    };

    try {
      const { data } = await makeNodeRequest(url, { postData: tx });
      if (data?.message) {
        const okMatch = data.message.match(/OK:\s*(\d+)OK:\s*(\d+)/);
        if (okMatch) {
          return {
            success: true,
            estimatedOut: okMatch[1],
            height: okMatch[2]
          };
        }

        // Check for slippage error
        if (data.message.includes("amount to receive is too low")) {
          const expectedMatch = data.message.match(/expected:\s*(\d+),\s*real\s*(\d+)/);
          return {
            success: false,
            error: expectedMatch
              ? `Slippage error: expected ${expectedMatch[1]}, real ${expectedMatch[2]}`
              : "Slippage error: amount to receive is too low"
          };
        }

        // Other errors
        const errorMatch = data.message.match(/error\s*=\s*([^,\)]+)/);
        return {
          success: false,
          error: errorMatch ? errorMatch[1] : data.message
        };
      }

      return { success: false, error: "Unknown response" };
    } catch (e: any) {
      const message = e?.response?.data?.message || e?.message || "Dry run failed";

      // Try to parse error from response
      const okMatch = message.match(/OK:\s*(\d+)OK:\s*(\d+)/);
      if (okMatch) {
        return {
          success: true,
          estimatedOut: okMatch[1],
          height: okMatch[2]
        };
      }

      return { success: false, error: message };
    }
  }
};

export default nodeService;
