import { IRangeParamsResponse } from "@src/entities/Range";
import axios from "axios";

export interface IGetRanges {
  page: number;
  size: number;
  sortBy?: "liquidity" | "earned" | "virtualLiquidity";
  order?: "asc" | "desc";
  search?: string;
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

const rangesService = {
  getRanges: async (params: IGetRanges): Promise<IGetRangesResponse> => {
    const paramsString = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      paramsString.append(key, value.toString());
    });
    const baseUrl = `${process.env.REACT_APP_AGG_API}/stats/v1/statistics/pools/ranged`;
    const url = `${baseUrl}?${paramsString.toString()}`;
    const { data } = await axios.get(url);
    return { ranges: data.pools, totalItems: data.total };
  },
  getRangeByAddress: async (address: string, params?: IGetRange): Promise<IRangeParamsResponse> => {
    const baseUrl = `${process.env.REACT_APP_AGG_API}/stats/v1/statistics/pools/ranged`;
    const rangeUrl = `${baseUrl}/${address}/data`;
    const paramsString = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : "";
    const url = `${rangeUrl}${paramsString}`;
    const { data } = await axios.get(url);
    return data;
  },
};

export default rangesService; 