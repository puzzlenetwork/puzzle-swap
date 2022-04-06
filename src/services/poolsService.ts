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
}

const poolService = {
  getPuzzlePools: async (): Promise<IPoolSettings[]> => {
    await axios.get("https://localhost:5000/api/v1/pools");
    return [];
  },
  checkDomain: async (domain: string): Promise<boolean> => {
    await axios("http://localhost:5000/api/v1/pools/check-domain", {
      method: "POST",
      headers: { "Content-type": "application/json" },
      data: { domain },
    });
    return true;
  },
  createPool: async (settings: IPoolSettings): Promise<boolean> => {
    await axios(`http://localhost:5000/api/v1/pools/pool/${settings.domain}`, {
      method: "POST",
      headers: { "Content-type": "application/json" },
      data: { settings },
    });
    return true;
  },
};
export default poolService;
