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
  getGlobalRangesInfo: async (): Promise<IGlobalRangesInfoResponse> => {
    const baseUrl = `${process.env.REACT_APP_AGG_API}/stats/v1/statistics/pools/global_info`;
    const paramsString = new URLSearchParams({
      poolMode: "ranged"
    });
    const url = `${baseUrl}?${paramsString.toString()}`;
    const { data } = await axios.get(url);
    return data;
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
