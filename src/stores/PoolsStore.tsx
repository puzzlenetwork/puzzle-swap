import { RootStore } from "./index";
import { makeAutoObservable, reaction } from "mobx";
import Pool, { IData, IShortPoolInfo } from "@src/entities/Pool";
import BN from "@src/utils/BN";
import {
  CONTRACT_ADDRESSES,
  POOL_CONFIG,
  TOKENS_BY_ASSET_ID,
  TOKENS_BY_SYMBOL,
} from "@src/constants";
import poolService from "@src/services/poolsService";
import nodeService from "@src/services/nodeService";

export type TPoolState = {
  state: IData[];
  contractAddress: string;
};

export interface ISerializedPoolsStore {
  slippage: number;
}

export default class PoolsStore {
  slippage: number;
  setSlippage = (v: number) =>
    !isNaN(v) && v > 1 && v < 100 && (v ^ 0) === v && (this.slippage = v);

  serialize = (): ISerializedPoolsStore => ({
    slippage: this.slippage,
  });

  constructor(rootStore: RootStore, initialState?: ISerializedPoolsStore) {
    this.rootStore = rootStore;
    this.slippage = initialState?.slippage ?? 5;
    makeAutoObservable(this);
    this.syncPools().then();
    this.syncCustomPools().then(this.updatePoolsState);
    this.updateInvestedInPoolsInfo().then();
    this.syncPuzzleRate().then();
    setInterval(() => {
      this.syncPoolsLiquidity();
      Promise.all([
        this.updateInvestedInPoolsInfo(),
        this.updatePoolsState(),
        this.syncPuzzleRate(),
        this.syncCustomPools(),
      ]);
    }, 15 * 1000);
    reaction(
      () => this.rootStore.accountStore.address,
      () =>
        Promise.all([
          this.updateInvestedInPoolsInfo(true),
          this.updatePoolsState(),
        ])
    );
  }

  public rootStore: RootStore;

  public puzzleRate: BN = BN.ZERO;
  public setPuzzleRate = (value: BN) => (this.puzzleRate = value);

  public usdnRate: BN = BN.ZERO;
  public setUsdnRate = (value: BN) => (this.usdnRate = value);

  get customPools() {
    return this.pools.filter(({ isCustom }) => isCustom);
  }

  get mainPools() {
    return this.pools.filter(({ isCustom }) => !isCustom);
  }

  pools: Pool[] = [];
  setPools = (pools: Pool[]) => (this.pools = pools);
  getPoolByDomain = (domain: string) =>
    this.pools.find((pool) => pool.domain === domain);

  public poolsState: TPoolState[] | null = null;
  private setPoolState = (value: TPoolState[]) => (this.poolsState = value);
  private getStateByAddress = (contractAddress: string) =>
    this.poolsState?.find((v) => v.contractAddress === contractAddress);

  investedInPools: IShortPoolInfo[] | null = null;
  setInvestedInPools = (
    v: IShortPoolInfo[] | null,
    options?: { onlyMain?: boolean; onlyCustom?: boolean }
  ) => {
    if (v == null) {
      this.investedInPools = null;
    } else if (options?.onlyCustom) {
      const mainPoolsInfo = this.investedInPools?.filter(
        ({ pool }) => !pool.isCustom
      );
      this.investedInPools =
        mainPoolsInfo != null ? [...mainPoolsInfo, ...v] : v;
    } else if (options?.onlyMain) {
      const customPoolsInfo = this.investedInPools?.filter(
        ({ pool }) => pool.isCustom
      );
      this.investedInPools =
        customPoolsInfo != null ? [...customPoolsInfo, ...v] : v;
    } else {
      this.investedInPools = v;
    }
  };

  investedInPoolsLoading = false;
  setInvestedInPoolsLoading = (state: boolean) =>
    (this.investedInPoolsLoading = state);

  get liquidity(): Record<string, BN> {
    return this.pools.reduce<Record<string, BN>>(
      (acc, pool) => ({ ...acc, ...pool.liquidity }),
      {}
    );
  }

  get globalVolume(): BN {
    return this.pools.reduce(
      (acc, pool) => acc.plus(pool.globalVolume ?? BN.ZERO),
      BN.ZERO
    );
  }

