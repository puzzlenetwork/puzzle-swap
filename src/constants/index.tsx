import tokens from "./tokens.json";
import tokensDetails from "./tokenDetails.json";
import nftsPics from "@src/constants/nftsPics";
import tokenLogos from "@src/constants/tokenLogos";
import { IAssetConfig } from "@src/services/poolsService";

export const ROUTES = {
  ROOT: "/",
  NOT_FOUND: "/404",
  STAKE: "/stake",
  TRADE: "/trade",
  LIMIT_ORDER: "/limitOrder",
  OLD_EXPLORE: "/classic-explore",
  EXPLORE: "/explore",
  EXPLORE_TOKEN: "/explore/token/:assetId",
  POOLS: "/pools",
  ULTRASTAKE: "/ultrastake",
  WALLET: "/wallet",
  TRANSFER: "/transfer",
  POOLS_WITHDRAW: "/pools/:poolDomain/withdraw",
  POOLS_ADD_LIQUIDITY: "/pools/:poolDomain/addLiquidity",
  POOLS_ADD_ONE_TOKEN: "/pools/:poolDomain/addOneToken",
  POOLS_INVEST: "/pools/:poolDomain/invest",
  POOLS_CREATE: "/pools/create",
  POOL_SWAP: "/pools/:poolDomain",
  POOL_BOOST: "/pools/:poolDomain/boost",
};

export const PRODUCTS = {
  SWAP: "https://puzzleswap.org/",
  LEND: "https://lend.puzzleswap.org/",
  MARKET: "https://puzzlemarket.org/",
  NODE: "https://lease.puzzleswap.org/",
};

export const TOKEN_DETAILS_BY_SYMBOL: Record<string, string> = tokensDetails;

