import nodeService from "@src/services/nodeService";
import BN from "@src/utils/BN";
import { IHistory } from "@src/utils/types";
import { makeAutoObservable } from "mobx";

export interface IRangeAssetResponse {
  asset_id: string,
  balance: number,
  balance_usd: number,
  current_price: number,
  current_price_usd: number,
  extra_earned: number,
  fact_balance: number,
  fact_balance_usd: number,
  fees_earned: number,
  max_price: number,
  min_price: number,
  max_price_usd: number,
  min_price_usd: number,
  current_selloff: number,
  max_sell_allowed: number,
  selloff_start_balance: number,
  selloff_start_height: number,
  shutdown_buy: boolean,
  shutdown_sell: boolean,
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

export interface IAssetFeesResponse {
  fees_earned: number;
  extra_earned: number;
  total_earned: number;
  total_earned_usd: number;
}

export interface IPeriodStatsResponse {
  time_range: string;
  time_frame: "1d" |"7d" |"30d" |"90d" |"1y" | "all";
  start_time: number;
  end_time: number;
  apr: number;
  average_liquidity: number;
  average_virtual_liquidity: number;
  average_lpamount: number;
  lp_price: number;
  claimed: number;
  owner_fees: number;
  protocol_fees: number;
  volume: number;
  total_fees_usd: number;
  fees: Record<string, IAssetFeesResponse>;
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
  staked_providers?: IStakedProvidersResponse;
  base_token_price: number;
  period_stats: IPeriodStatsResponse;
  totals: Record<string, any>;
  charts?: IHistory[];
}

export class RangeAsset {
  assetId: string;
  balance: BN;
  balanceUsd: BN;
  currentPrice: BN;
  currentPriceUsd: BN;
  extraEarned: BN;
  factBalance: BN;
  factBalanceUsd: BN;
  feesEarned: BN;
  maxPrice: BN;
  minPrice: BN;
  maxPriceUsd: BN;
  minPriceUsd: BN;
  maxSellAllowed: BN | null;
  currentSelloff: BN;
  selloffStartBalance: BN;
  selloffStartHeight: BN;
  shutdownBuy: boolean;
  shutdownSell: boolean;
  name: string;
  realBalance: BN;
  share: BN;

  constructor(params: IRangeAssetResponse) {
    this.assetId = params.asset_id;
    this.balance = new BN(params.balance);
    this.balanceUsd = new BN(params.balance_usd);
    this.currentPrice = new BN(params.current_price);
    this.currentPriceUsd = new BN(params.current_price_usd);
    this.extraEarned = new BN(params.extra_earned);
    this.factBalance = new BN(params.fact_balance);
    this.factBalanceUsd = new BN(params.fact_balance_usd);
    this.feesEarned = new BN(params.fees_earned);
    this.maxPrice = new BN(params.max_price);
    this.minPrice = new BN(params.min_price);
    this.maxPriceUsd = new BN(params.max_price_usd);
    this.minPriceUsd = new BN(params.min_price_usd);
    this.maxSellAllowed = params.max_sell_allowed ? new BN(params.max_sell_allowed) : null;
    this.currentSelloff = new BN(params.current_selloff);
    this.selloffStartBalance = new BN(params.selloff_start_balance);
    this.selloffStartHeight = new BN(params.selloff_start_height);
    this.shutdownBuy = params.shutdown_buy;
    this.shutdownSell = params.shutdown_sell;
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
    this.rewards = params.rewards?.map((reward) => new Reward(reward)) ?? [];
  }
}

export class StakedProviders {
  totalIndexStaked: BN;
  providersStaked: ProviderStaked[];
  totalStakedProviders: BN;

  constructor(params: IStakedProvidersResponse) {
    this.totalIndexStaked = new BN(params.total_index_staked);
    this.providersStaked = params.providers_staked?.map((provider) => new ProviderStaked(provider)) ?? [];
    this.totalStakedProviders = new BN(params.total_staked_providers);
  }
}

export class AssetFees {
  feesEarned: BN;
  extraEarned: BN;
  totalEarned: BN;
  totalEarnedUsd: BN;
  constructor(params: IAssetFeesResponse) {
    this.feesEarned = new BN(params.fees_earned);
    this.extraEarned = new BN(params.extra_earned);
    this.totalEarned = this.feesEarned.plus(this.extraEarned);
    this.totalEarnedUsd = new BN(params.total_earned_usd);
  }
}

export class PeriodStats {
  timeRange: string;
  timeFrame: "1d" |"7d" |"30d" |"90d" |"1y" | "all";
  startTime: BN;
  endTime: BN;
  apr: BN;
  averageLiquidity: BN;
  averageVirtualLiquidity: BN;
  averageLpAmount: BN;
  lpPrice: BN;
  claimed: BN;
  ownerFees: BN;
  protocolFees: BN;
  volume: BN;
  totalFeesUsd: BN;
  fees: Record<string, AssetFees>;

