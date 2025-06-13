import nodeService from "@src/services/nodeService";
import BN from "@src/utils/BN";
import { IHistory } from "@src/utils/types";
import { makeAutoObservable } from "mobx";

export interface IRangeAssetResponse {
  asset_id: string,
  balance: number,
  balance_usd: number,
  current_price: number,
  extra_earned: number,
  fact_balance: number,
  fact_balance_usd: number,
  fees_earned: number,
  max_price: number,
  min_price: number,
  name: string,
  real_balance: number,
  share: number
}

export interface IRewardResponse {
  asset_id: string;
  name: string;
  amount: number;
  amount_usd: number;
}

export interface IProviderStakedResponse {
  address: string;
  index_staked: number;
  share: number;
  claimed_usd: number;
  unclaimed_usd: number;
  rewards: IRewardResponse[];
}

export interface IStakedProvidersResponse {
  total_index_staked: number;
  providers_staked: IProviderStakedResponse[];
  total_staked_providers: number;
}

export interface IStatsResponse {
  time_range: string;
  time_frame: string;
  apr: number;
  average_liquidity: number;
  average_virtual_liquidity: number;
  lp_price: number;
  claimed: number;
  pool_fees: number;
  owner_fees: number;
  protocol_fees: number;
  volume: number;
}

export interface IPeriodFeesResponse {
  [assetId: string]: {
    fees_earned: number;
    extra_earned: number;
  };
}

export interface IRangeParamsResponse {
  address: string;
  artefact_origin_transaction_id: string;
  assets: IRangeAssetResponse[];
  created_at: number;
  domain: string;
  fee_token_id: string;
  isCustom: boolean;
  last_historical_txId: string;
  last_processed_txId: string;
  last_saved_time: number;
  layer_2_address: string;
  liquidity: number;
  logo: string;
  lp_token_amount: number;
  lp_token_id: string;
  mode: string;
  owner: string;
  rebalances: any[];
  swap_fee: number;
  title: string;
  version: string;
  base_token_id: string;
  datastorage: Record<string, number | string>;
  nominal_asset: string;
  static_KMult: number;
  virtual_liquidity: number;
  extra_earned: IRewardResponse[];
  staked_providers: IStakedProvidersResponse;
  stats: IStatsResponse;
  period_fees: IPeriodFeesResponse;
  totals: Record<string, any>;
  charts?: IHistory[];
}

export class RangeAsset {
  assetId: string;
  balance: BN;
  balanceUsd: BN;
  currentPrice: BN;
  extraEarned: BN;
  factBalance: BN;
  factBalanceUsd: BN;
  feesEarned: BN;
  maxPrice: BN;
  minPrice: BN;
  name: string;
  realBalance: BN;
  share: BN;

  constructor(params: IRangeAssetResponse) {
    this.assetId = params.asset_id;
    this.balance = new BN(params.balance);
    this.balanceUsd = new BN(params.balance_usd);
    this.currentPrice = new BN(params.current_price);
    this.extraEarned = new BN(params.extra_earned);
    this.factBalance = new BN(params.fact_balance);
    this.factBalanceUsd = new BN(params.fact_balance_usd);
    this.feesEarned = new BN(params.fees_earned);
    this.maxPrice = new BN(params.max_price);
    this.minPrice = new BN(params.min_price);
    this.name = params.name;
    this.realBalance = new BN(params.real_balance);
    this.share = new BN(params.share);
  }
}

export class Reward {
  assetId: string;
  name: string;
  amount: BN;
  amountUsd: BN;

  constructor(params: IRewardResponse) {
    this.assetId = params.asset_id;
    this.name = params.name;
    this.amount = new BN(params.amount);
    this.amountUsd = new BN(params.amount_usd);
  }
}

export class ProviderStaked {
  address: string;
  indexStaked: BN;
  share: BN;
  claimedUsd: BN;
  unclaimedUsd: BN;
  rewards: Reward[];

  constructor(params: IProviderStakedResponse) {
    this.address = params.address;
    this.indexStaked = new BN(params.index_staked);
    this.share = new BN(params.share);
    this.claimedUsd = new BN(params.claimed_usd);
    this.unclaimedUsd = new BN(params.unclaimed_usd);
    this.rewards = params.rewards.map((reward) => new Reward(reward));
  }
}

export class StakedProviders {
  totalIndexStaked: BN;
  providersStaked: ProviderStaked[];
  totalStakedProviders: BN;

  constructor(params: IStakedProvidersResponse) {
    this.totalIndexStaked = new BN(params.total_index_staked);
    this.providersStaked = params.providers_staked.map((provider) => new ProviderStaked(provider));
    this.totalStakedProviders = new BN(params.total_staked_providers);
  }
}

