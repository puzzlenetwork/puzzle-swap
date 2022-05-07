import axios from "axios";

interface IAssetConfig {
  assetId: string;
  share: number;
}

interface ICreatePoolData {
  domain: string;
  image: string;
  swapFee: number;
  owner: string;
  assets: IAssetConfig[];
  title: string;
  artefactOriginTransactionId: string;
}

interface IPoolSettings {
  domain: string;
  isCustom?: boolean;
  contractAddress: string;
  layer2Address?: string;
  baseTokenId: string;
  title: string;
  defaultAssetId0: string;
  defaultAssetId1: string;
  assets: Array<IAssetConfig>;
  poolTokenName?: string;
  logo: string;
  artefactOriginTransactionId?: string;
  owner: string;
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
  createPool: async (data: ICreatePoolData): Promise<boolean> => {
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
  getPools: async (): Promise<IPoolSettings[]> => {
    const { data } = await axios.get(
      `${process.env.REACT_APP_API_BASE}/api/v1/pools`
    );
    return data;
  },
};
export default poolService;