  constructor(params: IPeriodStatsResponse) {
    this.timeRange = params.time_range;
    this.timeFrame = params.time_frame as "1d" |"7d" |"30d" |"90d" |"1y" | "all";
    this.startTime = new BN(params.start_time);
    this.endTime = new BN(params.end_time);
    this.apr = new BN(params.apr);
    this.averageLiquidity = new BN(params.average_liquidity);
    this.averageVirtualLiquidity = new BN(params.average_virtual_liquidity);
    this.averageLpAmount = new BN(params.average_lpamount);
    this.lpPrice = new BN(params.lp_price);
    this.claimed = new BN(params.claimed);
    this.ownerFees = new BN(params.owner_fees);
    this.protocolFees = new BN(params.protocol_fees);
    this.volume = new BN(params.volume);
    this.totalFeesUsd = new BN(params.total_fees_usd);

    this.fees = Object.fromEntries(
      Object.entries(params.fees).map(([key, value]) => [key, new AssetFees(value)])
    );
  }
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
  stakedProviders?: StakedProviders;
  baseTokenPrice: BN;
  periodStats: PeriodStats;
  totals: Record<string, any>;
  charts?: IHistory[];

  baseToken: RangeAsset | undefined;

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
    this.stakedProviders = params?.staked_providers ? new StakedProviders(params.staked_providers) : undefined;
    this.baseTokenPrice = new BN(params.base_token_price);
    this.totals = params.totals;
    this.charts = params.charts;
    this.periodStats = new PeriodStats(params.period_stats);
    this.baseToken = this.assets.find((asset) => asset.assetId === this.baseTokenId);
    makeAutoObservable(this);
  }

  // Пример геттеров/методов
  getLiquidity() {
    return this.liquidity;
  }

  getVolume() {
    return this.periodStats?.volume ?? 0;
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
      relativeLeverage: asset.leverage.div(maxLeverage).times(100).plus(10).toNumber(),
    }));
  }

  get totalAssetsInRange() {
    return this.assets.reduce((acc, { balance }) => acc.plus(balance), BN.ZERO);
  }

  get totalFees() {
    return this.periodStats.ownerFees.plus(this.periodStats.protocolFees);
  }

  contractKeysRequest = (keys: string[] | string) =>
    nodeService.nodeKeysRequest(this.address, keys);
}

export interface ILPDataAssetResponse {
  asset_id: string;
  name: string;
  earned_amount: number;
  earned_amount_usd: number;
  provided_amount: number;
  provided_amount_usd: number;
}

export interface ILPDataResponse {
  provider_address: string;
  pool_address: string;
  pool_mode: string;
  index_staked: number;
  share: number;
  provided_usd: number;
  claimed_usd: number;
  unclaimed_usd: number;
  assets_data: ILPDataAssetResponse[];
}

export class LPDataAsset {
  assetId: string;
  name: string;
  earnedAmount: BN;
  earnedAmountUsd: BN;
  providedAmount: BN;
  providedAmountUsd: BN;
  constructor(params: ILPDataAssetResponse) {
    this.assetId = params.asset_id;
    this.name = params.name;
    this.earnedAmount = new BN(params.earned_amount);
    this.earnedAmountUsd = new BN(params.earned_amount_usd);
    this.providedAmount = new BN(params.provided_amount);
    this.providedAmountUsd = new BN(params.provided_amount_usd);
  }
}

export class LPData {
  providerAddress: string;
  poolAddress: string;
  poolMode: string;
  indexStaked: BN;
  share: BN;
  providedUsd: BN;
  claimedUsd: BN;
  unclaimedUsd: BN;
  assetsData: LPDataAsset[];
  constructor(params: ILPDataResponse) {
    this.providerAddress = params.provider_address;
    this.poolAddress = params.pool_address;
    this.poolMode = params.pool_mode;
    this.indexStaked = new BN(params.index_staked);
    this.share = new BN(params.share);
    this.providedUsd = new BN(params.provided_usd);
    this.claimedUsd = new BN(params.claimed_usd);
    this.unclaimedUsd = new BN(params.unclaimed_usd);
    this.assetsData = params.assets_data.map((asset) => new LPDataAsset(asset));
  }
}

export interface IGlobalRangesInfoResponse {
  pool_mode: string;
  total_pools: number;
  total_volume: number;
  total_liquidity: number;
  total_virtual_liquidity: number;
  total_pool_fees: number;
}

export class GlobalRangesInfo {
  poolMode: string;
  totalPools: number;
  totalVolume: BN;
  totalLiquidity: BN;
  totalVirtualLiquidity: BN;
  totalPoolFees: BN;
  constructor(params: IGlobalRangesInfoResponse) {
    this.poolMode = params.pool_mode;
    this.totalPools = params.total_pools;
    this.totalVolume = new BN(params.total_volume);
    this.totalLiquidity = new BN(params.total_liquidity);
    this.totalVirtualLiquidity = new BN(params.total_virtual_liquidity);
    this.totalPoolFees = new BN(params.total_pool_fees);
  }
}
