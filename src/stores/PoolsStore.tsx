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
import poolService, { IGetPools } from "@src/services/poolsService";
import nodeService from "@src/services/nodeService";

export type TPoolState = {
  state: IData[];
  contractAddress: string;
};

export interface ISerializedPoolsStore {
  slippage: number;
}

interface ISyncTokensFromPyResponse {
  assetId: string;
  category: string[];
  decimals: number;
  lastPrice: number;
  name: string;
  startPrice: number;
  symbol: string;
}

interface ISyncFromResponse {
  "asset_id": string,
  "name": string,
  "allowed": boolean,
  "symbol": string,
  "decimals": number,
  "description": string,
  "price": number,
  "start_price": number,
  "category": string[]
}

export default class PoolsStore {
  constructor(rootStore: RootStore, initialState?: ISerializedPoolsStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);

    this.syncTokensFromPy().then();
    this.syncPuzzleRate().then();
    this.syncPools().then();
    this.syncCustomPools().then(this.updatePoolsState);
    this.updateInvestedInPoolsInfo().then();

    setTimeout(() => {
      this.syncPoolsLiquidity();
      Promise.all([
        this.syncTokensFromPy(),
        this.syncPuzzleRate(),
        this.updateInvestedInPoolsInfo(),
        this.updatePoolsState(),
        this.syncCustomPools(),
      ]);
    }, 1000);

    setInterval(() => {
      this.syncPoolsLiquidity();
      Promise.all([
        this.syncTokensFromPy(),
        this.updateInvestedInPoolsInfo(),
        this.updatePoolsState(),
        this.syncPuzzleRate(),
        this.syncCustomPools(),
      ]);
    }, 15 * 1000);
    reaction(
      () => [this.volumeByTimeFilter],
      async () => {
        this.setPools([]);
        this.syncPoolsLiquidity();
        Promise.all([
          this.syncPools().then(),
          this.syncTokensFromPy(),
          this.updateInvestedInPoolsInfo(),
          this.updatePoolsState(),
          this.syncPuzzleRate(),
          this.syncCustomPools(),
        ]);

        setTimeout(() => {
          this.syncPoolsLiquidity();
          Promise.all([
            this.syncTokensFromPy(),
            this.syncPuzzleRate(),
            this.updateInvestedInPoolsInfo(),
            this.updatePoolsState(),
            this.syncCustomPools(),
          ]);
        }, 500);
      }
    );
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

  public wavesRate: BN = BN.ZERO;
  public setWavesRate = (value: BN) => (this.wavesRate = value);

  public usdnRate: BN = BN.ZERO;
  public setUsdnRate = (value: BN) => (this.usdnRate = value);

  public _usdtRate: BN = BN.ZERO;
  public setUsdtRate = (value: BN) => (this._usdtRate = value);

  public tokensList: any;
  public setTokensList = (value: any) => (this.tokensList = value);

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

  volumeByTimestamp = [
    { title: "Stats all time", key: "all" },
    { title: "Stats 1 year", key: "1y" },
    { title: "Stats 30 days", key: "30d" },
    { title: "Stats 7 days", key: "7d" },
    { title: "Stats 1 day", key: "1d" },
  ];

  versionOptions = [
    { title: "All versions", key: "all" },
    { title: "PZ-1.0.0", key: "PZ-1.0.0" },
    { title: "PZ-1.2.1", key: "PZ-1.2.1" },
    { title: "PZ-1.2.3", key: "PZ-1.2.3" },
  ];

  versionFilter: number = 0;
  setVersionFilter = (v: number) => (this.versionFilter = v);

  filter: { sortBy: IGetPools["sortBy"]; order: IGetPools["order"] } = {
    sortBy: "liquidity",
    order: "desc",
  };
  setFilter = (filter: {
    sortBy: IGetPools["sortBy"];
    order: IGetPools["order"];
  }) => {
    this.filter = filter;
  };

  showEmptyBalances: boolean = true;
  setShowEmptyBalances = (v: boolean) => (this.showEmptyBalances = v);

  pagination = {
    page: 1,
    size: 20,
  };
  setPagination = (pagination: { page: number; size: number }) => {
    this.pagination = pagination;
  };

  searchValue = "";
  setSearchValue = (v: string) => {
    this.searchValue = v;
  };

  activeSort = 0;
  setActiveSort = (v: number) => (this.activeSort = v);

  sortApy = true;
  setSortApy = (v: boolean) => {
    this.sortApy = v;
    this.rootStore.poolsStore.setFilter({
      sortBy: "apr",
      order: v ? "asc" : "desc",
    });
  };

  sortLiquidity = true;
  setSortLiquidity = (v: boolean) => {
    this.sortLiquidity = v;
    this.rootStore.poolsStore.setFilter({
      sortBy: "liquidity",
      order: v ? "asc" : "desc",
    });
  };
  sortBalance = true;
  setSortBalance = (v: boolean) => (this.sortBalance = v);

  searchPool = "";
  setSearchPool = (pool: string) => {
    this.searchPool = pool;
  };

  totalItems = 0;
  setTotalItems = (items: number) => {
    this.totalItems = items;
  };

  volumeByTimeFilter: number = 0;
  setVolumeByTimeFilter = (v: number) => {
    this.volumeByTimeFilter = v;
  };

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
  get paramsAllPools(): IGetPools {
    return {
      // ...this.filter,
      page: 1,
      size: 500,
      timeRange: this.volumeByTimestamp[this.volumeByTimeFilter]
        .key as IGetPools["timeRange"],
      minLiquidity: 0
      // title: this?.searchPool ?? "",
      // version: this?.versionFilter === 0 ? "" : this?.versionOptions[this.versionFilter].key
    };
  }

