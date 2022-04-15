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
}

const poolService = {
  getPuzzlePools: async (): Promise<IPoolSettings[]> => {
    await axios.get(`${process.env.REACT_APP_API_BASE}/api/v1/pools`);
    return [];
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
};
export default poolService;
