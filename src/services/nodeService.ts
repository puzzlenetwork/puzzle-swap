import axios from "axios";
import { ITransaction } from "@src/utils/types";

export interface IStatsPoolItemResponse {
  apy: number;
  liquidity: number;
  monthly_volume: number;
  weekly_volume: number;
}

export interface IPoolVolume {
  date: number;
  volume: number;
}

interface INodeData {
  key: string;
  type: "integer" | "string";
  value: number | string;
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

const nodeService = {
  getAddressNfts: async (node: string, address: string): Promise<INFT[]> => {
    const url = `${node}/assets/nft/${address}/limit/1000`;
    const { data } = await axios.get(url);
    return data;
  },
  getAddressBalances: async (
    node: string,
    address: string | null
  ): Promise<IBalance[]> => {
    if (address == null) return [];
    const assetsUrl = `${node}/assets/balance/${address}`;
    const wavesUrl = `${node}/addresses/balance/details/${address}`;
    return (
      await Promise.all([
        axios.get(assetsUrl).then(({ data }) => data),
        axios.get(wavesUrl).then(({ data }) => ({
          balances: [{ balance: data.regular, assetId: "WAVES" }],
        })),
      ])
    ).reduce<{ assetId: string; balance: number }[]>(
      (acc, { balances }) => [...acc, ...balances],
      []
    );
  },
  nodeKeysRequest: async (
    node: string,
    contract: string,
    keys: string[] | string
  ): Promise<INodeData[]> => {
    const searchKeys = typeof keys === "string" ? [keys] : keys;
    const search = new URLSearchParams(searchKeys?.map((s) => ["key", s]));
    const keysArray = search.toString();
    const url = `${node}/addresses/data/${contract}?${keysArray}`;
    const response: { data: INodeData[] } = await axios.get(url);
    if (response.data) {
      return response.data;
    } else {
      return [];
    }
  },
  nodeMatchRequest: async (
    node: string,
    contract: string,
    match: string
  ): Promise<INodeData[]> => {
    const url = `${node}/addresses/data/${contract}?matches=${match}`;
    const response: { data: INodeData[] } = await axios.get(url);
    if (response.data) {
      return response.data;
    } else {
      return [];
    }
  },
  transactionInfo: async (
    node: string,
    txId: string
  ): Promise<ITransaction | null> => {
    const url = `${node}/transactions/info/${txId}`;
    const response: { data: ITransaction } = await axios.get(url);
    if (response.data) {
      return response.data;
    } else {
      return null;
    }
  },
  transactions: async (
    node: string,
    address: string,
    limit = 10,
    after?: string
  ): Promise<ITransaction[] | null> => {
    const urlSearchParams = new URLSearchParams();
    if (after != null) {
      urlSearchParams.set("after", after);
    }
    const url = `${node}/transactions/address/${address}/limit/${limit}?${
      after != null ? urlSearchParams.toString() : ""
    }`;
    const response: { data: [ITransaction[]] } = await axios.get(url);
    if (response.data[0]) {
      return response.data[0];
    } else {
      return null;
    }
  },
  assetDetails: async (
    node: string,
    assetId: string
  ): Promise<IAssetDetails | null> => {
    const url = `${node}/assets/details/${assetId}`;
    const response: { data: IAssetDetails } = await axios.get(url);
    if (response.data) {
      return response.data;
    } else {
      return null;
    }
  },
};

export default nodeService;
