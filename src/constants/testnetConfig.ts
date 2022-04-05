import testnetTokens from "./testnetTokens.json";
import tokenLogos from "@src/assets/tokens/tokenLogos";
import { IPoolConfig } from "@src/constants/index";

export { testnetTokens };

export enum TESTNET_POOL_ID {
  farmsPool1 = "farms",
}

export const TESTNET_ROUTES = {
  ROOT: "/",
  STAKE: "/stake",
  TRADE: "/trade",
  INVEST: "/invest",
  ULTRASTAKE: "/ultrastake",
  WALLET: "/wallet",
  TRANSFER: "/transfer",
  POOLS: "pools/:poolId",
  POOLS_CREATE: "pools/create",
  POOLS_WITHDRAW: "/pools/withdraw/:cardId",
  POOLS_ADD_LIQUIDITY: "/pools/addLiquidity/:cardId",
  withdraw: {
    farms: `${TESTNET_POOL_ID.farmsPool1}/withdraw`,
  },
  pools: {
    farms: TESTNET_POOL_ID.farmsPool1,
  },
  addLiquidity: {
    farms: `${TESTNET_POOL_ID.farmsPool1}/addLiquidity`,
  },
  addOneToken: {
    // farms: `${MAINNET_POOL_ID.farmsPool1}/addOneToken`,
  },
  invest: {
    // farms: `${MAINNET_POOL_ID.farmsPool1}/invest`,
  },
};

export const TESTNET_POOL_CONFIG: Record<TESTNET_POOL_ID, IPoolConfig> = {
  [TESTNET_POOL_ID.farmsPool1]: {
    contractAddress: "3MwvyoYUQzKNQvLL24b3WyoD4EAfBxgTANQ",
    baseTokenId: "",
    name: "Farms 1",
    defaultAssetId0: testnetTokens.USDN.assetId,
    defaultAssetId1: testnetTokens.WAVES.assetId,
    tokens: [
      { ...testnetTokens.PUZZLE, logo: tokenLogos.PUZZLE, shareAmount: 0.2 },
      { ...testnetTokens.USDN, logo: tokenLogos.USDN, shareAmount: 0.4 },
      { ...testnetTokens.WAVES, logo: tokenLogos.WAVES, shareAmount: 0.4 },
    ],
  },
};

export const TESTNET_CONTRACTS_ADDRESSES = {
  staking: "",
  ultraStaking: "",
  aggregator: "",
  nfts: "",
  createArtefacts: "",
};

export const TESTNET_PUZLLE_NFTS = [
  {
    name: "Puzzle Surf",
    desc: "Puzzle Surf artefact can be used to launch a custom pool on Puzzle Swap (PuzzleSwap.org).",
    image: "http://ipfs.io/ipfs/QmUawQhPVhPitBSRtgd6ZKurseYJ3QWYUhYmV23PS2qL4Y",
  },
  {
    name: "Puzzle Desert",
    desc: "Puzzle Desert artefact can be used to launch a custom pool on Puzzle Swap (PuzzleSwap.org).",
    image: "http://ipfs.io/ipfs/Qma7Beh9pPkRhgK6WNMQKLHahQDKeKRp5myjv2mx1zv1zm",
  },
  {
    name: "Puzzle Airplane",
    desc: "Puzzle Airplane artefact can be used to launch a custom pool on Puzzle Swap (PuzzleSwap.org).",
    image: "http://ipfs.io/ipfs/QmNTzzdvBx658hiCVvHNGS4FsRk8ZhAgYwezH6Q9QEKy7K",
  },
  {
    name: "Puzzle Wheel",
    desc: "Puzzle Wheel artefact can be used to launch a custom pool on Puzzle Swap (PuzzleSwap.org).",
    image: "http://ipfs.io/ipfs/QmTvN5sAC2ka4qtLjSd2vWQ4NqYJD8Qo8cJiChd8QjYNC5",
  },
  {
    name: "Puzzle Khalifa",
    desc: "Puzzle Khalifa artefact can be used to launch a custom pool on Puzzle Swap (PuzzleSwap.org).",
    image: "http://ipfs.io/ipfs/QmckDMscnuYp8shr3NxqbeDJ82V6c1UvWP1ecPAfMkSv2D",
  },
];
