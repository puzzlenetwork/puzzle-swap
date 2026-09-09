import { CONTRACT_ADDRESSES, DCA, EXPLORER_URL, TOKENS_BY_ASSET_ID, TOKENS_BY_SYMBOL } from "@src/constants";
import DcaSession from "@src/entities/DcaSession";
import { useVM } from "@src/hooks/useVM";
import aggregatorService from "@src/services/aggregatorService";
import dcaService from "@src/services/dcaService";
import BN from "@src/utils/BN";
import { RootStore, useStores } from "@stores";
import { makeAutoObservable, reaction } from "mobx";
import React, { useMemo } from "react";

interface IProps {
  children: React.ReactNode;
}

const ctx = React.createContext<DcaVM | null>(null);

export const DcaVMProvider: React.FC<IProps> = ({ children }) => {
  const rootStore = useStores();
  const store = useMemo(() => new DcaVM(rootStore), [rootStore]);
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useDcaVM = () => useVM(ctx);

const SYNC_INTERVAL = 30 * 1000;
const QUOTE_INTERVAL = 30 * 1000;
/** Default distance between the current quote and the session-wide minimum output. */
const DEFAULT_MIN_OUT_DISCOUNT = 10;

export class DcaVM {
  constructor(private rootStore: RootStore) {
    makeAutoObservable(this);

    const params = new URLSearchParams(window.location.search);
    this.assetId0 = params.get("asset0") ?? TOKENS_BY_SYMBOL.XTN.assetId;
    this.assetId1 = params.get("asset1") ?? TOKENS_BY_SYMBOL.WAVES.assetId;
    if (this.assetId0 === this.assetId1) {
      this.assetId1 = TOKENS_BY_SYMBOL.PUZZLE.assetId;
    }

    this.syncSessions();
    this.syncQuote();

    this.sessionsInterval = setInterval(() => this.syncSessions(), SYNC_INTERVAL);
    this.quoteInterval = setInterval(() => this.syncQuote(), QUOTE_INTERVAL);

    reaction(
      () => this.rootStore.accountStore.address,
      () => this.syncSessions()
    );
    reaction(
      () => [this.assetId0, this.assetId1, this.totalAmount.toString(), this.swaps],
      () => {
        this.minOutTouched = false;
        this.syncQuote();
      }
    );
  }

  private sessionsInterval: NodeJS.Timeout | null = null;
  private quoteInterval: NodeJS.Timeout | null = null;

  dispose = () => {
    this.sessionsInterval && clearInterval(this.sessionsInterval);
    this.quoteInterval && clearInterval(this.quoteInterval);
    this.sessionsInterval = null;
    this.quoteInterval = null;
  };

  /*  ------------------------------------------------------------------ form  */

  assetId0: string;
  setAssetId0 = (assetId: string) => {
    if (assetId === this.assetId1) return;
    this.assetId0 = assetId;
    this.setTotalAmount(BN.ZERO);
  };

  assetId1: string;
  setAssetId1 = (assetId: string) => {
    if (assetId === this.assetId0) return;
    this.assetId1 = assetId;
  };

  switchTokens = () => {
    const assetId0 = this.assetId0;
    this.assetId0 = this.assetId1;
    this.assetId1 = assetId0;
    this.setTotalAmount(BN.ZERO);
  };

  /** Total amount the user deposits, in atomic units of token0. */
  totalAmount: BN = BN.ZERO;
  setTotalAmount = (v: BN) => (this.totalAmount = v);

  swaps = 10;
  setSwaps = (v: number) => (this.swaps = v);

  blocksPerTrade = 60;
  setBlocksPerTrade = (v: number) => (this.blocksPerTrade = v);

  /** Session-wide floor for the output of every single swap, atomic units of token1. */
  minOut: BN = BN.ZERO;
  minOutTouched = false;
  setMinOut = (v: BN) => {
    this.minOut = v;
    this.minOutTouched = true;
  };

  loading = false;
  private setLoading = (v: boolean) => (this.loading = v);

  syncing = false;
  private setSyncing = (v: boolean) => (this.syncing = v);

  quoting = false;
  private setQuoting = (v: boolean) => (this.quoting = v);

  /** Aggregator output for one net swap, atomic units of token1. */
  quotePerSwap: BN | null = null;
  private setQuotePerSwap = (v: BN | null) => (this.quotePerSwap = v);

  quoteError = false;
  private setQuoteError = (v: boolean) => (this.quoteError = v);

  sessions: DcaSession[] = [];
  private setSessions = (v: DcaSession[]) => (this.sessions = v);

  serviceEnabled = true;
  private setServiceEnabled = (v: boolean) => (this.serviceEnabled = v);

  showFinishedSessions = false;
  setShowFinishedSessions = (v: boolean) => (this.showFinishedSessions = v);

  /*  ------------------------------------------------------------- computed  */

  get token0() {
    return TOKENS_BY_ASSET_ID[this.assetId0];
  }

  get token1() {
    return TOKENS_BY_ASSET_ID[this.assetId1];
  }

  get balances() {
    return this.rootStore.accountStore.balances;
  }

  get balance0() {
    return this.rootStore.accountStore.findBalanceByAssetId(this.assetId0)?.balance ?? BN.ZERO;
  }

  get wavesBalance() {
    return this.rootStore.accountStore.findBalanceByAssetId("WAVES")?.balance ?? BN.ZERO;
  }

  /** `amountPerSwap` argument of the contract — declared before the service fee. */
  get amountPerSwapArg(): BN {
    if (this.swaps <= 0) return BN.ZERO;
    return this.totalAmount.div(this.swaps).toDecimalPlaces(0);
  }

  /** What actually leaves the wallet: the contract requires amountPerSwap * swaps. */
  get tokenPayment(): BN {
    return this.amountPerSwapArg.times(this.swaps);
  }

  get serviceFee(): BN {
    return this.tokenPayment.times(DCA.serviceFeePercent).div(100).toDecimalPlaces(0);
  }

  /** Amount actually swapped on every iteration, after the service fee. */
  get netAmountPerSwap(): BN {
    if (this.swaps <= 0) return BN.ZERO;
    return this.tokenPayment.minus(this.serviceFee).div(this.swaps).toDecimalPlaces(0);
  }

  /** Prepaid execution gas: swaps * executionFeePerSwap + reserve. */
  get executionGas(): BN {
    return new BN(DCA.executionFeePerSwap).times(this.swaps).plus(DCA.executionFeeReserve);
  }

  get totalWavesRequired(): BN {
    const payment = this.assetId0 === "WAVES" ? this.tokenPayment : BN.ZERO;
    return this.executionGas.plus(payment);
  }

  get estimatedDurationMinutes(): number {
    return Math.round((this.blocksPerTrade * this.swaps * DCA.blockTimeSeconds) / 60);
  }

  get intervalMinutes(): number {
    return Math.round((this.blocksPerTrade * DCA.blockTimeSeconds) / 60);
  }

  get amountError(): boolean {
    return this.totalAmount.gt(this.balance0);
  }

  get wavesError(): boolean {
    return this.totalWavesRequired.gt(this.wavesBalance);
  }

  get amountTooSmall(): boolean {
    return this.totalAmount.gt(0) && this.netAmountPerSwap.lt(DCA.minAmountPerSwap);
  }

  get swapsError(): boolean {
    return this.swaps < DCA.minSwaps || this.swaps > DCA.maxSwaps;
  }

  get blocksError(): boolean {
    return this.blocksPerTrade < DCA.minBlocksPerTrade || this.blocksPerTrade > DCA.maxBlocksPerTrade;
  }

  get minOutError(): boolean {
    return this.minOut.lte(0);
  }

  get error(): string | null {
    if (!this.serviceEnabled) return "DCA service is paused by its operator";
    if (this.assetId0 === this.assetId1) return "Pick two different tokens";
    if (this.totalAmount.eq(0)) return "Enter an amount";
    if (this.swapsError) return `Number of swaps must be between ${DCA.minSwaps} and ${DCA.maxSwaps}`;
    if (this.blocksError) return `Interval must be between ${DCA.minBlocksPerTrade} and ${DCA.maxBlocksPerTrade} blocks`;
    if (this.amountError) return `Not enough ${this.token0?.symbol}`;
    if (this.amountTooSmall) return "Amount per swap is too small after the 1% fee";
    if (this.wavesError) return "Not enough WAVES to prepay execution gas";
    if (this.minOutError) return "Set a minimum received amount";
    return null;
  }

  get canStart(): boolean {
    return this.error == null && !this.loading;
  }

  get activeSessions(): DcaSession[] {
    return this.sessions.filter(({ active }) => active);
  }

  get finishedSessions(): DcaSession[] {
    return this.sessions.filter(({ active }) => !active);
  }

  get visibleSessions(): DcaSession[] {
    return this.showFinishedSessions ? this.sessions : this.activeSessions;
  }

  /*  ---------------------------------------------------------------- sync  */

  syncSessions = async () => {
    const { address } = this.rootStore.accountStore;
    if (address == null) {
      this.setSessions([]);
      return;
    }
    this.setSyncing(true);
    try {
      const [sessions, enabled] = await Promise.all([
        dcaService.getUserSessions(address),
        dcaService.isServiceEnabled(),
      ]);
      this.setSessions(sessions);
      this.setServiceEnabled(enabled);
    } catch (e) {
      // a node hiccup should not blank out the list the user is looking at
    } finally {
      this.setSyncing(false);
    }
  };

  /**
   * Quotes one net swap through the aggregator and, unless the user typed their own
   * value, pre-fills the session floor a fixed distance below that quote.
   */
  syncQuote = async () => {
    if (this.netAmountPerSwap.lte(0) || this.assetId0 === this.assetId1) {
      this.setQuotePerSwap(null);
      this.setQuoteError(false);
      return;
    }
    this.setQuoting(true);
    try {
      const { estimatedOut } = await aggregatorService.calc(this.assetId0, this.assetId1, this.netAmountPerSwap);
      const quote = new BN(estimatedOut);
      this.setQuotePerSwap(quote);
      this.setQuoteError(false);
      if (!this.minOutTouched) {
        this.minOut = quote
          .times(100 - DEFAULT_MIN_OUT_DISCOUNT)
          .div(100)
          .toDecimalPlaces(0);
      }
    } catch (e) {
      this.setQuotePerSwap(null);
      this.setQuoteError(true);
    } finally {
      this.setQuoting(false);
    }
  };

  /*  ------------------------------------------------------------- actions  */

  private notifySuccess = (title: string, message: string, txId: string) =>
    this.rootStore.notificationStore.notify(message, {
      type: "success",
      title,
      link: `${EXPLORER_URL}/transactions/${txId}`,
      linkTitle: "View on Explorer",
    });

  private notifyError = (e: any) =>
    this.rootStore.notificationStore.notify(e?.message ?? e?.toString() ?? "Transaction failed", { type: "warning" });

  start = async () => {
    if (!this.canStart) return;
    this.setLoading(true);
    try {
      const txId = await this.rootStore.accountStore.invoke({
        dApp: CONTRACT_ADDRESSES.dcaBot,
        payment: [
          {
            assetId: this.assetId0 === "WAVES" ? null : this.assetId0,
            amount: this.tokenPayment.toFixed(0),
          },
          { assetId: null, amount: this.executionGas.toFixed(0) },
        ],
        call: {
          function: "start",
          args: [
            { type: "string", value: this.assetId1 },
            { type: "integer", value: String(this.blocksPerTrade) },
            { type: "integer", value: this.minOut.toFixed(0) },
            { type: "integer", value: this.amountPerSwapArg.toFixed(0) },
            { type: "integer", value: String(this.swaps) },
          ],
        },
      });
      if (txId == null) return;
      this.notifySuccess(
        "DCA session started",
        `${this.swaps} swaps of ${this.token0?.symbol} ➔ ${this.token1?.symbol} scheduled`,
        txId
      );
      this.setTotalAmount(BN.ZERO);
      this.minOutTouched = false;
      await this.syncSessions();
    } catch (e) {
      this.notifyError(e);
    } finally {
      this.setLoading(false);
    }
  };

  private callWithSessionId = async (
    functionName: "stop" | "pauseSession" | "resumeSession",
    sessionId: string,
    title: string,
    message: string
  ) => {
    this.setLoading(true);
    try {
      const txId = await this.rootStore.accountStore.invoke({
        dApp: CONTRACT_ADDRESSES.dcaBot,
        payment: [],
        call: { function: functionName, args: [{ type: "string", value: sessionId }] },
      });
      if (txId == null) return;
      this.notifySuccess(title, message, txId);
      await this.syncSessions();
    } catch (e) {
      this.notifyError(e);
    } finally {
      this.setLoading(false);
    }
  };

  stop = (sessionId: string) =>
    this.callWithSessionId("stop", sessionId, "Session stopped", "Remaining tokens and unused gas were refunded");

  pause = (sessionId: string) =>
    this.callWithSessionId("pauseSession", sessionId, "Session paused", "No swaps will run until you resume it");

  resume = (sessionId: string) =>
    this.callWithSessionId("resumeSession", sessionId, "Session resumed", "Scheduled swaps will continue");

  updateMinOut = async (sessionId: string, newMinOut: BN) => {
    if (newMinOut.lte(0)) return;
    this.setLoading(true);
    try {
      const txId = await this.rootStore.accountStore.invoke({
        dApp: CONTRACT_ADDRESSES.dcaBot,
        payment: [],
        call: {
          function: "updateMinOut",
          args: [
            { type: "string", value: sessionId },
            { type: "integer", value: newMinOut.toFixed(0) },
          ],
        },
      });
      if (txId == null) return;
      this.notifySuccess("Minimum output updated", "The new floor applies to the next swap", txId);
      await this.syncSessions();
    } catch (e) {
      this.notifyError(e);
    } finally {
      this.setLoading(false);
    }
  };
}