export const TOKENS_LIST: Array<IToken> = Object.values(tokens).map((t) => ({
  ...t,
  logo: tokenLogos[t.symbol],
}));
export const TOKENS_BY_SYMBOL: Record<string, IToken> = TOKENS_LIST.reduce(
  (acc, t) => ({ ...acc, [t.symbol]: t }),
  {}
);
export const TOKENS_BY_ASSET_ID: Record<string, IToken> = TOKENS_LIST.reduce(
  (acc, t) => ({ ...acc, [t.assetId]: t }),
  {}
);
export const POOL_CONFIG: IPoolConfig[] = [
  {
    domain: "tsunami",
    address: "3PN1eJpdhJyRptcN9iLTarsJBtR2Kb3NXSU",
    layer_2_address: "3P9nxQiTo73ZASrxaVCA7o95gymQbSp7GXf",
    base_token_id: TOKENS_BY_SYMBOL.TSN.assetId,
    title: "Tsunami ILO Pool",
    logo: tokenLogos.TSN,
    defaultAssetId0: TOKENS_BY_SYMBOL.TSN.assetId,
    defaultAssetId1: TOKENS_BY_SYMBOL.XTN.assetId,
    tokens: [
      { ...TOKENS_BY_SYMBOL.TSN, share: 90, logo: tokenLogos.TSN },
      { ...TOKENS_BY_SYMBOL.XTN, share: 10, logo: tokenLogos.XTN },
    ],
    created_at: 0,
    fee_token_id: "",
    isCustom: false,
    last_historical_txId: "",
    last_processed_txId: "",
    last_saved_time: 0,
    lp_token_amount: 0,
    lp_token_id: "",
    owner: "",
    rebalances: [],
    swap_fee: 0,
    version: "",
  },
  {
    domain: "pool10",
    address: "3PLiXyywNThdvf3vVEUxwc7TJTucjZvuegh",
    layer_2_address: "3P4oa7KAvocZhPXQ1B6ncAopzLEZUtMwbHF",
    base_token_id: TOKENS_BY_SYMBOL.BTC-WXG.assetId,
    title: "Pool10",
    logo: tokenLogos.BTC-WXG,
    defaultAssetId0: TOKENS_BY_SYMBOL.BTC-WXG.assetId,
    defaultAssetId1: TOKENS_BY_SYMBOL.XTN.assetId,
    tokens: [
      { ...TOKENS_BY_SYMBOL.WAVES, share: 25, logo: tokenLogos.WAVES },
      { ...TOKENS_BY_SYMBOL.BTC-WXG, share: 25, logo: tokenLogos.BTC-WXG },
      { ...TOKENS_BY_SYMBOL.ETH-WXG, share: 25, logo: tokenLogos.ETH-WXG },
      { ...TOKENS_BY_SYMBOL.XTN, share: 25, logo: tokenLogos.XTN },
    ],
    created_at: 0,
    fee_token_id: "",
    isCustom: false,
    last_historical_txId: "",
    last_processed_txId: "",
    last_saved_time: 0,
    lp_token_amount: 0,
    lp_token_id: "",
    owner: "",
    rebalances: [],
    swap_fee: 0,
    version: "",
  },
  {
    domain: "nsbt",
    address: "3PEStCRPQuW3phthTtQ5upGeb4WZ47kssyM",
    layer_2_address: "3PD7yAzyCEMNBnXzE8AuSsqogHUpSLjwAYA",
    base_token_id: TOKENS_BY_SYMBOL.NSBT.assetId,
    title: "sNSBT/NSBT pool",
    logo: tokenLogos.SNSBT,
    defaultAssetId0: TOKENS_BY_SYMBOL.SNSBT.assetId,
    defaultAssetId1: TOKENS_BY_SYMBOL.NSBT.assetId,
    tokens: [
      { ...TOKENS_BY_SYMBOL.SNSBT, share: 75, logo: tokenLogos.SNSBT },
      { ...TOKENS_BY_SYMBOL.NSBT, share: 20, logo: tokenLogos.NSBT },
      { ...TOKENS_BY_SYMBOL.XTN, share: 5, logo: tokenLogos.XTN },
    ],
    created_at: 0,
    fee_token_id: "",
    isCustom: false,
    last_historical_txId: "",
    last_processed_txId: "",
    last_saved_time: 0,
    lp_token_amount: 0,
    lp_token_id: "",
    owner: "",
    rebalances: [],
    swap_fee: 0,
    version: "",
  },
  // {
  //   domain: "vlad",
  //   contractAddress: "3P98RJpxfwZpNfAcLjLWMnesX65dpW64Rim",
  //   layer2Address: "3PEsmFNhWpPW9AA8Th95hfLWz3bCVY18QAA",
  //   baseTokenId: TOKENS_BY_SYMBOL.VLAD.assetId,
  //   title: "VLAD Pool",
  //   logo: tokenLogos.VLAD,
  //   defaultAssetId0: TOKENS_BY_SYMBOL.VLAD.assetId,
  //   defaultAssetId1: TOKENS_BY_SYMBOL.PUZZLE.assetId,
  //   tokens: [
  //     { ...TOKENS_BY_SYMBOL.VLAD, share: 50, logo: tokenLogos.VLAD },
  //     { ...TOKENS_BY_SYMBOL.PUZZLE, share: 50, logo: tokenLogos.PUZZLE }
  //   ],
  // },
  {
    domain: "vusd",
    address: "3PCq2VqxGMmEyB8gLoUi8KuV9tYSD3VMC74",
    layer_2_address: "3P6oobNcfLt69HMzQC37JAAGBWtrygU4amc",
    base_token_id: TOKENS_BY_SYMBOL.XTN.assetId,
    title: "Vires USD Pool",
    logo: tokenLogos.XTN,
    defaultAssetId0: TOKENS_BY_SYMBOL.VIRES_USDC_LP.assetId,
    defaultAssetId1: TOKENS_BY_SYMBOL.XTN.assetId,
    tokens: [
      {
        ...TOKENS_BY_SYMBOL.VIRES_USDT_LP,
        share: 30,
        logo: tokenLogos.VIRES_USDT_LP,
      },
      {
        ...TOKENS_BY_SYMBOL.VIRES_USDC_LP,
        share: 30,
        logo: tokenLogos.VIRES_USDC_LP,
      },
      { ...TOKENS_BY_SYMBOL.XTN, share: 40, logo: tokenLogos.XTN },
    ],
    created_at: 0,
    fee_token_id: "",
    isCustom: false,
    last_historical_txId: "",
    last_processed_txId: "",
    last_saved_time: 0,
    lp_token_amount: 0,
    lp_token_id: "",
    owner: "",
    rebalances: [],
    swap_fee: 0,
    version: "",
  },
  {
    domain: "www",
    address: "3PAviuHPCX8fD7M5fGpFTQZb4HchWCJb3ct",
    layer_2_address: "3PFF8UuNfvAGk6KvgyeD4HfZ4TRmHgtgt5W",
    base_token_id: TOKENS_BY_SYMBOL.WX.assetId,
    title: "WWW Pool 🔥",
    logo: tokenLogos.WX,
    defaultAssetId0: TOKENS_BY_SYMBOL.WX.assetId,
    defaultAssetId1: TOKENS_BY_SYMBOL.XTN.assetId,
    tokens: [
      { ...TOKENS_BY_SYMBOL.WX, share: 60, logo: tokenLogos.WX },
      { ...TOKENS_BY_SYMBOL.WCT, share: 10, logo: tokenLogos.WCT },
      { ...TOKENS_BY_SYMBOL.WEST, share: 10, logo: tokenLogos.WEST },
      { ...TOKENS_BY_SYMBOL.XTN, share: 20, logo: tokenLogos.XTN },
    ],
    created_at: 0,
    fee_token_id: "",
    isCustom: false,
    last_historical_txId: "",
    last_processed_txId: "",
    last_saved_time: 0,
    lp_token_amount: 0,
    lp_token_id: "",
    owner: "",
    rebalances: [],
    swap_fee: 0,
    version: "",
  },
  {
    domain: "snsbttci",
    address: "3PPrsyW3VuxU15FuBKfbVh5JdmAkmU3ApPv",
    layer_2_address: "3P44Y7if4hZAgUn9K3R7buzb3TQn6NzTcu7",
    base_token_id: TOKENS_BY_SYMBOL.XTN.assetId,
    title: "sNSBT_TCI pool",
    logo: tokenLogos.SNSBTTCI,
    defaultAssetId0: TOKENS_BY_SYMBOL.SNSBTTCI.assetId,
    defaultAssetId1: TOKENS_BY_SYMBOL.SNSBT.assetId,
    tokens: [
      { ...TOKENS_BY_SYMBOL.SNSBTTCI, share: 75, logo: tokenLogos.SNSBTTCI },
      { ...TOKENS_BY_SYMBOL.SNSBT, share: 10, logo: tokenLogos.SNSBT },
      { ...TOKENS_BY_SYMBOL.WAVES, share: 10, logo: tokenLogos.WAVES },
      { ...TOKENS_BY_SYMBOL.XTN, share: 5, logo: tokenLogos.XTN },
    ],
    created_at: 0,
    fee_token_id: "",
    isCustom: false,
    last_historical_txId: "",
    last_processed_txId: "",
    last_saved_time: 0,
    lp_token_amount: 0,
    lp_token_id: "",
    owner: "",
    rebalances: [],
    swap_fee: 0,
    version: "",
  },
  {
    domain: "sheg",
    address: "3PC87Z4vUzet6tTrTQmzJmW1UtouKjLhBJi",
    layer_2_address: "3PJvGRBaL5FrK5tHax6cJvkZWrHtDUmiDdF",
    base_token_id: TOKENS_BY_SYMBOL.SHEG.assetId,
    title: "Ducklization IDO Pool",
    logo: tokenLogos.SHEG,
    defaultAssetId0: TOKENS_BY_SYMBOL.SHEG.assetId,
    defaultAssetId1: TOKENS_BY_SYMBOL.XTN.assetId,
    tokens: [
      { ...TOKENS_BY_SYMBOL.SHEG, share: 50, logo: tokenLogos.SHEG },
      { ...TOKENS_BY_SYMBOL.XTN, share: 25, logo: tokenLogos.XTN },
      { ...TOKENS_BY_SYMBOL.WAVES, share: 13, logo: tokenLogos.WAVES },
      { ...TOKENS_BY_SYMBOL.EGG, share: 12, logo: tokenLogos.EGG },
    ],
    created_at: 0,
    fee_token_id: "",
    isCustom: false,
    last_historical_txId: "",
    last_processed_txId: "",
    last_saved_time: 0,
    lp_token_amount: 0,
    lp_token_id: "",
    owner: "",
    rebalances: [],
    swap_fee: 0,
    version: "",
  },
  {
    domain: "muna",
    address: "3P9EydokbUM5XFrHgEUT9bNVgfF7fGmtxLk",
    layer_2_address: "3PLAM86Pm7jR3RTe7JSit2FDf8DnhF8ogG6",
    base_token_id: TOKENS_BY_SYMBOL.MUNA.assetId,
    title: "Muna BNB Pool",
    logo: tokenLogos.MUNA,
    defaultAssetId0: TOKENS_BY_SYMBOL.MUNA.assetId,
    defaultAssetId1: TOKENS_BY_SYMBOL.BNB.assetId,
    tokens: [
      { ...TOKENS_BY_SYMBOL.MUNA, share: 50, logo: tokenLogos.MUNA },
      { ...TOKENS_BY_SYMBOL.BNB-WXG, share: 25, logo: tokenLogos.BNB-WXG },
      { ...TOKENS_BY_SYMBOL.XTN, share: 25, logo: tokenLogos.XTN },
    ],
    created_at: 0,
    fee_token_id: "",
    isCustom: false,
    last_historical_txId: "",
    last_processed_txId: "",
    last_saved_time: 0,
    lp_token_amount: 0,
    lp_token_id: "",
    owner: "",
    rebalances: [],
    swap_fee: 0,
    version: "",
  },
  {
    domain: "winter",
    address: "3PEZe3Z2FqaVbMTjWJUpnQGxhWh2JRptujM",
    layer_2_address: "3PNBamg45irg9R58gMBM6UvBaUhX5bVys2r",
    base_token_id: TOKENS_BY_SYMBOL.XTN.assetId,
    title: "Warm Winter Pool ❄️",
    logo: tokenLogos.USDC,
    defaultAssetId0: TOKENS_BY_SYMBOL.EURN.assetId,
    defaultAssetId1: TOKENS_BY_SYMBOL.XTN.assetId,
    tokens: [
      { ...TOKENS_BY_SYMBOL.USDC-WXG, share: 30, logo: tokenLogos.USDC-WXG },
      { ...TOKENS_BY_SYMBOL.USDT-WXG, share: 10, logo: tokenLogos.USDT-WXG },
      { ...TOKENS_BY_SYMBOL.XTN, share: 20, logo: tokenLogos.XTN },
      { ...TOKENS_BY_SYMBOL.PUZZLE, share: 22, logo: tokenLogos.PUZZLE },
      { ...TOKENS_BY_SYMBOL.VIRES, share: 8, logo: tokenLogos.VIRES },
      { ...TOKENS_BY_SYMBOL.EURN, share: 10, logo: tokenLogos.EURN },
    ],
    created_at: 0,
    fee_token_id: "",
    isCustom: false,
    last_historical_txId: "",
    last_processed_txId: "",
    last_saved_time: 0,
    lp_token_amount: 0,
    lp_token_id: "",
    owner: "",
    rebalances: [],
    swap_fee: 0,
    version: "",
  },
  {
    domain: "defi",
    address: "3PDrYPF6izza2sXWffzTPF7e2Fcir2CMpki",
    layer_2_address: "3PJAg4A4gPQXtSLKQNAf5VxbXV2QVM9wPei",
    base_token_id: TOKENS_BY_SYMBOL.XTN.assetId,
    title: "Waves DeFi Pool 🔹",
    logo: tokenLogos.WAVES,
    defaultAssetId0: TOKENS_BY_SYMBOL.OLDEGG.assetId,
    defaultAssetId1: TOKENS_BY_SYMBOL.XTN.assetId,
    tokens: [
      { ...TOKENS_BY_SYMBOL.WAVES, share: 20, logo: tokenLogos.WAVES },
      { ...TOKENS_BY_SYMBOL.OLDEGG, share: 10, logo: tokenLogos.OLDEGG },
      { ...TOKENS_BY_SYMBOL.SWOP, share: 5, logo: tokenLogos.SWOP },
      { ...TOKENS_BY_SYMBOL.VIRES, share: 5, logo: tokenLogos.VIRES },
      { ...TOKENS_BY_SYMBOL.NSBT, share: 5, logo: tokenLogos.NSBT },
      { ...TOKENS_BY_SYMBOL.ENNO, share: 5, logo: tokenLogos.ENNO },
      { ...TOKENS_BY_SYMBOL.SIGN, share: 5, logo: tokenLogos.SIGN },
      { ...TOKENS_BY_SYMBOL.PUZZLE, share: 20, logo: tokenLogos.PUZZLE },
      { ...TOKENS_BY_SYMBOL.USDT-WXG, share: 10, logo: tokenLogos.USDT-WXG },
      { ...TOKENS_BY_SYMBOL.XTN, share: 15, logo: tokenLogos.XTN },
    ],
    created_at: 0,
    fee_token_id: "",
    isCustom: false,
    last_historical_txId: "",
    last_processed_txId: "",
    last_saved_time: 0,
    lp_token_amount: 0,
    lp_token_id: "",
    owner: "",
    rebalances: [],
    swap_fee: 0,
    version: "",
  },
  // {
  //   domain: "megapool",
  //   contractAddress: "3PLU2okk1GVdoGW7CGbtCwRqFmHfLhsQimc",
  //   layer2Address: "3P9rH2R75qNGhj9BfHT9t67hnofqLCJKGWx",
  //   baseTokenId: TOKENS_BY_SYMBOL.PUZZLE.assetId,
  //   title: "Mega Pool",
  //   logo: tokenLogos.CRV,
  //   defaultAssetId0: TOKENS_BY_SYMBOL.CRV.assetId,
  //   defaultAssetId1: TOKENS_BY_SYMBOL.DAI.assetId,
  //   tokens: [
  //     { ...TOKENS_BY_SYMBOL.CRV, share: 10, logo: tokenLogos.CRV },
  //     { ...TOKENS_BY_SYMBOL.FTM, share: 10, logo: tokenLogos.FTM },
  //     { ...TOKENS_BY_SYMBOL.YFI, share: 10, logo: tokenLogos.YFI },
  //     { ...TOKENS_BY_SYMBOL.SHIB, share: 10, logo: tokenLogos.SHIB },
  //     { ...TOKENS_BY_SYMBOL.MATIC, share: 10, logo: tokenLogos.MATIC },
  //     { ...TOKENS_BY_SYMBOL.UNI, share: 10, logo: tokenLogos.UNI },
  //     { ...TOKENS_BY_SYMBOL.LINK, share: 10, logo: tokenLogos.LINK },
  //     { ...TOKENS_BY_SYMBOL.TN, share: 10, logo: tokenLogos.TN },
  //     { ...TOKENS_BY_SYMBOL.DAI, share: 10, logo: tokenLogos.DAI },
  //     { ...TOKENS_BY_SYMBOL.PUZZLE, share: 10, logo: tokenLogos.PUZZLE },
  //   ],
  // },
  {
    domain: "farms",
    address: "3PPRHHF9JKvDLkAc3aHD3Kd5tRZp1CoqAJa",
    layer_2_address: "3PDVDYZiwJzK3pu8vcknuLiKCYBPx6XZntG",
    base_token_id: TOKENS_BY_SYMBOL.OLDEGG.assetId,
    title: "Pool Farms 1",
    logo: tokenLogos.OLDEGG,
    defaultAssetId0: TOKENS_BY_SYMBOL.MATH.assetId,
    defaultAssetId1: TOKENS_BY_SYMBOL.XTN.assetId,
    tokens: [
      {
        ...TOKENS_BY_SYMBOL.DUXPLORER,
        share: 10,
        logo: tokenLogos.DUXPLORER,
      },
      { ...TOKENS_BY_SYMBOL.MATH, share: 10, logo: tokenLogos.MATH },
      { ...TOKENS_BY_SYMBOL.TURTLE, share: 10, logo: tokenLogos.TURTLE },
      {
        ...TOKENS_BY_SYMBOL.EGGSEGGS,
        share: 10,
        logo: tokenLogos.EGGSEGGS,
      },
      {
        ...TOKENS_BY_SYMBOL.PESOLATINO,
        share: 10,
        logo: tokenLogos.PESOLATINO,
      },
      { ...TOKENS_BY_SYMBOL.FOMO, share: 10, logo: tokenLogos.FOMO },
      { ...TOKENS_BY_SYMBOL.MUNDO, share: 10, logo: tokenLogos.MUNDO },
      {
        ...TOKENS_BY_SYMBOL.EGGPOINT,
        share: 10,
        logo: tokenLogos.EGGPOINT,
      },
      { ...TOKENS_BY_SYMBOL.OLDEGG, share: 10, logo: tokenLogos.OLDEGG },
      { ...TOKENS_BY_SYMBOL.XTN, share: 10, logo: tokenLogos.XTN },
    ],
    created_at: 0,
    fee_token_id: "",
    isCustom: false,
    last_historical_txId: "",
    last_processed_txId: "",
    last_saved_time: 0,
    lp_token_amount: 0,
    lp_token_id: "",
    owner: "",
    rebalances: [],
    swap_fee: 0,
    version: "",
  },
  {
    domain: "farms2",
    address: "3PKYPKJPHZENAAwH9e7TF5edDgukNxxBt3M",
    layer_2_address: "3PLNxoMJYKzcA8qQ7hQidGDaUJNvM4w36nj",
    base_token_id: TOKENS_BY_SYMBOL.OLDEGG.assetId,
    title: "Pool Farms 2",
    logo: tokenLogos.OLDEGG,
    defaultAssetId0: TOKENS_BY_SYMBOL.MARVIN.assetId,
    defaultAssetId1: TOKENS_BY_SYMBOL.XTN.assetId,
    tokens: [
      { ...TOKENS_BY_SYMBOL.ENDO, share: 10, logo: tokenLogos.ENDO },
      { ...TOKENS_BY_SYMBOL.MARVIN, share: 10, logo: tokenLogos.MARVIN },
      { ...TOKENS_BY_SYMBOL.EGGMOON, share: 10, logo: tokenLogos.EGGMOON },
      { ...TOKENS_BY_SYMBOL.STREET, share: 10, logo: tokenLogos.STREET },
      { ...TOKENS_BY_SYMBOL.KOLKHOZ, share: 10, logo: tokenLogos.KOLKHOZ },
      { ...TOKENS_BY_SYMBOL.FORKLOG, share: 10, logo: tokenLogos.FORKLOG },
      { ...TOKENS_BY_SYMBOL.CGU, share: 10, logo: tokenLogos.CGU },
      { ...TOKENS_BY_SYMBOL.OLDEGG, share: 20, logo: tokenLogos.OLDEGG },
      { ...TOKENS_BY_SYMBOL.XTN, share: 10, logo: tokenLogos.XTN },
    ],
    created_at: 0,
    fee_token_id: "",
    isCustom: false,
    last_historical_txId: "",
    last_processed_txId: "",
    last_saved_time: 0,
    lp_token_amount: 0,
    lp_token_id: "",
    owner: "",
    rebalances: [],
    swap_fee: 0,
    version: "",
  },
  {
    domain: "race",
    address: "3PNK5ypnPJioLmLUzfK6ezpaePHLxZd6QLj",
    layer_2_address: "3PQSAdwsdyPVVpfBwjtgXboVXUZgeYHycWM",
    base_token_id: TOKENS_BY_SYMBOL.XTN.assetId,
    title: "Race Mega Pool 🚜",
    logo: tokenLogos.RACE,
    defaultAssetId0: TOKENS_BY_SYMBOL.RACE.assetId,
    defaultAssetId1: TOKENS_BY_SYMBOL.XTN.assetId,
    tokens: [
      { ...TOKENS_BY_SYMBOL.OLDEGG, share: 40, logo: tokenLogos.OLDEGG },
      { ...TOKENS_BY_SYMBOL.RACE, share: 40, logo: tokenLogos.RACE },
      { ...TOKENS_BY_SYMBOL.XTN, share: 20, logo: tokenLogos.XTN },
    ],
    created_at: 0,
    fee_token_id: "",
    isCustom: false,
    last_historical_txId: "",
    last_processed_txId: "",
    last_saved_time: 0,
    lp_token_amount: 0,
    lp_token_id: "",
    owner: "",
    rebalances: [],
    swap_fee: 0,
    version: "",
  },
  {
    domain: "egg",
    address: "3PMHkdVCzeLAYuCh92FPtusuxdLk5xMB51y",
    layer_2_address: "3P84BhX5dCVs1TCgYnGa57kCHrMz4mUBXyE",
    base_token_id: TOKENS_BY_SYMBOL.OLDEGG.assetId,
    title: "Egg Uneven Pool 🥚",
    logo: tokenLogos.OLDEGG,
    defaultAssetId0: TOKENS_BY_SYMBOL.XTN.assetId,
    defaultAssetId1: TOKENS_BY_SYMBOL.OLDEGG.assetId,
    tokens: [
      { ...TOKENS_BY_SYMBOL.OLDEGG, share: 80, logo: tokenLogos.OLDEGG },
      { ...TOKENS_BY_SYMBOL.XTN, share: 20, logo: tokenLogos.XTN },
    ],
    created_at: 0,
    fee_token_id: "",
    isCustom: false,
    last_historical_txId: "",
    last_processed_txId: "",
    last_saved_time: 0,
    lp_token_amount: 0,
    lp_token_id: "",
    owner: "",
    rebalances: [],
    swap_fee: 0,
    version: "",
  },
  {
    domain: "puzzle",
    address: "3PFDgzu1UtswAkCMxqqQjbTeHaX4cMab8Kh",
    base_token_id: TOKENS_BY_SYMBOL.XTN.assetId,
    title: "Puzzle Pool",
    logo: tokenLogos.PUZZLE,
    defaultAssetId0: TOKENS_BY_SYMBOL.PUZZLE.assetId,
    defaultAssetId1: TOKENS_BY_SYMBOL.XTN.assetId,
    tokens: [
      { ...TOKENS_BY_SYMBOL.USDT-WXG, share: 10, logo: tokenLogos.USDT-WXG },
      { ...TOKENS_BY_SYMBOL.PUZZLE, share: 80, logo: tokenLogos.PUZZLE },
      { ...TOKENS_BY_SYMBOL.XTN, share: 10, logo: tokenLogos.XTN },
    ],
    created_at: 0,
    fee_token_id: "",
    isCustom: false,
    last_historical_txId: "",
    last_processed_txId: "",
    last_saved_time: 0,
    lp_token_amount: 0,
    lp_token_id: "",
    owner: "",
    rebalances: [],
    swap_fee: 0,
    version: "",
  },
];
export const CONTRACT_ADDRESSES = {
  staking: "3PFTbywqxtFfukX3HyT881g4iW5K4QL3FAS",
  ultraStaking: "3PKUxbZaSYfsR7wu2HaAgiirHYwAMupDrYW",
  aggregator: "3PGFHzVGT4NTigwCKP1NcwoXkodVZwvBuuU", // prod
  // aggregator: "3PK1LcCBwbmBZrcDCJsDkXh4USKPxb68Tcw", // Roman's
  nfts: "3PFQjjDMiZKQZdu5JqTHD7HwgSXyp9Rw9By",
  createArtefacts: "3PFkgvC9y6zHy64zEAscKKgaNY3yipiLqbW",
  // boost: "3PAeY7RgwuNUZNscGqahqJxFTFDkh7fbNwJ",
  boost: "3P8eeDzUnoDNbQjW617pAe76cEUDQsP1m1V",
  calcReward: "3PAeY7RgwuNUZNscGqahqJxFTFDkh7fbNwJ",
  // limitOrders: "3PPrfNMnk8z8QhZcqMyJk69mF65s2Rbz3B6", // old
  limitOrders: "3PFB6LJyShsCKEA1AU1U1WLbDazqyj6ZL9b", // new
  proxyLimitOrders: "3PM4Mn2iwQnUkeMxTJJAuriiVEGAcQwDU5H",
  priceOracle: "3P8d1E1BLKoD52y3bQJ1bDTd2TD1gpaLn9t",
};
export const PUZZLE_NFTS = [
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

export const NODE_URL = "https://nodes.wx.network ";
export const EXPLORER_URL = "https://new.wavesexplorer.com";

export interface IToken {
  assetId: string;
  name: string;
  symbol: string;
  decimals: number;
  startPrice?: number;
  description?: string;
  logo: string;
  category?: string[];
}

export interface IBoostings {
  boost_id: string;
  asset_id: string;
  per_day: number;
  days: number;
  finish_timestamp: number;
  per_day_usd: number;
}

export interface IPoolConfigStatistics {
  time_range: string;
  time_frame: string;
  apr: number;
  average_liquidity: number;
  liquidity: number;
  lp_price: number;
  claimed: number;
  pool_fees: number;
  owner_fees: number;
  protocol_fees: number;
  volume: number;
  boostedApy: number | null;
  boostings?: IBoostings[];
  totals?: ITotals;
}

export interface IPoolStats {
  time_range: string;
  time_frame: string;
  apr: number;
  average_liquidity: number;
  lp_price: number;
  claimed: number;
  pool_fees: number;
  owner_fees: number;
  protocol_fees: number;
  volume: number;
}

export interface ITotals {
  volume_all: number;
  pool_fees_all: number;
  owner_fees_all: number;
  protocol_fees_all: number;
  volume_1y: number;
  pool_fees_1y: number;
  owner_fees_1y: number;
  protocol_fees_1y: number;
  volume_90d: number;
  pool_fees_90d: number;
  owner_fees_90d: number;
  protocol_fees_90d: number;
  volume_30d: number;
  pool_fees_30d: number;
  owner_fees_30d: number;
  protocol_fees_30d: number;
  volume_7d: number;
  pool_fees_7d: number;
  owner_fees_7d: number;
  protocol_fees_7d: number;
  volume_1d: number;
  pool_fees_1d: number;
  owner_fees_1d: number;
  protocol_fees_1d: number;
}
export interface IPoolConfig {
  address: string;
  layer_2_address?: string;
  created_at?: number;
  domain: string;
  fee_token_id?: string;
  isCustom?: boolean;
  last_historical_txId?: string;
  last_processed_txId?: string;
  last_saved_time?: number;
  logo?: string;
  lp_token_amount?: number;
  lp_token_id?: string;
  owner?: string;
  rebalances?: [];
  swap_fee?: number;
  title: string;
  version?: string;
  base_token_id: string;
  stats?: IPoolStats;
  assets?: IAssetConfig[];
  defaultAssetId0?: string;
  defaultAssetId1?: string;
  tokens: Array<IToken & { share: number }>;
  boosted_apr?: number;
  artefact_origin_transaction_id?: string;
  totals?: ITotals;
}
