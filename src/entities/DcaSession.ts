import { DCA, TOKENS_BY_ASSET_ID } from "@src/constants";
import BN from "@src/utils/BN";

export interface IDcaSessionParams {
  id: string;
  owner: string;
  active: boolean;
  paused: boolean;
  fromAssetId: string;
  toAssetId: string;
  blocksPerTrade: number;
  minOut: BN;
  amountPerSwap: BN;
  remaining: number;
  total: number;
  lastBlock: number;
  balance: BN;
  execWaves: BN;
  created: number;
  totalReceived: BN;
  currentHeight: number;
}

export type TDcaSessionStatus = "active" | "paused" | "completed" | "stopped";

/**
 * A single DCA session as it is stored on the community DCA contract.
 * All amounts are kept in atomic units, exactly as the contract holds them.
 */
export class DcaSession {
  readonly id: string;
  readonly owner: string;
  readonly active: boolean;
  readonly paused: boolean;
  readonly fromAssetId: string;
  readonly toAssetId: string;
  readonly blocksPerTrade: number;
  readonly minOut: BN;
  readonly amountPerSwap: BN;
  readonly remaining: number;
  readonly total: number;
  readonly lastBlock: number;
  readonly balance: BN;
  readonly execWaves: BN;
  readonly created: number;
  readonly totalReceived: BN;
  readonly currentHeight: number;

  constructor(params: IDcaSessionParams) {
    this.id = params.id;
    this.owner = params.owner;
    this.active = params.active;
    this.paused = params.paused;
    this.fromAssetId = params.fromAssetId;
    this.toAssetId = params.toAssetId;
    this.blocksPerTrade = params.blocksPerTrade;
    this.minOut = params.minOut;
    this.amountPerSwap = params.amountPerSwap;
    this.remaining = params.remaining;
    this.total = params.total;
    this.lastBlock = params.lastBlock;
    this.balance = params.balance;
    this.execWaves = params.execWaves;
    this.created = params.created;
    this.totalReceived = params.totalReceived;
    this.currentHeight = params.currentHeight;
  }

  get tokenFrom() {
    return TOKENS_BY_ASSET_ID[this.fromAssetId];
  }

  get tokenTo() {
    return TOKENS_BY_ASSET_ID[this.toAssetId];
  }

  get symbolFrom() {
    return this.tokenFrom?.symbol ?? this.fromAssetId;
  }

  get symbolTo() {
    return this.tokenTo?.symbol ?? this.toAssetId;
  }

  get completedSwaps() {
    return this.total - this.remaining;
  }

  get progress() {
    if (this.total === 0) return 0;
    return Math.min(100, Math.round((this.completedSwaps / this.total) * 100));
  }

  /**
   * `stop` and the auto-completion branch delete `amount_` and `balance_` and refund
   * the funds, so a session without them can no longer be resumed.
   */
  get resumable() {
    return this.paramsIntact;
  }

  private get paramsIntact() {
    return this.blocksPerTrade > 0 && this.amountPerSwap.gt(0);
  }

  get status(): TDcaSessionStatus {
    if (this.active && this.paused) return "paused";
    if (this.active) return "active";
    return this.remaining === 0 ? "completed" : "stopped";
  }

  /** Blocks left before the service is allowed to execute the next swap. */
  get blocksUntilNext() {
    if (!this.active || this.blocksPerTrade === 0) return 0;
    const passed = this.currentHeight - this.lastBlock;
    return Math.max(0, this.blocksPerTrade - passed);
  }

  get minutesUntilNext() {
    return Math.ceil((this.blocksUntilNext * DCA.blockTimeSeconds) / 60);
  }

  get formattedAmountPerSwap() {
    return BN.formatUnits(this.amountPerSwap, this.tokenFrom?.decimals ?? 8);
  }

  get formattedBalance() {
    return BN.formatUnits(this.balance, this.tokenFrom?.decimals ?? 8);
  }

  get formattedTotalReceived() {
    return BN.formatUnits(this.totalReceived, this.tokenTo?.decimals ?? 8);
  }

  get formattedExecWaves() {
    return BN.formatUnits(this.execWaves, 8);
  }

  /** Swaps still covered by the prepaid execution gas. */
  get swapsCoveredByGas() {
    return this.execWaves.div(DCA.executionFeePerSwap).toDecimalPlaces(0).toNumber();
  }

  get isOutOfGas() {
    return this.active && this.remaining > 0 && this.execWaves.lt(DCA.executionFeePerSwap);
  }
}

export default DcaSession;
