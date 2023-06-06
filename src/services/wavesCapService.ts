import axios from "axios";
import BN from "@src/utils/BN";

interface IAssetResponse {
  id: string;
  totalSupply: number;
  circulating: number;
  "24h_vol_usdt": number;
  "24h_vol_busd": number;
  precision: number;
  name: string;
  shortcode: string;
  data: {
    firstPrice_busd: number;
    lastPrice_busd: number;
    "firstPrice_usdt-ppt": number;
    "lastPrice_usdt-ppt": number;
  } | null;
}

const wavesCapService = {
  getAssetsStats: async (assetsId: string[]): Promise<IAssetResponse[]> => {
    const params = new URLSearchParams();
    for (let i = 0; i < assetsId.length - 1; i++) {
      params.append("assetIds[]=", assetsId[i]);
    }
    const url = `https://wavescap.com/api/assets-info.php?${params.toString()}`;
    const response = await axios.get(url);
    return response.data.assets != null
      ? response.data.assets.filter((v: any) => v != null)
      : [];
  },
  getAllAssetsStats: async (): Promise<IAssetResponse[]> => {
    const response = await axios.get("https://wavescap.com/api/assets.json");
    return response.data;
  },
  getAssetRate: async (assetsId: string): Promise<BN | null> => {
    const url = `https://wavescap.com/api/asset/${assetsId}.json`;
    const { data: res } = await axios.get<IAssetResponse>(url);
    return res.data && res.data["firstPrice_usdt-ppt"]
      ? new BN(res.data["firstPrice_usdt-ppt"])
      : null;
  },
};
export default wavesCapService;