  usdtRate = (assetId: string, coefficient = 1): BN | null => {
    if (this.tokensList) {
      const token = this.tokensList.filter(
        (token: { assetId: string }) => token.assetId === assetId
      )[0];
      if (token?.lastPrice) return new BN(token.lastPrice);
    }

    const usdn = TOKENS_BY_SYMBOL.XTN.assetId;
    const usdt = TOKENS_BY_SYMBOL["USDT-WXG"].assetId;
    const puzzle = TOKENS_BY_SYMBOL.PUZZLE.assetId;
    const waves = TOKENS_BY_SYMBOL.WAVES.assetId;
    const usdtppt = TOKENS_BY_SYMBOL.USDT.assetId;

    const pool = this.pools.find(
      (pool) =>
        pool.tokens.some((t) => t.assetId === assetId) &&
        pool.globalLiquidityByUSDT?.gt(100)
    );

    const startPrice = TOKENS_BY_ASSET_ID[assetId]?.startPrice;

    if (pool == null) {
      if (startPrice != null) {
        return new BN(startPrice ?? 0);
      } else {
        return new BN(1);
      }
    }

    // console.log(assetId, "POOL WITH PRICE", pool.contractAddress);
    // console.log(pool.tokens);
    // console.log("WAVES IN POOL???", (pool.tokens.some(({ assetId }) => assetId === waves)));

    if (pool.tokens.some(({ assetId }) => assetId === usdtppt)) {
      const priceInUsdt = pool.currentPrice(assetId, usdtppt, coefficient);
      return priceInUsdt != null ? priceInUsdt : null;
    } else if (pool.tokens.some(({ assetId }) => assetId === waves)) {
      const priceInWaves = pool.currentPrice(assetId, "WAVES", coefficient);
      return priceInWaves != null ? priceInWaves.times(pool.wavesRate) : null;
    } else if (pool.tokens.some(({ assetId }) => assetId === puzzle)) {
      const priceInPuzzle = pool.currentPrice(assetId, puzzle, coefficient);
      return priceInPuzzle != null
        ? priceInPuzzle.times(pool.puzzleRate)
        : null;
    } else if (pool.tokens.some(({ assetId }) => assetId === usdn)) {
      const priceInUSDN = pool.currentPrice(assetId, usdn);
      return priceInUSDN != null
        ? priceInUSDN.times(pool.usdnRate)
        : new BN(startPrice ?? 0);
    } else if (pool.tokens.some(({ assetId }) => assetId === usdt)) {
      const priceInUsdt = pool.currentPrice(assetId, usdt, coefficient);
      return priceInUsdt != null ? priceInUsdt.times(pool._usdtRate) : null;
    } else {
      //todo check all tokens like this
      return new BN(startPrice ?? 1);
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
    const { pools: configs, totalItems } = await poolService.getPools(
      this.paramsAllPools
    );
    this.rootStore.poolsStore.setTotalItems(totalItems);
    const newPools: Array<Pool> = [];
    configs.forEach((config) => {
      const pool = this.getPoolByDomain(config.domain);
      if (pool != null && config.stats != null) {
        pool.setStatistics({
          ...config.stats,
          totals: config?.totals,
          liquidity: config.liquidity,
          boostedApy: config.boosted_apr ?? null,
        });
      }
      if (config.isCustom && pool == null) {
        const tokens = config.assets.map(({ asset_id, share }) => ({
          ...TOKENS_BY_ASSET_ID[asset_id],
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
      const state = this.getStateByAddress(pool.address)?.state;
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
      const state = this.getStateByAddress(pool.address)?.state;
      state && pool.syncLiquidity(state);
    });

  private syncTokensFromPy = async () => {
    const res = await fetch(
      `${process.env.REACT_APP_AGG_API}/stats/v1/statistics/tokens?allowed=true`
    );
    if (!res.ok) {
      throw new Error("Failed to fetch data");
    }
    const resJson = await res.json();
    const mappedData: ISyncTokensFromPyResponse[] = resJson.map((el: ISyncFromResponse) => ({
      assetId: el.asset_id,
      category: el.category,
      decimals: el.decimals,
      lastPrice: el.price,
      name: el.name,
      startPrice: el.start_price,
      symbol: el.symbol,
    }));
    this.setTokensList(mappedData);
  };

  private syncPuzzleRate = async () => {
    const priceResponse = await nodeService.nodeKeysRequest(
      CONTRACT_ADDRESSES.priceOracle,
      [
        `${TOKENS_BY_SYMBOL.PUZZLE.assetId}_twap5B`,
        `${TOKENS_BY_SYMBOL.XTN.assetId}_twap5B`,
        `${TOKENS_BY_SYMBOL.WAVES.assetId}_twap5B`,
        `${TOKENS_BY_SYMBOL["USDT-WXG"].assetId}_twap5B`,
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
    const wavesRate =
      priceResponse != null
        ? BN.formatUnits(priceResponse[2].value, 6)
        : BN.ZERO;
    const _usdtRate =
      priceResponse != null
        ? BN.formatUnits(priceResponse[3].value, 6)
        : BN.ZERO;
    this.setPuzzleRate(puzzleRate);
    this.setUsdnRate(usdnRate);
    this.setWavesRate(wavesRate);
    this.setUsdtRate(_usdtRate);
    this.pools.forEach((pool) => {
      pool.setPuzzleRate(puzzleRate);
      pool.setUsdnRate(usdnRate);
      pool.setWavesRate(wavesRate);
      pool.setUsdtRate(_usdtRate);
    });
  };
}
