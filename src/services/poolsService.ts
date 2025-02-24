import axios from "axios";
import { TPoolState } from "@stores/PoolsStore";
import { IBoostings, IPoolConfig, IPoolConfigStatistics, IPoolStats } from "@src/constants";
import { stat } from "fs";

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
}

const poolService = {
  getPoolByDomain: async (domain: string): Promise<IPoolSettings> => {
    const req = `${process.env.REACT_APP_API_BASE}/api/v1/pools/${domain}`;
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
    const params = new URLSearchParams({ 
      size: data.size.toString(),
      page: data.page.toString(),
    });
    if (data?.timeRange) {
      params.append('timeRange', data.timeRange);
    }
    if (data?.sortBy) {
      params.append('sortBy', data.sortBy)
    }
    if (data?.order) {
      params.append('order', data.order)
    }
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
