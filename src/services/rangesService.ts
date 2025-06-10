import { IRangeParams } from "@src/entities/Range";
import axios from "axios";

export interface IGetRanges {
  page: number;
  size: number;
  sortBy?: "liquidity" | "earned" | "virtualLiquidity";
  order?: "asc" | "desc";
  search?: string;
}


export interface IGetRangesResponse {
  ranges: IRangeParams[];
  totalItems: number;
}

const rangesService = {
  getRanges: async (params: IGetRanges): Promise<IGetRangesResponse> => {
    const paramsString = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      paramsString.append(key, value.toString());
    });
    const url = `${process.env.REACT_APP_AGG_API}/stats/v1/statistics/pools/ranged?${paramsString.toString()}`;
    console.log("url", url);
    const { data } = await axios.get(url);
    console.log("data", data);
    return { ranges: data.pools, totalItems: data.total };
  },
  getRangeByAddress: async (address: string): Promise<IRangeParams> => {
    const url = `${process.env.REACT_APP_AGG_API}/stats/v1/statistics/pools/ranged/${address}/data`;
    const { data } = await axios.get(url);
    return data;
  },
};

export default rangesService; 