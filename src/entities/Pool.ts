import { IPoolConfig, IPoolConfigStatistics, IPoolRebalanceConfig, IPoolStats, IToken } from "@src/constants";
import { makeAutoObservable } from "mobx";
import BN from "@src/utils/BN";
import tokenLogos from "@src/constants/tokenLogos";
import nodeService from "@src/services/nodeService";
import { getStateByKey } from "@src/utils/getStateByKey";
import { IAssetConfig } from "@src/services/poolsService";

export class Rebalance {
  inProgress: boolean;
  steps: number;
  currentStep: number;
  interval: number;
  startHeight?: number;
  targetShares?: Record<string, number>;

  constructor(params: IPoolRebalanceConfig) {
    this.inProgress = params.in_progress;
    this.steps = params.steps;
    this.currentStep = params.current_step;
    this.interval = params.interval;
    this.startHeight = params.start_height;
    this.targetShares = params.target_shares;
  }

  get remainingBlocks(): number {
    return (this.steps - this.currentStep) * this.interval;
  }

  get remainingMinutes(): number {
    return this.remainingBlocks;
  }

  get estimatedTimeRemaining(): string {
    const minutes = this.remainingMinutes;
    if (minutes < 60) {
      return `~${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;
    if (hours < 24) {
      return remainingMins > 0 ? `~${hours}h ${remainingMins}m` : `~${hours}h`;
    }
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return remainingHours > 0 ? `~${days}d ${remainingHours}h` : `~${days}d`;
  }

  get progress(): number {
    if (this.steps === 0) return 100;
    return Math.round((this.currentStep / this.steps) * 100);
  }
}

export interface IData {
  key: string;
  type: "integer" | "string";
  value: number | string;
}

export interface IShortPoolInfo {
  pool: IPoolConfig;
  liquidityInUsdt: BN;
  addressStaked: BN;
  shareOfPool: BN;
  indexTokenRate: BN;
  indexTokenName: string;
}

class Pool implements IPoolConfig {
  public readonly owner?: string;
  public readonly domain: string;
  public readonly address: string;
  public readonly layer2Address?: string;
  public readonly base_token_id: string;
  public readonly title: string;
  public readonly isCustom?: boolean;
  public readonly artefactOriginTransactionId?: string;
  public readonly swapFee: number;
  public readonly createdAt: string;
  public readonly version: string;
  public readonly defaultAssetId0: string;
  public readonly defaultAssetId1: string;
  public readonly tokens: Array<IToken & { share: number }> = [];
  private readonly _logo?: string;
  public readonly stats?: IPoolStats;
  public readonly assets?: IAssetConfig[];

  public history?: Array<{ date: number; volume: string }>;
  public statistics?: IPoolConfigStatistics;
  public setStatistics = (statistics: IPoolConfigStatistics) =>
    new BN(statistics.liquidity).gt(0) && (this.statistics = statistics);

  public get logo() {
    return this._logo ?? tokenLogos.UNKNOWN;
  }

  public getAssetById = (assetId: string) => this.tokens.find((t) => assetId === t.assetId);

  public globalVolume: BN | null = null;
  setGlobalVolume = (value: BN) => (this.globalVolume = value);

  public globalLiquidityByUSDT: BN | null = null;
  setGlobalLiquidityByUSDT = (value: BN | null) => (this.globalLiquidityByUSDT = value);

  public get globalLiquidity(): BN {
    if (this.globalLiquidityByUSDT != null) return this.globalLiquidityByUSDT;
    else {
      return BN.ZERO;
    }
  }

  public globalPoolTokenAmount: BN = BN.ZERO;
  setGlobalPoolTokenAmount = (value: BN) => (this.globalPoolTokenAmount = value);

  public globalEarnedByOwner: BN | null = null;
  setGlobalEarnedByOwner = (value: BN) => (this.globalEarnedByOwner = value);

  public liquidity: Record<string, BN> = {};
  private setLiquidity = (value: Record<string, BN>) => (this.liquidity = value);

  public puzzleRate: BN = BN.ZERO;
  public setPuzzleRate = (value: BN) => (this.puzzleRate = value);

  public usdnRate: BN = BN.ZERO;
  public setUsdnRate = (value: BN) => (this.usdnRate = value);

  public wavesRate: BN = BN.ZERO;
  public setWavesRate = (value: BN) => (this.wavesRate = value);

  public _usdtRate: BN = BN.ZERO;
  public setUsdtRate = (value: BN) => (this._usdtRate = value);

  private _rebalanceInstances: Rebalance[] = [];

  get isRebalancing(): boolean {
    return this._rebalanceInstances.some((r) => r.inProgress);
  }

  get activeRebalance(): Rebalance | undefined {
    return this._rebalanceInstances.find((r) => r.inProgress);
  }

  get rebalanceTimeRemaining(): string | null {
    const active = this.activeRebalance;
    return active ? active.estimatedTimeRemaining : null;
  }

  get rebalanceProgress(): number | null {
    const active = this.activeRebalance;
    return active ? active.progress : null;
  }

  constructor(params: IPoolConfig) {
    this.address = params.address;
    this.layer2Address = params.layer_2_address;
    this.base_token_id = params.base_token_id;
    this.title = params.title;
    this._logo = params.logo;
    this.tokens = params.tokens;
    this.defaultAssetId0 = params.defaultAssetId0 ?? params?.assets?.[0]?.asset_id ?? "";
    this.defaultAssetId1 = params.defaultAssetId1 ?? params?.assets?.[1]?.asset_id ?? "";
    this.domain = params.domain;
    this.isCustom = params.isCustom;
    this.artefactOriginTransactionId = params.artefact_origin_transaction_id;
    this.owner = params.owner;
    this.version = params.version ?? "PZ-1.0.0";
    this.swapFee = params.swap_fee ?? 2;
    this.createdAt = params.created_at?.toString() ?? "";
    this.stats = params.stats;
    this.assets = params.assets;
    this._rebalanceInstances = params.rebalances?.map((r) => new Rebalance(r)) ?? [];
    makeAutoObservable(this);
  }

  currentPrice = (assetId0: string, assetId1: string, coefficient = 1): BN | null => {
    if (this.tokens == null) return null;
    const asset0 = this.getAssetById(assetId0);
    const asset1 = this.getAssetById(assetId1);
    if (asset0?.share == null || asset1?.share == null) return null;
    const { decimals: decimals0, share: shareAmount0 } = asset0;
    const { decimals: decimals1, share: shareAmount1 } = asset1;
    const liquidity0 = this.liquidity[assetId0];
    const liquidity1 = this.liquidity[assetId1];
    if (liquidity0 == null || liquidity1 == null) return null;
    const topValue = BN.formatUnits(liquidity1, decimals1).div(shareAmount1);
    const bottomValue = BN.formatUnits(liquidity0, decimals0).div(shareAmount0);
    return topValue.div(bottomValue).times(coefficient);
  };

  get indexTokenRate() {
    if (this.globalPoolTokenAmount == null || this.globalPoolTokenAmount.eq(0)) return BN.ZERO;
    return this.globalLiquidity.div(BN.formatUnits(this.globalPoolTokenAmount, 8));
  }

  syncLiquidity = (data?: IData[]) => {
    if (data == null) return;
    const balances = data.reduce<Record<string, BN>>((acc, { key, value }) => {
      const regexp = new RegExp("global_(.*)_balance");
      regexp.test(key) && (acc[key.match(regexp)![1]] = new BN(value));
      return acc;
    }, {});
    this.setLiquidity(balances);

    const globalPoolTokenAmount = data.find((v) => v.key === "global_poolToken_amount");
    if (globalPoolTokenAmount?.value != null) {
      this.setGlobalPoolTokenAmount(new BN(globalPoolTokenAmount.value));
    }

    const globalVolumeValue = data.find((v) => v.key === "global_volume");
    if (globalVolumeValue?.value != null) {
      const globalVolume = new BN(globalVolumeValue.value).div(1e6);
      this.setGlobalVolume(globalVolume);
    }
    const usdtAsset = this.tokens.find(({ assetId }) => assetId === "34N9YcEETLWn93qYQ64EsP1x89tSruJU44RrEMSXXEPJ")!;
    const usdtLiquidity = this.liquidity[usdtAsset?.assetId];

    const usdnAsset = this.tokens.find(({ symbol }) => symbol === "XTN")!;
    const usdnLiquidity = this.liquidity[usdnAsset?.assetId];

    const puzzleAsset = this.tokens.find(({ symbol }) => symbol === "PUZZLE")!;
    const puzzleLiquidity = this.liquidity[puzzleAsset?.assetId];

    const wavesAsset = this.tokens.find(({ symbol }) => symbol === "WAVES")!;
    const wavesLiquidity = this.liquidity[wavesAsset?.assetId];

    const usdtPptAsset = this.tokens.find(({ assetId }) => assetId === "9wc3LXNA4TEBsXyKtoLE9mrbDD7WMHXvXrCjZvabLAsi")!;
    const usdtPptLiquidity = this.liquidity[usdtPptAsset?.assetId];

    let globalLiquidityByUSDT = null;
    if (usdtAsset && usdtLiquidity) {
      globalLiquidityByUSDT = new BN(usdtLiquidity).div(usdtAsset.share).times(this._usdtRate).times(100).div(1e6);
    } else if (puzzleAsset && puzzleLiquidity) {
      globalLiquidityByUSDT = new BN(puzzleLiquidity).div(puzzleAsset.share).times(100).times(this.puzzleRate).div(1e8);
    } else if (usdnAsset && usdnLiquidity) {
      globalLiquidityByUSDT = new BN(usdnLiquidity).div(usdnAsset.share).times(100).times(this.usdnRate).div(1e6);
    } else if (wavesAsset && wavesLiquidity) {
      globalLiquidityByUSDT = new BN(wavesLiquidity).div(wavesAsset.share).times(100).times(this.wavesRate).div(1e8);
    } else if (usdtPptAsset && usdtPptLiquidity) {
      globalLiquidityByUSDT = new BN(usdtPptLiquidity).div(usdtPptAsset.share).times(100).div(1e6);
    }
    this.setGlobalLiquidityByUSDT(globalLiquidityByUSDT);
  };

  getAccountLiquidityInfo = async (user: string): Promise<IShortPoolInfo> => {
    const keysArray = {
      addressIndexStaked: `${user}_indexStaked`,
      globalIndexStaked: `global_indexStaked`,
      globalIndexAmount: `global_poolToken_amount`,
      globalPoolTokenAmount: "global_poolToken_amount",
      globalEarnedByOwner: "global_earnedByOwner"
    };
    const [values, staticPoolDomainValue] = await Promise.all([
      this.contractKeysRequest(Object.values(keysArray)),
      this.contractKeysRequest(`static_poolDomain`)
    ]);
    const staticPoolDomain = staticPoolDomainValue?.length === 1 ? staticPoolDomainValue[0].value : "";
    const parsedNodeResponse = [...(values ?? [])].reduce<Record<string, BN>>((acc, { key, value }) => {
      Object.entries(keysArray).forEach(([regName, regValue]) => {
        const regexp = new RegExp(regValue);
        if (regexp.test(key)) {
          acc[regName] = new BN(value);
        }
      });
      return acc;
    }, {});
    const globalEarnedByOwner = parsedNodeResponse["globalEarnedByOwner"];
    this.setGlobalEarnedByOwner(globalEarnedByOwner);
    const addressIndexStaked = parsedNodeResponse["addressIndexStaked"];
    const globalIndexStaked = parsedNodeResponse["globalIndexStaked"];
    const globalIndexAmount = parsedNodeResponse["globalIndexAmount"];
    const globalPoolTokenAmount = parsedNodeResponse["globalPoolTokenAmount"];
    const indexTokenRate = this.globalLiquidity.div(BN.formatUnits(globalPoolTokenAmount, 8));

    if (addressIndexStaked == null || addressIndexStaked.eq(0)) {
      return {
        addressStaked: BN.ZERO,
        liquidityInUsdt: BN.ZERO,
        shareOfPool: BN.ZERO,
        pool: this,
        indexTokenRate,
        indexTokenName: " PZ" + staticPoolDomain
      };
    }

    const liquidityInUsdt = this.globalLiquidity.times(addressIndexStaked).div(globalIndexAmount);
    const percent = liquidityInUsdt.times(new BN(100)).div(this.globalLiquidity);

    return {
      liquidityInUsdt,
      addressStaked: addressIndexStaked,
      shareOfPool: percent,
      pool: this,
      indexTokenRate,
      indexTokenName: " PZ " + staticPoolDomain
    };
  };

  getAccountLiquidityInfoByState = (user: string, state: IData[]): IShortPoolInfo => {
    const addressIndexStaked = new BN(getStateByKey(state, `${user}_indexStaked`) ?? 0);
    // TODO: find out what is this property for
    // const globalIndexStaked = new BN(getStateByKey(state, `global_indexStaked`) ?? 0);
    const globalPoolTokenAmount = new BN(getStateByKey(state, "global_poolToken_amount") ?? 0);
    const indexTokenRate =
      globalPoolTokenAmount && globalPoolTokenAmount.gt(0)
        ? this.globalLiquidity.div(BN.formatUnits(globalPoolTokenAmount, 8))
        : BN.ZERO;
    if (addressIndexStaked == null || addressIndexStaked.eq(0)) {
      return {
        addressStaked: BN.ZERO,
        liquidityInUsdt: BN.ZERO,
        shareOfPool: BN.ZERO,
        pool: this,
        indexTokenRate,
        indexTokenName: " PZ " + this.domain
      };
    }

    const liquidityInUsdt = this.globalLiquidity.times(addressIndexStaked).div(globalPoolTokenAmount);
    const percent = liquidityInUsdt.times(new BN(100)).div(this.globalLiquidity);
    return {
      liquidityInUsdt,
      addressStaked: addressIndexStaked,
      shareOfPool: percent,
      pool: this,
      indexTokenRate,
      indexTokenName: " PZ " + this.domain
    };
  };

  contractKeysRequest = (keys: string[] | string) => nodeService.nodeKeysRequest(this.address, keys);
}

export default Pool;
