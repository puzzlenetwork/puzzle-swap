import axios from "axios";
import { TPoolState } from "@stores/PoolsStore";
import { IBoostings, IPoolConfig, IPoolConfigStatistics, IPoolStats } from "@src/constants";
import { stat } from "fs";
import { IHistory } from "@src/utils/types";

export interface IAssetConfig {
  asset_id: string,
  share: number,
  balance?: number,
  real_balance?: number,
  name?: string
}

export interface IStakingStatsResponse {
  stakingApy: string;
  aniaApy: string;
  eagleApy: string;
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
  address: string;
  layer2Address?: string;
  baseTokenId: string;
  title: string;
  assets: Array<IAssetConfig>;
  logo: string;
  artefactOriginTransactionId?: string;
  owner: string;
}

export interface IGetPools {
  timeRange?: "1d" | "7d" | "30d" | "90d" | "1y" | "all";
  sortBy?: "apr" | "liquidity" | "volume";
  order?: "asc" | "desc";
  page: number;
  size: number;
  title?: string;
  version?: string
}

const poolService = {
  getPoolByDomain: async (domain: string): Promise<IPoolSettings> => {
    const req = `${process.env.REACT_APP_API_BASE}/api/v1/pools/${domain}`;
    const { data } = await axios.get(req);
    return data;
  },
  getPoolChartByDomain: async (address: string): Promise<IHistory[]> => {
    const params = new URLSearchParams({ 
      timeRange: "all",
    });
    const req = `${process.env.REACT_APP_AGG_API}/stats/v1/statistics/pools/${address}/charts?${params.toString()}`;
    const { data } = await axios.get(req);
    return data;
  },
  updateStats: async (domain: string): Promise<void> => {
    await axios(
      `${process.env.REACT_APP_API_BASE}/api/v1/pools/update-stats/${domain}`,
      {
        method: "POST",
        headers: { "Content-type": "application/json" },
        data: { domain },
      }
    );
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
  getPools: async (data: IGetPools): Promise<{ pools: Array<IPoolConfig & { stats: IPoolStats, assets: IAssetConfig[], liquidity: number, boostings: IBoostings }>, totalItems: number }> => {
    const params = new URLSearchParams();
    Object.entries(data).forEach(([key, value]) => {
      params.append(key, value);
    });
    const { data: statsData } = await axios.get(
      `${process.env.REACT_APP_AGG_API}/stats/v1/statistics/pools/all?${params.toString()}`
    );
    return {pools: statsData.pools, totalItems: statsData.total};
  },
  getStats: async (): Promise<IStakingStatsResponse> => {
    const { data } = await axios.get(
      `${process.env.REACT_APP_API_BASE}/api/v1/stats`
    );
    return data;
  },
  getPoolsStateByUserAddress: async (
    address?: string | null
  ): Promise<TPoolState[]> => {
    const req = `${process.env.REACT_APP_API_BASE}/api/v1/state/${
      address ?? ""
    }`;
    const { data } = await axios.get(req);
    return data;
  },
  checkCustomPoolLimit: async (): Promise<boolean> => {
    const req = `${process.env.REACT_APP_API_BASE}/api/v1/pools/limit`;
    const { data } = await axios.get(req);
    return data.isLimited;
  },
};
export default poolService;