export class RangeStats {
  timeRange: string;
  timeFrame: string;
  apr: BN;
  averageLiquidity: BN;
  average_virtualLiquidity: BN;
  lpPrice: BN;
  claimed: BN;
  poolFees: BN;
  ownerFees: BN;
  protocolFees: BN;
  volume: BN;

  constructor(params: IStatsResponse) {
    this.timeRange = params.time_range;
    this.timeFrame = params.time_frame;
    this.apr = new BN(params.apr);
    this.averageLiquidity = new BN(params.average_liquidity);
    this.average_virtualLiquidity = new BN(params.average_virtual_liquidity);
    this.lpPrice = new BN(params.lp_price);
    this.claimed = new BN(params.claimed);
    this.poolFees = new BN(params.pool_fees);
    this.ownerFees = new BN(params.owner_fees);
    this.protocolFees = new BN(params.protocol_fees);
    this.volume = new BN(params.volume);
  }
}

export class PeriodFees {
  [assetId: string]: {
    feesEarned: number;
    extraEarned: number;
  };
}

export class Range {
  address: string;
  artefactOriginTransactionId: string;
  assets: RangeAsset[];
  createdAt: number;
  domain: string;
  feeTokenId: string;
  isCustom: boolean;
  lastHistoricalTxId: string;
  lastProcessedTxId: string;
  lastSavedTime: number;
  layer2Address: string;
  liquidity: BN;
  logo: string;
  lpTokenAmount: BN;
  lpTokenId: string;
  mode: string;
  owner: string;
  rebalances: any[];
  swapFee: BN;
  title: string;
  version: string;
  baseTokenId: string;
  datastorage: Record<string, number | string>;
  nominalAsset: string;
  staticKMult: BN;
  virtualLiquidity: BN;
  extraEarned: Reward[];
  stakedProviders: StakedProviders;
  stats: RangeStats;
  periodFees: PeriodFees;
  totals: Record<string, any>;
  charts?: IHistory[];

  constructor(params: IRangeParamsResponse) {
    this.address = params.address;
    this.artefactOriginTransactionId = params.artefact_origin_transaction_id;
    this.assets = params.assets.map((asset) => new RangeAsset(asset));
    this.createdAt = params.created_at;
    this.domain = params.domain;
    this.feeTokenId = params.fee_token_id;
    this.isCustom = params.isCustom;
    this.lastHistoricalTxId = params.last_historical_txId;
    this.lastProcessedTxId = params.last_processed_txId;
    this.lastSavedTime = params.last_saved_time;
    this.layer2Address = params.layer_2_address;
    this.liquidity = new BN(params.liquidity);
    this.logo = params.logo;
    this.lpTokenAmount = new BN(params.lp_token_amount);
    this.lpTokenId = params.lp_token_id;
    this.mode = params.mode;
    this.owner = params.owner;
    this.rebalances = params.rebalances;
    this.swapFee = new BN(params.swap_fee);
    this.title = params.title;
    this.version = params.version;
    this.baseTokenId = params.base_token_id;
    this.datastorage = params.datastorage;
    this.nominalAsset = params.nominal_asset;
    this.staticKMult = new BN(params.static_KMult);
    this.virtualLiquidity = new BN(params.virtual_liquidity);
    this.extraEarned = params.extra_earned.map((reward) => new Reward(reward));
    this.stakedProviders = new StakedProviders(params.staked_providers);
    this.stats = new RangeStats(params.stats);
    this.periodFees = Object.entries(params.period_fees).reduce((acc, [assetId, { fees_earned, extra_earned }]) => {
      acc[assetId] = { feesEarned: fees_earned, extraEarned: extra_earned };
      return acc;
    }, {} as PeriodFees);
    this.totals = params.totals;
    this.charts = params.charts;
    makeAutoObservable(this);
  }

  // Пример геттеров/методов
  getLiquidity() {
    return this.liquidity;
  }

  getVolume() {
    return this.stats?.volume ?? 0;
  }

  // Добавляйте методы по необходимости

  get indexTokenRate(): BN {
    if (!this.lpTokenAmount)
      return BN.ZERO;
    return new BN(this.liquidity).div(this.lpTokenAmount);
  }

  get assetsWithLeverage() {
    const withLeverage = this.assets.map(({ balance, factBalance, ...rest }) => ({
      ...rest,
      leverage: factBalance.div(balance),
      balance,
      factBalance,
    }));

    const maxLeverage = withLeverage.reduce((acc, { leverage }) => BN.max(acc, leverage), BN.ZERO);

    return withLeverage.map((asset) => ({
      ...asset,
      leverage: asset.leverage.times(100).toNumber(),
      relativeLeverage: asset.leverage.div(maxLeverage).times(100).toNumber(),
    }));
  }

  contractKeysRequest = (keys: string[] | string) =>
    nodeService.nodeKeysRequest(this.address, keys);
} 