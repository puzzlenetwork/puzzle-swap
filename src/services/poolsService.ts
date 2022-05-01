import axios from "axios";

interface IAssetConfig {
  assetId: string;
  share: number;
}

interface IPoolSettings {
  domain: string;
  image: string;
  swapFee: number;
  owner: string;
  assets: IAssetConfig[];
  title: string;
  artefactOriginTransactionId: string;
}

export interface IPool {
  domain: string;
  title: string;
  contractAddress: string;
  layer2Address?: string;
  baseTokenId: string;
  assets: IAssetConfig[];
  logo: string;
  artefactOriginTransactionId?: string;
  isCustom?: boolean;
  owner?: string;
}

const poolService = {
  getPuzzlePools: async (): Promise<IPoolSettings[]> => {
    await axios.get(`${process.env.REACT_APP_API_BASE}/api/v1/pools`);
    return [];
  },
  getPoolByDomain: async (domain: string): Promise<IPoolSettings> => {
    const req = `${process.env.REACT_APP_API_BASE}/api/v1/pools/${domain}`;
    const { data } = await axios.get(req);
    return data;
  },
  checkDomain: async (domain: string): Promise<boolean> => {
    await axios(`${process.env.REACT_APP_API_BASE}/api/v1/pools/check-domain`, {
      method: "POST",
      headers: { "Content-type": "application/json" },
      data: { domain },
    });
    return true;
  },
  createPool: async (data: IPoolSettings): Promise<boolean> => {
    await axios(
      `${process.env.REACT_APP_API_BASE}/api/v1/pools/pool/${data.domain}`,
      {
        method: "POST",
        headers: { "Content-type": "application/json" },
        data,
      }
    );
    return true;
  },
  getPools: async (): Promise<IPool[]> => {
    const { data } = await axios.get(
      `${process.env.REACT_APP_API_BASE}/api/v1/pools`
    );
    return data;
  },
};
export default poolService;
