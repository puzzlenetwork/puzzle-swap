import { IGlobalRangesInfoResponse, ILPDataResponse, IRangeParamsResponse } from "@src/entities/Range";
import BN from "@src/utils/BN";
import { IHistory } from "@src/utils/types";
import axios from "axios";

export interface IGetTokensStats {
  allowed?: "true" | "false";
}

export interface IBackendTokenStatsResponse {
  asset_id: string;
  name: string;
  allowed: boolean;
  symbol: string;
  decimals: number;
  description?: string;
  price: number;
  start_price: number;
  category: string[];
}

export class TokenStatisticsFromBackend {
  assetId: string;
  name: string;
  allowed: boolean;
  symbol: string;
  decimals: BN;
  description?: string;
  price: BN;
  startPrice: BN;
  category: string[];

  constructor(params: IBackendTokenStatsResponse) {
    this.assetId = params.asset_id;
    this.name = params.name;
    this.allowed = params.allowed;
    this.symbol = params.symbol;
    this.decimals = new BN(params.decimals);
    this.description = params.description;
    this.price = new BN(params.price);
    this.startPrice = new BN(params.start_price);
    this.category = params.category;
  }
}

const tokensService = {
  getRanges: async (params?: IGetTokensStats): Promise<IBackendTokenStatsResponse[]> => {
    const baseUrl = `${process.env.REACT_APP_AGG_API}/stats/v1/statistics/tokens`;
    const paramsString = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : "";
    const url = `${baseUrl}${paramsString}`;
    const { data } = await axios.get(url);
    return data;
  },
};

export default tokensService;
