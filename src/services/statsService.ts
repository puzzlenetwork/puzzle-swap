import axios from "axios";
import * as process from "process";

export interface IArtWork {
  floorPrice?: number;
  marketPrice?: number;
  name?: string;
  imageLink?: string;
  marketLink?: string;
  typeId?: string;
  apy?: number;
  old?: boolean;
}

export interface IStakingStatsResponse {
  stakingApy: string;
  ultraApy: string;
}

type TArtworksResponse = IArtWork[];

const statsService = {
  getStakingStats: async (): Promise<IStakingStatsResponse> => {
    console.log(process.env.REACT_APP_API_BASE);
    const url = `${process.env.REACT_APP_API_BASE}/api/v1/stats`;
    const { data } = await axios.get(url);
    return data;
  },
  getArtworks: async (): Promise<TArtworksResponse> => {
    // const url = `${process.env.REACT_APP_AGGR_API}/stats/artworks`;
    const url = `https://waves.puzzle-aggr-api.com/stats/artworks`;
    const { data } = await axios.get(url);
    return data;
  },
};

export default statsService;
