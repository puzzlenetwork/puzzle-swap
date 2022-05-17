import { RootStore } from "./index";
import { action, makeAutoObservable, reaction } from "mobx";
import Pool, { IData, IShortPoolInfo } from "@src/entities/Pool";
import BN from "@src/utils/BN";
import statsService, {
  IPoolVolume,
  IStatsPoolItemResponse,
} from "@src/services/statsService";
import {
  POOL_CONFIG,
  TOKENS_BY_ASSET_ID,
  TOKENS_BY_SYMBOL,
} from "@src/constants";
import poolsService from "@src/services/poolsService";
import poolService from "@src/services/poolsService";
import wavesCapService from "@src/services/wavesCapService";

export interface IStatsPoolItem {
  weekly_volume: BN;
  apy: BN;
  liquidity: BN;
  monthly_volume: BN;
}

export interface IPoolStats30Days extends IStatsPoolItem {
  fees: BN;
  volume: IPoolVolume[];
}

export type TPoolState = {
  state: IData[];
  contractAddress: string;
};

export default class PoolsStore {
  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
    this.syncPoolsStats().then();
    this.syncPools().then();
    this.syncCustomPools().then(this.updateCustomPoolsState);
    this.updateAccountPoolsLiquidityInfo().then();
    this.syncPuzzleRate().then();
    setInterval(
      () =>
        Promise.all([
          this.syncPoolsLiquidity(),
          this.updateAccountPoolsLiquidityInfo(),
          this.updateCustomPoolsState(),
          this.syncPuzzleRate(),
        ]),
      60 * 1000
    );
    reaction(
      () => this.rootStore.accountStore.address,
      () => this.updateAccountPoolsLiquidityInfo(true)
    );
  }

  public rootStore: RootStore;

  get customPools() {
    return this.pools.filter(({ isCustom }) => isCustom);
  }

  get mainPools() {
    return this.pools.filter(({ isCustom }) => !isCustom);
  }

  pools: Pool[] = [];
  @action.bound setPools = (pools: Pool[]) => (this.pools = pools);
  getPoolByDomain = (domain: string) =>
    this.pools.find((pool) => pool.domain === domain);

  public poolsStats: Record<string, IStatsPoolItem> | null = null;
  private setPoolStats = (value: Record<string, IStatsPoolItem>) =>
    (this.poolsStats = value);

  private puzzleRate: BN | null = null;
  private setPuzzleRate = (rate: BN | null) => (this.puzzleRate = rate);

  public poolsState: TPoolState[] | null = null;
  private setPoolState = (value: TPoolState[]) => (this.poolsState = value);
  private getStateByAddress = (contractAddress: string) =>
    this.poolsState?.find((v) => v.contractAddress === contractAddress);

  accountPoolsLiquidity: IShortPoolInfo[] | null = null;
  setAccountPoolsLiquidity = (
    v: IShortPoolInfo[] | null,
    options?: { onlyMain?: boolean; onlyCustom?: boolean }
  ) => {
    if (v == null) {
      this.accountPoolsLiquidity = null;
    } else if (options?.onlyCustom) {
      const mainPoolsInfo = this.accountPoolsLiquidity?.filter(
        ({ pool }) => !pool.isCustom
      );
      this.accountPoolsLiquidity =
        mainPoolsInfo != null ? [...mainPoolsInfo, ...v] : v;
    } else if (options?.onlyMain) {
      const customPoolsInfo = this.accountPoolsLiquidity?.filter(
        ({ pool }) => pool.isCustom
      );
      this.accountPoolsLiquidity =
        customPoolsInfo != null ? [...customPoolsInfo, ...v] : v;
    } else {
      this.accountPoolsLiquidity = v;
    }
  };

  accountPoolsLiquidityLoading = false;
  @action.bound setAccountPoolsLiquidityLoading = (state: boolean) =>
    (this.accountPoolsLiquidityLoading = state);

  findPoolStatsByPoolId = (poolId: string) =>
    this.poolsStats && this.poolsStats[poolId];

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

  usdnRate = (assetId: string, coefficient = 1): BN | null => {
    const pool = this.pools.find(({ tokens }) =>
      tokens.some((t) => t.assetId === assetId)
    );
    if (pool == null) return null;
    const usdn = TOKENS_BY_SYMBOL.USDN.assetId;
    const puzzle = TOKENS_BY_SYMBOL.PUZZLE.assetId;
    if (pool.tokens.some(({ assetId }) => assetId === usdn)) {
      return pool.currentPrice(assetId, usdn, coefficient);
    } else if (pool.tokens.some(({ assetId }) => assetId === puzzle)) {
      const priceInPuzzle = pool.currentPrice(assetId, puzzle, coefficient);
      return priceInPuzzle != null && this.puzzleRate != null
        ? priceInPuzzle.times(this.puzzleRate)
        : null;
    } else {
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
    const customPools = configs.map((p) => {
      const tokens = p.assets.map(({ assetId, share }) => ({
        ...TOKENS_BY_ASSET_ID[assetId],
        share,
      }));
      return new Pool({ ...p, tokens });
    });
    this.setPools([...this.pools, ...customPools]);
  };

  syncPoolsStats = async () => {
    const data = await statsService.getStats();
    const stats = Object.entries(data).reduce((acc, [poolId, obj]) => {
      const bnFormat = Object.entries(obj as IStatsPoolItemResponse).reduce(
        (ac, [propertyName, propertyValue]) => {
          const value = new BN(propertyValue);
          return { ...ac, [propertyName]: value };
        },
        {} as IStatsPoolItem
      );
      return { ...acc, [poolId]: bnFormat };
    }, {} as Record<string, IStatsPoolItem>);
    this.pools.forEach((pool) => {
      const apy = stats != null ? stats[pool.domain]?.apy : BN.ZERO;
      pool.setApy(apy);
    });
    this.setPoolStats(stats);
  };

  get30DaysPoolStats = async (poolId: string): Promise<IPoolStats30Days> => {
    const data = await statsService.getStatsByPoolAndPeriod(poolId);
    return Object.entries(data).reduce((acc, [propertyName, propertyValue]) => {
      const value = Array.isArray(propertyValue)
        ? propertyValue
        : new BN(propertyValue);
      return { ...acc, [propertyName]: value };
    }, {} as IPoolStats30Days);
  };

  updateAccountPoolsLiquidityInfo = async (force = false) => {
    const { address } = this.rootStore.accountStore;
    if (address == null) {
      this.setAccountPoolsLiquidity(null);
      return;
    }
    if (!force && this.accountPoolsLiquidityLoading) return;
    this.setAccountPoolsLiquidityLoading(true);
    this.updateAccountCustomPoolsLiquidityInfo(address);
    await this.updateAccountMainPoolsLiquidityInfo(address);
    this.setAccountPoolsLiquidityLoading(false);
  };

  private updateAccountCustomPoolsLiquidityInfo = (address: string) => {
    const customPoolsInfo = this.customPools.reduce((acc, pool) => {
      const state = this.getStateByAddress(pool.contractAddress)?.state;
      return state
        ? [...acc, pool.getAccountLiquidityInfoByState(address, state)]
        : acc;
    }, [] as Array<IShortPoolInfo>);
    this.setAccountPoolsLiquidity(customPoolsInfo, { onlyCustom: true });
  };

  private updateAccountMainPoolsLiquidityInfo = async (address: string) => {
    const mainPoolsAccountLiquidity = await Promise.all(
      this.mainPools.map((p) => p.getAccountLiquidityInfo(address))
    );
    const newAddress = this.rootStore.accountStore.address;
    if (address !== newAddress) return;
    this.setAccountPoolsLiquidity(mainPoolsAccountLiquidity, {
      onlyMain: true,
    });
  };

  updateCustomPoolsState = async () => {
    if (this.rootStore.accountStore.address == null) return;
    const state = await poolsService.getPoolsStateByUserAddress(
      this.rootStore.accountStore.address
    );
    this.setPoolState(state);
    this.customPools.forEach((pool) => {
      const poolState = this.getStateByAddress(pool.contractAddress);
      if (poolState != null) {
        pool.syncLiquidity(poolState.state);
      }
    });
    this.updateAccountCustomPoolsLiquidityInfo(
      this.rootStore.accountStore.address
    );
  };

  syncPoolsLiquidity = () =>
    Promise.all(
      this.pools.map((pool) => {
        if (pool.isCustom) {
          const state = this.getStateByAddress(pool.contractAddress)?.state;
          return state ? pool.syncLiquidity(state) : Promise.resolve();
        } else {
          return pool.syncLiquidity();
        }
      })
    );

  private syncPuzzleRate = () =>
    wavesCapService
      .getAssetRate(TOKENS_BY_SYMBOL.PUZZLE.assetId)
      .then((rate) => {
        this.setPuzzleRate(rate);
        this.pools.forEach((pool) => pool.setPuzzleRate(rate ?? BN.ZERO));
      });
}
