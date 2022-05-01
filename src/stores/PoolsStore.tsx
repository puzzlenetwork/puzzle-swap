import { RootStore } from "./index";
import { action, makeAutoObservable, reaction } from "mobx";
import Pool, { IShortPoolInfo } from "@src/entities/Pool";
import BN from "@src/utils/BN";
import statsService, {
  IPoolVolume,
  IStatsPoolItemResponse,
} from "@src/services/statsService";
import { POOL_CONFIG } from "@src/constants";

export interface IStatsPoolItem {
  // 7d_volume: BN;
  weekly_volume: BN;
  apy: BN;
  liquidity: BN;
  monthly_volume: BN;
}

export interface IPoolStats30Days extends IStatsPoolItem {
  fees: BN;
  volume: IPoolVolume[];
}

export default class PoolsStore {
  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
    this.syncPoolsStats().then();
    this.syncPools();
    this.updateAccountPoolsLiquidityInfo().then();
    setInterval(this.updateAccountPoolsLiquidityInfo, 60 * 1000);
    reaction(
      () => this.rootStore.accountStore.address,
      () => this.updateAccountPoolsLiquidityInfo(true)
    );
  }

  public rootStore: RootStore;
  pools: Pool[] = [];
  @action.bound setPools = (pools: Pool[]) => (this.pools = pools);
  getPuzzlePoolByDomain = (domain: string) =>
    this.pools.find((pool) => pool.domain === domain);

  public poolsStats: Record<string, IStatsPoolItem> | null = null;
  private setPoolStats = (value: Record<string, IStatsPoolItem>) =>
    (this.poolsStats = value);

  accountPoolsLiquidity: IShortPoolInfo[] | null = null;
  setAccountPoolsLiquidity = (v: IShortPoolInfo[] | null) =>
    (this.accountPoolsLiquidity = v);

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
    const tokens = this.rootStore.accountStore.TOKENS;
    return pool.currentPrice(assetId, tokens.USDN.assetId, coefficient);
  };

  syncPools = () => {
    const pools = Object.values(POOL_CONFIG).map(
      (pool) => new Pool({ ...pool, isCustom: false })
    );
    this.setPools(pools);
  };

  syncPoolsStats = async () => {
    const data = await statsService.getStats();
    const formattedData = Object.entries(data).reduce((acc, [poolId, obj]) => {
      const bnFormat = Object.entries(obj as IStatsPoolItemResponse).reduce(
        (ac, [propertyName, propertyValue]) => {
          const value = new BN(propertyValue);
          return { ...ac, [propertyName]: value };
        },
        {} as IStatsPoolItem
      );
      return { ...acc, [poolId]: bnFormat };
    }, {} as Record<string, IStatsPoolItem>);
    this.setPoolStats(formattedData);
  };

  get poolDataWithApy() {
    return this.pools.map((p) => {
      const apy =
        this.poolsStats != null ? this.poolsStats[p.domain]?.apy : BN.ZERO;
      return { ...p, logo: p.logo, baseToken: p.baseToken, apy };
    });
  }

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
    const poolsInfo = await Promise.all(
      this.pools.map((p) => p.getAccountLiquidityInfo(address))
    );
    const newAddress = this.rootStore.accountStore.address;
    if (address !== newAddress) return;
    this.setAccountPoolsLiquidity(poolsInfo);
    this.setAccountPoolsLiquidityLoading(false);
  };
}
