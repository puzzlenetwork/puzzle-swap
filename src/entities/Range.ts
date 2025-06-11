import nodeService from "@src/services/nodeService";
import BN from "@src/utils/BN";
import { IHistory } from "@src/utils/types";
import { makeAutoObservable } from "mobx";

export interface IRangeAsset {
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

export interface IReward {
  asset_id: string;
  name: string;
  amount: number;
  amount_usd: number;
}

export interface IProviderStaked {
  address: string;
  index_staked: number;
  share: number;
  claimed_usd: number;
  unclaimed_usd: number;
  rewards: IReward[];
}

export interface IStakedProviders {
  total_index_staked: number;
  providers_staked: IProviderStaked[];
  total_staked_providers: number;
}

export interface IStats {
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

export interface IPeriodFees {
  [assetId: string]: {
    fees_earned: number;
    extra_earned: number;
  };
}

export interface IRangeParams {
  address: string;
  artefact_origin_transaction_id: string;
  assets: IRangeAsset[];
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
  extra_earned: IReward[];
  staked_providers: IStakedProviders;
  stats: IStats;
  period_fees: IPeriodFees;
  totals: Record<string, any>;
  charts?: IHistory[];
}

export class Range {
  address: string;
  artefactOriginTransactionId: string;
  assets: IRangeAsset[];
  createdAt: number;
  domain: string;
  feeTokenId: string;
  isCustom: boolean;
  lastHistoricalTxId: string;
  lastProcessedTxId: string;
  lastSavedTime: number;
  layer2Address: string;
  liquidity: number;
  logo: string;
  lpTokenAmount: number;
  lpTokenId: string;
  mode: string;
  owner: string;
  rebalances: any[];
  swapFee: number;
  title: string;
  version: string;
  baseTokenId: string;
  datastorage: Record<string, number | string>;
  nominalAsset: string;
  staticKMult: number;
  virtualLiquidity: number;
  extraEarned: IReward[];
  stakedProviders: IStakedProviders;
  stats: IStats;
  periodFees: IPeriodFees;
  totals: Record<string, any>;
  charts?: IHistory[];

  constructor(params: IRangeParams) {
    this.address = params.address;
    this.artefactOriginTransactionId = params.artefact_origin_transaction_id;
    this.assets = params.assets;
    this.createdAt = params.created_at;
    this.domain = params.domain;
    this.feeTokenId = params.fee_token_id;
    this.isCustom = params.isCustom;
    this.lastHistoricalTxId = params.last_historical_txId;
    this.lastProcessedTxId = params.last_processed_txId;
    this.lastSavedTime = params.last_saved_time;
    this.layer2Address = params.layer_2_address;
    this.liquidity = params.liquidity;
    this.logo = params.logo;
    this.lpTokenAmount = params.lp_token_amount;
    this.lpTokenId = params.lp_token_id;
    this.mode = params.mode;
    this.owner = params.owner;
    this.rebalances = params.rebalances;
    this.swapFee = params.swap_fee;
    this.title = params.title;
    this.version = params.version;
    this.baseTokenId = params.base_token_id;
    this.datastorage = params.datastorage;
    this.nominalAsset = params.nominal_asset;
    this.staticKMult = params.static_KMult;
    this.virtualLiquidity = params.virtual_liquidity;
    this.extraEarned = params.extra_earned;
    this.stakedProviders = params.staked_providers;
    this.stats = params.stats;
    this.periodFees = params.period_fees;
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

  get indexTokenRate(): BN | null {
    if (!this.lpTokenAmount)
      return null;
    return new BN(this.liquidity).div(this.lpTokenAmount);
  }

  contractKeysRequest = (keys: string[] | string) =>
    nodeService.nodeKeysRequest(this.address, keys);
} 