  usdtRate = (assetId: string, coefficient = 1): BN | null => {
    const usdn = TOKENS_BY_SYMBOL.XTN.assetId;
    const usdt = TOKENS_BY_SYMBOL.USDT.assetId;
    const puzzle = TOKENS_BY_SYMBOL.PUZZLE.assetId;
    const pool = this.pools.find(({ tokens }) =>
      tokens.some((t) => t.assetId === assetId)
    );

    const startPrice = TOKENS_BY_ASSET_ID[assetId]?.startPrice;
    //todo fix this pizdez !!!
    if (pool == null && startPrice != null) {
      return new BN(startPrice ?? 0);
    }
    if (pool == null) return null;
    if (
      pool.currentPrice(assetId, puzzle) == null &&
      pool.tokens.some((t) => t.assetId === puzzle)
    ) {
      return new BN(startPrice ?? 0);
    }
    if (
      pool.currentPrice(assetId, usdt) == null &&
      pool.tokens.some((t) => t.assetId === usdt)
    ) {
      return new BN(startPrice ?? 0);
    }

    if (pool.tokens.some(({ assetId }) => assetId === usdt)) {
      return pool.currentPrice(assetId, usdt, coefficient);
    } else if (pool.tokens.some(({ assetId }) => assetId === puzzle)) {
      const puzzleRate = pool.puzzleRate;
      const priceInPuzzle = pool.currentPrice(assetId, puzzle, coefficient);
      return priceInPuzzle != null ? priceInPuzzle.times(puzzleRate) : null;
    } else if (pool.tokens.some(({ assetId }) => assetId === usdn)) {
      const usdnRate = pool.usdnRate;
      const priceInUSDN = pool.currentPrice(assetId, usdn);
      return priceInUSDN != null
        ? priceInUSDN.times(usdnRate)
        : new BN(startPrice ?? 0);
    } else {
      //todo check all tokens like this
      return null;
    }
  };

  syncPools = async () => {
    const pools = Object.values(POOL_CONFIG).map(
      (pool) => new Pool({ ...pool, isCustom: false })
    );
    this.setPools(pools);
    await Promise.all(this.pools.map((pool) => pool.syncLiquidity()));
  };

  syncCustomPools = async () => {
    const configs = await poolService.getPools();
    const newPools: Array<Pool> = [];
    configs.forEach((config) => {
      const pool = this.getPoolByDomain(config.domain);
      if (pool != null && config.statistics != null) {
        pool.setStatistics(config.statistics);
      }
      if (config.isCustom && pool == null) {
        const tokens = config.assets.map(({ assetId, share }) => ({
          ...TOKENS_BY_ASSET_ID[assetId],
          share,
        }));
        newPools.push(new Pool({ ...config, tokens }));
      }
    });
    this.setPools([...this.pools, ...newPools]);
  };

  updateInvestedInPoolsInfo = async (force = false) => {
    const { address } = this.rootStore.accountStore;
    if (address == null) {
      this.setInvestedInPools(null);
      return;
    }
    if (!force && this.investedInPoolsLoading) return;
    this.setInvestedInPoolsLoading(true);
    await this.updateAccountCustomPoolsLiquidityInfo(address);
    await this.updateAccountMainPoolsLiquidityInfo(address);
    this.setInvestedInPoolsLoading(false);
  };

  private updateAccountCustomPoolsLiquidityInfo = (address: string) => {
    const customPoolsInfo = this.customPools.reduce((acc, pool) => {
      const state = this.getStateByAddress(pool.contractAddress)?.state;
      return state
        ? [...acc, pool.getAccountLiquidityInfoByState(address, state)]
        : acc;
    }, [] as Array<IShortPoolInfo>);
    this.setInvestedInPools(customPoolsInfo, { onlyCustom: true });
  };

  private updateAccountMainPoolsLiquidityInfo = async (address: string) => {
    const mainPoolsAccountLiquidity = await Promise.all(
      this.mainPools.map((p) => p.getAccountLiquidityInfo(address))
    );
    const newAddress = this.rootStore.accountStore.address;
    if (address !== newAddress) return;
    this.setInvestedInPools(mainPoolsAccountLiquidity, {
      onlyMain: true,
    });
  };

  updatePoolsState = async () => {
    const address = this.rootStore.accountStore.address;
    const state = await poolService.getPoolsStateByUserAddress(address);
    this.setPoolState(state);
    this.syncPoolsLiquidity();
    address && this.updateAccountCustomPoolsLiquidityInfo(address);
  };

  syncPoolsLiquidity = () =>
    this.pools.forEach((pool) => {
      const state = this.getStateByAddress(pool.contractAddress)?.state;
      state && pool.syncLiquidity(state);
    });

  private syncPuzzleRate = async () => {
    const res = await nodeService.nodeKeysRequest(
      CONTRACT_ADDRESSES.priceOracle,
      "lastUpdatedBlock"
    );
    const lastBlock = res[0].value;
    const priceResponse = await nodeService.nodeKeysRequest(
      CONTRACT_ADDRESSES.priceOracle,
      [
        `block_${lastBlock}_min_${TOKENS_BY_SYMBOL.PUZZLE.assetId}`,
        `block_${lastBlock}_min_${TOKENS_BY_SYMBOL.XTN.assetId}`,
      ]
    );

    const puzzleRate =
      priceResponse != null
        ? BN.formatUnits(priceResponse[0].value, 6)
        : BN.ZERO;
    const usdnRate =
      priceResponse != null
        ? BN.formatUnits(priceResponse[1].value, 6)
        : BN.ZERO;
    this.setPuzzleRate(puzzleRate);
    this.setUsdnRate(usdnRate);
    this.pools.forEach((pool) => {
      pool.setPuzzleRate(puzzleRate);
      pool.setUsdnRate(usdnRate);
    });
  };
}
