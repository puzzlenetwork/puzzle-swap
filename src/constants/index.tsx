import tokens from "./tokens.json";
import nftsPics from "@src/constants/nftsPics";
import tokenLogos from "@src/constants/tokenLogos";

export const ROUTES = {
  ROOT: "/",
  NOT_FOUND: "/404",
  STAKE: "/stake",
  TRADE: "/trade",
  INVEST: "/invest",
  ULTRASTAKE: "/ultrastake",
  WALLET: "/wallet",
  TRANSFER: "/transfer",
  POOLS_WITHDRAW: "/pools/:poolDomain/withdraw",
  POOLS_ADD_LIQUIDITY: "/pools/:poolDomain/addLiquidity",
  POOLS_ADD_ONE_TOKEN: "/pools/:poolDomain/addOneToken",
  POOLS_INVEST: "/pools/:poolDomain/invest",
  POOLS_CREATE: "/pools/create",
  POOL_SWAP: "/pools/:poolDomain",
};

export const TOKENS = tokens;
export const POOL_CONFIG: IPoolConfig[] = [
  {
    domain: "pool10",
    contractAddress: "3PLiXyywNThdvf3vVEUxwc7TJTucjZvuegh",
    layer2Address: "3P4oa7KAvocZhPXQ1B6ncAopzLEZUtMwbHF",
    baseTokenId: tokens.BTC.assetId,
    title: "Pool 10",
    logo: tokenLogos.BTC,
    defaultAssetId0: tokens.BTC.assetId,
    defaultAssetId1: tokens.USDN.assetId,
    tokens: [
      { ...tokens.WAVES, share: 25, logo: tokenLogos.WAVES },
      { ...tokens.BTC, share: 25, logo: tokenLogos.BTC },
      { ...tokens.ETH, share: 25, logo: tokenLogos.ETH },
      { ...tokens.USDN, share: 25, logo: tokenLogos.USDN },
    ],
  },
  {
    domain: "nsbt",
    contractAddress: "3PEStCRPQuW3phthTtQ5upGeb4WZ47kssyM",
    layer2Address: "3PD7yAzyCEMNBnXzE8AuSsqogHUpSLjwAYA",
    baseTokenId: tokens.NSBT.assetId,
    title: "sNSBT/NSBT pool",
    logo: tokenLogos.SNSBT,
    defaultAssetId0: tokens.SNSBT.assetId,
    defaultAssetId1: tokens.NSBT.assetId,
    tokens: [
      { ...tokens.SNSBT, share: 75, logo: tokenLogos.SNSBT },
      { ...tokens.NSBT, share: 20, logo: tokenLogos.NSBT },
      { ...tokens.USDN, share: 5, logo: tokenLogos.USDN },
    ],
  },
  {
    domain: "www",
    contractAddress: "3PAviuHPCX8fD7M5fGpFTQZb4HchWCJb3ct",
    layer2Address: "3PFF8UuNfvAGk6KvgyeD4HfZ4TRmHgtgt5W",
    baseTokenId: tokens.WX.assetId,
    title: "WWW Pool 🔥",
    logo: tokenLogos.WX,
    defaultAssetId0: tokens.WX.assetId,
    defaultAssetId1: tokens.USDN.assetId,
    tokens: [
      { ...tokens.WX, share: 60, logo: tokenLogos.WX },
      { ...tokens.WCT, share: 10, logo: tokenLogos.WCT },
      { ...tokens.WEST, share: 10, logo: tokenLogos.WEST },
      { ...tokens.USDN, share: 20, logo: tokenLogos.USDN },
    ],
  },
  {
    domain: "sheg",
    contractAddress: "3PC87Z4vUzet6tTrTQmzJmW1UtouKjLhBJi",
    layer2Address: "3PJvGRBaL5FrK5tHax6cJvkZWrHtDUmiDdF",
    baseTokenId: tokens.SHEG.assetId,
    title: "Ducklization IDO Pool",
    logo: tokenLogos.SHEG,
    defaultAssetId0: tokens.SHEG.assetId,
    defaultAssetId1: tokens.USDN.assetId,
    tokens: [
      { ...tokens.SHEG, share: 50, logo: tokenLogos.SHEG },
      { ...tokens.USDN, share: 25, logo: tokenLogos.USDN },
      { ...tokens.WAVES, share: 13, logo: tokenLogos.WAVES },
      { ...tokens.EGG, share: 12, logo: tokenLogos.EGG },
    ],
  },
  {
    domain: "muna",
    contractAddress: "3P9EydokbUM5XFrHgEUT9bNVgfF7fGmtxLk",
    layer2Address: "3PLAM86Pm7jR3RTe7JSit2FDf8DnhF8ogG6",
    baseTokenId: tokens.MUNA.assetId,
    title: "Muna BNB Pool",
    logo: tokenLogos.MUNA,
    defaultAssetId0: tokens.MUNA.assetId,
    defaultAssetId1: tokens.BNB.assetId,
    tokens: [
      { ...tokens.MUNA, share: 50, logo: tokenLogos.MUNA },
      { ...tokens.BNB, share: 25, logo: tokenLogos.BNB },
      { ...tokens.USDN, share: 25, logo: tokenLogos.USDN },
    ],
  },
  {
    domain: "winter",
    contractAddress: "3PEZe3Z2FqaVbMTjWJUpnQGxhWh2JRptujM",
    layer2Address: "3PNBamg45irg9R58gMBM6UvBaUhX5bVys2r",
    baseTokenId: tokens.USDN.assetId,
    title: "Warm Winter Pool ❄️",
    logo: tokenLogos.USDC,
    defaultAssetId0: tokens.EURN.assetId,
    defaultAssetId1: tokens.USDN.assetId,
    tokens: [
      { ...tokens.USDC, share: 30, logo: tokenLogos.USDC },
      { ...tokens.USDT, share: 10, logo: tokenLogos.USDT },
      { ...tokens.USDN, share: 20, logo: tokenLogos.USDN },
      { ...tokens.PUZZLE, share: 22, logo: tokenLogos.PUZZLE },
      { ...tokens.VIRES, share: 8, logo: tokenLogos.VIRES },
      { ...tokens.EURN, share: 10, logo: tokenLogos.EURN },
    ],
  },
  {
    domain: "defi",
    contractAddress: "3PDrYPF6izza2sXWffzTPF7e2Fcir2CMpki",
    layer2Address: "3PJAg4A4gPQXtSLKQNAf5VxbXV2QVM9wPei",
    baseTokenId: tokens.USDN.assetId,
    title: "Waves DeFi Pool 🔹",
    logo: tokenLogos.WAVES,
    defaultAssetId0: tokens.EGG.assetId,
    defaultAssetId1: tokens.USDN.assetId,
    tokens: [
      { ...tokens.WAVES, share: 20, logo: tokenLogos.WAVES },
      { ...tokens.EGG, share: 10, logo: tokenLogos.EGG },
      { ...tokens.SWOP, share: 5, logo: tokenLogos.SWOP },
      { ...tokens.VIRES, share: 5, logo: tokenLogos.VIRES },
      { ...tokens.NSBT, share: 5, logo: tokenLogos.NSBT },
      { ...tokens.ENNO, share: 5, logo: tokenLogos.ENNO },
      { ...tokens.SIGN, share: 5, logo: tokenLogos.SIGN },
      { ...tokens.PUZZLE, share: 20, logo: tokenLogos.PUZZLE },
      { ...tokens.USDT, share: 10, logo: tokenLogos.USDT },
      { ...tokens.USDN, share: 15, logo: tokenLogos.USDN },
    ],
  },
  {
    domain: "farms",
    contractAddress: "3PPRHHF9JKvDLkAc3aHD3Kd5tRZp1CoqAJa",
    layer2Address: "3PDVDYZiwJzK3pu8vcknuLiKCYBPx6XZntG",
    baseTokenId: tokens.EGG.assetId,
    title: "Pool Farms 1",
    logo: tokenLogos.EGG,
    defaultAssetId0: tokens.MATH.assetId,
    defaultAssetId1: tokens.USDN.assetId,
    tokens: [
      {
        ...tokens.DUXPLORER,
        share: 10,
        logo: tokenLogos.DUXPLORER,
      },
      { ...tokens.MATH, share: 10, logo: tokenLogos.MATH },
      { ...tokens.TURTLE, share: 10, logo: tokenLogos.TURTLE },
      {
        ...tokens.EGGSEGGS,
        share: 10,
        logo: tokenLogos.EGGSEGGS,
      },
      {
        ...tokens.PESOLATINO,
        share: 10,
        logo: tokenLogos.PESOLATINO,
      },
      { ...tokens.FOMO, share: 10, logo: tokenLogos.FOMO },
      { ...tokens.MUNDO, share: 10, logo: tokenLogos.MUNDO },
      {
        ...tokens.EGGPOINT,
        share: 10,
        logo: tokenLogos.EGGPOINT,
      },
      { ...tokens.EGG, share: 10, logo: tokenLogos.EGG },
      { ...tokens.USDN, share: 10, logo: tokenLogos.USDN },
    ],
  },
  {
    domain: "farms2",
    contractAddress: "3PKYPKJPHZENAAwH9e7TF5edDgukNxxBt3M",
    layer2Address: "3PLNxoMJYKzcA8qQ7hQidGDaUJNvM4w36nj",
    baseTokenId: tokens.EGG.assetId,
    title: "Pool Farms 2",
    logo: tokenLogos.EGG,
    defaultAssetId0: tokens.MARVIN.assetId,
    defaultAssetId1: tokens.USDN.assetId,
    tokens: [
      { ...tokens.ENDO, share: 10, logo: tokenLogos.ENDO },
      { ...tokens.MARVIN, share: 10, logo: tokenLogos.MARVIN },
      { ...tokens.EGGMOON, share: 10, logo: tokenLogos.EGGMOON },
      { ...tokens.STREET, share: 10, logo: tokenLogos.STREET },
      { ...tokens.KOLKHOZ, share: 10, logo: tokenLogos.KOLKHOZ },
      { ...tokens.FORKLOG, share: 10, logo: tokenLogos.FORKLOG },
      { ...tokens.CGU, share: 10, logo: tokenLogos.CGU },
      { ...tokens.EGG, share: 20, logo: tokenLogos.EGG },
      { ...tokens.USDN, share: 10, logo: tokenLogos.USDN },
    ],
  },
  {
    domain: "race",
    contractAddress: "3PNK5ypnPJioLmLUzfK6ezpaePHLxZd6QLj",
    layer2Address: "3PQSAdwsdyPVVpfBwjtgXboVXUZgeYHycWM",
    baseTokenId: tokens.USDN.assetId,
    title: "Race Mega Pool 🚜",
    logo: tokenLogos.RACE,
    defaultAssetId0: tokens.RACE.assetId,
    defaultAssetId1: tokens.USDN.assetId,
    tokens: [
      { ...tokens.EGG, share: 40, logo: tokenLogos.EGG },
      { ...tokens.RACE, share: 40, logo: tokenLogos.RACE },
      { ...tokens.USDN, share: 20, logo: tokenLogos.USDN },
    ],
  },
  {
    domain: "egg",
    contractAddress: "3PMHkdVCzeLAYuCh92FPtusuxdLk5xMB51y",
    layer2Address: "3P84BhX5dCVs1TCgYnGa57kCHrMz4mUBXyE",
    baseTokenId: tokens.EGG.assetId,
    title: "Egg Uneven Pool 🥚",
    logo: tokenLogos.EGG,
    defaultAssetId0: tokens.USDN.assetId,
    defaultAssetId1: tokens.EGG.assetId,
    tokens: [
      { ...tokens.EGG, share: 80, logo: tokenLogos.EGG },
      { ...tokens.USDN, share: 20, logo: tokenLogos.USDN },
    ],
  },
  {
    domain: "puzzle",
    contractAddress: "3PFDgzu1UtswAkCMxqqQjbTeHaX4cMab8Kh",
    baseTokenId: tokens.USDN.assetId,
    title: "Puzzle Pool",
    logo: tokenLogos.PUZZLE,
    defaultAssetId0: tokens.PUZZLE.assetId,
    defaultAssetId1: tokens.USDN.assetId,
    tokens: [
      { ...tokens.USDT, share: 10, logo: tokenLogos.USDT },
      { ...tokens.PUZZLE, share: 80, logo: tokenLogos.PUZZLE },
      { ...tokens.USDN, share: 10, logo: tokenLogos.USDN },
    ],
  },
];
export const CONTRACT_ADDRESSES = {
  staking: "3PFTbywqxtFfukX3HyT881g4iW5K4QL3FAS",
  ultraStaking: "3PKUxbZaSYfsR7wu2HaAgiirHYwAMupDrYW",
  aggregator: "3PGFHzVGT4NTigwCKP1NcwoXkodVZwvBuuU",
  nfts: "3PFQjjDMiZKQZdu5JqTHD7HwgSXyp9Rw9By",
  createArtefacts: "3P2wMCDjtxeLdfQrpR8WUe5zNeScM4UaL3o",
};
export const PUZZLE_NTFS = [
  {
    name: "Puzzle Surf",
    desc: "Puzzle Surf artefact can be used to launch a custom pool on Puzzle Swap (PuzzleSwap.org).",
    image: nftsPics.SURF,
  },
  {
    name: "Puzzle Desert",
    desc: "Puzzle Desert artefact can be used to launch a custom pool on Puzzle Swap (PuzzleSwap.org).",
    image: nftsPics.DESERT,
  },
  {
    name: "Puzzle Airplane",
    desc: "Puzzle Airplane artefact can be used to launch a custom pool on Puzzle Swap (PuzzleSwap.org).",
    image: nftsPics.AIRPLANE,
  },
  {
    name: "Puzzle Wheel",
    desc: "Puzzle Wheel artefact can be used to launch a custom pool on Puzzle Swap (PuzzleSwap.org).",
    image: nftsPics.WHEEL,
  },
  {
    name: "Puzzle Khalifa",
    desc: "Puzzle Khalifa artefact can be used to launch a custom pool on Puzzle Swap (PuzzleSwap.org).",
    image: nftsPics.KHALIFA,
  },
];

export const NODE_URL = "https://nodes-puzzle.wavesnodes.com";
export const EXPLORER_URL = "https://new.wavesexplorer.com";

export const SLIPPAGE = 0.95; //if puzzle slippage = 0
export const TRADE_FEE = 0.95;
export type TTokenCategory = "global" | "stable" | "defi" | "ducks";

export interface IToken {
  assetId: string;
  name: string;
  symbol: string;
  decimals: number;
  logo: string;
  category?: string[];
}

export interface IPoolConfig {
  domain: string;
  isCustom?: boolean;
  contractAddress: string;
  layer2Address?: string;
  baseTokenId: string;
  title: string;
  defaultAssetId0: string;
  defaultAssetId1: string;
  tokens: Array<IToken & { share: number }>;
  poolTokenName?: string;
  logo?: string;
}
