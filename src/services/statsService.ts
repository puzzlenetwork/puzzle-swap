import axios from "axios";

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
  classic: { apy: number };
  ultra: { apy: number };
}

type TArtworksResponse = IArtWork[];

const statsService = {
  getStakingStats: async (): Promise<IStakingStatsResponse> => {
    const url = "https://api.puzzleswap.org/stats/staking";
    const { data } = await axios.get(url);
    return data;
  },
  getArtworks: async (): Promise<TArtworksResponse> => {
    const url = "https://api.puzzleswap.org/stats/artworks";
    const { data } = await axios.get(url);
    return data;
  },
};

export default statsService;
