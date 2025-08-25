import { IGlobalRangesInfoResponse, ILPDataResponse, IRangeParamsResponse } from "@src/entities/Range";
import { IHistory } from "@src/utils/types";
import axios from "axios";

export interface IGetRanges {
  page: number;
  size: number;
  sortBy?: "fact_liquidity" | "earned" | "virtual_liquidity";
  order?: "asc" | "desc";
  search?: string;
  userAddress?: string;
}

export interface IGetGlobalRangesInfo {
  minLiquidity: number;
  userAddress?: string;
  active?: boolean;
}

export interface IGetRange {
  startTime?: number;
  endTime?: number;
  nominatePriceIn?: string;
  user?: string;
  charts?: boolean;
}

export interface IGetRangesResponse {
  ranges: IRangeParamsResponse[];
  totalItems: number;
}

export interface IGetChartData {
  startTime?: number;
  endTime?: number;
  nominatePriceIn?: string;
}

export interface IStakingStatistics {
  asset_id: string;
  name: string;
  group: "common" | "index";
  apr_1d: number;
  apr_7d: number;
  apr_30d: number;
  apr_1y: number;
}

export interface IProvidedAssetResponse {
  asset_id: string;
  name: string;
  leverage: number;
  earned_amount: number;
  earned_amount_usd: number;
  provided_amount: number;
  provided_amount_usd: number;
}

export interface IProvidedResponse {
  provider_address: string;
  pool_address: string;
  pool_mode: string;
  index_staked: number;
  share: number;
  provided_usd: number;
  claimed_usd: number;
  unclaimed_usd: number;
  lp_token_id?: string;
  lp_token_price: number;
  lp_token_market_price: number;
  lp_token_name?: string;
  lp_token_domain: string;
  assets_data: IProvidedAssetResponse[];
}

const rangesService = {
  getRanges: async (params: IGetRanges): Promise<IGetRangesResponse> => {
    const paramsString = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      value !== undefined && paramsString.append(key, value.toString());
    });
    const baseUrl = `${process.env.REACT_APP_AGG_API}/stats/v1/statistics/pools/ranged`;
    const url = `${baseUrl}?${paramsString.toString()}`;
    const { data } = await axios.get(url);
    return { ranges: data.pools, totalItems: data.total };
  },
  getGlobalRangesInfo: async (params: IGetGlobalRangesInfo): Promise<IGlobalRangesInfoResponse> => {
    const baseUrl = `${process.env.REACT_APP_AGG_API}/stats/v1/statistics/pools/global_info`;
    const paramsString = new URLSearchParams({
      poolMode: "ranged",
    });
    Object.entries(params).forEach(([key, value]) => {
      value !== undefined && paramsString.append(key, value.toString());
    });
    const url = `${baseUrl}?${paramsString.toString()}`;
    const { data } = await axios.get(url);
    return data;
  },
  // Lightweight availability probe for a specific range by address.
  // Returns true when the endpoint responds with 200, false on 500 (not ready yet).
  // Any other network error will be treated as not available for now (retry logic handled by caller).
  pingRange: async (address: string): Promise<boolean> => {
    const baseUrl = `${process.env.REACT_APP_AGG_API}/stats/v1/statistics/pools/ranged`;
    const url = `${baseUrl}/${address}/data`;
    try {
      const res = await axios.get(url);
      return res.status === 200;
    } catch (e: any) {
      if (e?.response?.status === 500) return false;
      return false;
    }
  },
  getRangeByAddress: async (address: string, params?: IGetRange): Promise<IRangeParamsResponse> => {
    const baseUrl = `${process.env.REACT_APP_AGG_API}/stats/v1/statistics/pools/ranged`;
    const rangeUrl = `${baseUrl}/${address}/data`;
    const paramsString = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : "";
    const url = `${rangeUrl}${paramsString}`;
    const { data } = await axios.get(url);
    return data;
  },
  getLPData: async (address: string, userAddress: string, force?: boolean): Promise<ILPDataResponse> => {
    const baseUrl = `${process.env.REACT_APP_AGG_API}/stats/v1/statistics/pools/provided_data`;
    const paramsString = new URLSearchParams({
      poolAddress: address,
      userAddress: userAddress,
      poolMode: "ranged",
      page: "1",
      size: "1",
      force: force ? "true" : "false"
    });
    const url = `${baseUrl}?${paramsString.toString()}`;
    const { data } = await axios.get(url);
    return data.data[0];
  },
  getChartData: async (address: string, params?: IGetChartData): Promise<IHistory[]> => {
    const baseUrl = `${process.env.REACT_APP_AGG_API}/stats/v1/statistics/pools/ranged`;
    const rangeUrl = `${baseUrl}/${address}/charts`;
    const paramsString = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : "";
    const url = `${rangeUrl}${paramsString}`;
    const { data } = await axios.get(url);
    return data.charts;
  },
  getUserTotalProvided: async (userAddress: string): Promise<number> => {
    const baseUrl = `${process.env.REACT_APP_AGG_API}/stats/v1/statistics/pools/provided_data`;
    const paramsString = new URLSearchParams({
      userAddress: userAddress,
      poolMode: "ranged",
      page: "1",
      size: "500"
    });
    const url = `${baseUrl}?${paramsString.toString()}`;
    const { data } = await axios.get(url);
    return data.total_provided_usd;
  },
  getUserInvestments: async (userAddress: string): Promise<IProvidedResponse[]> => {
    const baseUrl = `${process.env.REACT_APP_AGG_API}/stats/v1/statistics/pools/provided_data`;
    const paramsString = new URLSearchParams({
      userAddress: userAddress,
      poolMode: "ranged",
      page: "1",
      size: "500"
    });
    const url = `${baseUrl}?${paramsString.toString()}`;
    const { data } = await axios.get(url);
    return data.data;
  },
  getStakingStatistics: async (group?: "common" | "index"): Promise<IStakingStatistics[]> => {
    const baseUrl = `${process.env.REACT_APP_AGG_API}/stats/v1/statistics/pools/aprs`;
    const paramsString = new URLSearchParams({
      page: "1",
      size: "500",
      ...(group ? { group } : {})
    });
    const url = `${baseUrl}?${paramsString.toString()}`;
    const { data } = await axios.get(url);
    return data.data;
  }
};

export default rangesService;
