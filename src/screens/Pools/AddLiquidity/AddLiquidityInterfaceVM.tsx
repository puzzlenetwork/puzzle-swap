import React, { useMemo } from "react";
import { useVM } from "@src/hooks/useVM";
import { makeAutoObservable, when } from "mobx";
import { RootStore, useStores } from "@stores";
import BN from "@src/utils/BN";
import Balance from "@src/entities/Balance";
import {
  buildErrorDialogParams,
  buildSuccessLiquidityDialogParams,
  buildWarningLiquidityDialogParams,
  buildSwapErrorDialogParams,
  IDialogNotificationProps
} from "@components/Dialog/DialogNotification";
import Pool from "@src/entities/Pool";
import { CONTRACT_ADDRESSES } from "@src/constants";
import aggregatorService, { ICalcResponse } from "@src/services/aggregatorService";

export interface IRecommendedSwap {
  tokenSymbol: string;
  tokenAssetId: string;
  tokenLogo: string;
  tokenShare: number;
  amountToSend: BN;
  amountToSendFormatted: string;
  amountToReceive: BN;
  amountToReceiveFormatted: string;
  sourceToken: {
    symbol: string;
    assetId: string;
    decimals: number;
  };
  aggregatorResponse: ICalcResponse | null;
  loading: boolean;
}

const ctx = React.createContext<AddLiquidityInterfaceVM | null>(null);

interface IProps {
  children: React.ReactNode;
  poolDomain: string;
}

export const AddLiquidityInterfaceVMProvider: React.FC<IProps> = ({ poolDomain, children }) => {
  const rootStore = useStores();
  const store = useMemo(() => new AddLiquidityInterfaceVM(rootStore, poolDomain), [rootStore, poolDomain]);
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useAddLiquidityInterfaceVM = () => useVM(ctx);

class AddLiquidityInterfaceVM {
  public poolDomain: string;
  public rootStore: RootStore;
  public baseTokenAmount: BN = BN.ZERO;
  public setBaseTokenAmount = (value: BN) => (this.baseTokenAmount = value);

  public selectedTokenId: string | null = null;
  public setSelectedTokenId = (assetId: string) => {
    this.selectedTokenId = assetId;
    this.baseTokenAmount = BN.ZERO;
  };

  public changePoolModalOpen: boolean = false;
  setChangePoolModalOpen = (value: boolean) => (this.changePoolModalOpen = value);

  loading: boolean = false;
  private _setLoading = (l: boolean) => (this.loading = l);

  public notificationParams: IDialogNotificationProps | null = null;
  public setNotificationParams = (params: IDialogNotificationProps | null) => (this.notificationParams = params);

  providedPercentOfPool: BN = new BN(50);
  setProvidedPercentOfPool = (value: number | number[]) => (this.providedPercentOfPool = new BN(value.toString()));

  private _pool: Pool | null = null;
  private _setPool = (pool: Pool) => (this._pool = pool);

  initialized: boolean = false;
  private setInitialized = (v: boolean) => (this.initialized = v);

  public get pool() {
    return this.rootStore.poolsStore.getPoolByDomain(this.poolDomain);
  }

  constructor(rootStore: RootStore, poolDomain: string) {
    this.poolDomain = poolDomain;
    this.rootStore = rootStore;
    when(
      () => this.rootStore.poolsStore.customPools.length > 0,
      () => {
        const pool = this.rootStore.poolsStore.customPools.find(({ domain }) => domain === this.poolDomain);
        if (pool) {
          this._setPool(pool);
          const hasBaseToken = pool.tokens.some(t => t.assetId === pool.base_token_id);
          this.selectedTokenId = hasBaseToken ? pool.base_token_id : pool.tokens[0]?.assetId ?? null;
        }
        this.setInitialized(true);
      }
    );

    makeAutoObservable(this);
  }

  public get poolTokenBalances() {
    const { accountStore } = this.rootStore;
    return this.pool?.tokens
      ?.map((token) => accountStore.findBalanceByAssetId(token.assetId))
      .filter((balance) => balance != null) as Balance[];
  }

  public get balances() {
    const { accountStore } = this.rootStore;
    return this.pool?.tokens
      .map((t) => {
        const balance = accountStore.findBalanceByAssetId(t.assetId);
        return balance ?? new Balance(t);
      })
      .sort((a, b) => {
        if (a.usdnEquivalent == null && b.usdnEquivalent == null) return 0;
        if (a.usdnEquivalent == null && b.usdnEquivalent != null) return 1;
        if (a.usdnEquivalent == null && b.usdnEquivalent == null) return -1;
        return a.usdnEquivalent!.lt(b.usdnEquivalent!) ? 1 : -1;
      });
  }

  public get baseToken() {
    if (!this.pool) return undefined as any;
    if (this.selectedTokenId) {
      const token = this.pool.getAssetById(this.selectedTokenId);
      if (token) return token;
    }
    const baseToken = this.pool.getAssetById(this.pool.base_token_id);
    if (baseToken) return baseToken;
    return this.pool.tokens[0];
  }

  get minPIssued() {
    if (this.pool == null) return null;

    return BN.min(
      ...this.pool.tokens.map(({ assetId }) => {
        const asset = this.rootStore.accountStore.findBalanceByAssetId(assetId);
        return this.pool!.globalPoolTokenAmount.times(asset?.balance ?? BN.ZERO).div(this.pool!.liquidity[assetId]);
      })
    );
  }

  get canMultipleDeposit() {
    return (
      this.tokensToDepositAmounts != null &&
      Object.values(this.tokensToDepositAmounts).every((v) => v.gt(0)) &&
      this.providedPercentOfPool.gt(0)
    );
  }

  get minBalanceAsset(): Balance | null {
    const { accountStore } = this.rootStore;
    if (this.pool == null || accountStore.assetBalances == null) return null;
    const balances = accountStore.assetBalances.filter((balance) =>
      this.pool!.tokens.some((t) => t.assetId === balance.assetId)
    );
    return balances.sort((a, b) => (a.usdnEquivalent!.gt(b.usdnEquivalent!) ? 1 : -1))[0];
  }

  get zeroAssetBalances(): number | null {
    const { accountStore } = this.rootStore;
    if (this.pool == null || accountStore.assetBalances == null) return null;
    const balances = accountStore.assetBalances.filter((balance) =>
      this.pool!.tokens.some((t) => t.assetId === balance.assetId)
    );
    return balances.filter(({ balance }) => balance && balance.eq(0)).length;
  }

  get tokensToDepositAmounts(): Record<string, BN> | null {
    if (this.pool == null) return null;

    return this.pool.tokens.reduce<Record<string, BN>>((acc, { assetId }) => {
      const tokenBalance = (this.pool && this.pool.liquidity[assetId]) ?? BN.ZERO;
      const dk = this.pool!.globalPoolTokenAmount.plus(this.minPIssued ?? BN.ZERO)
        .div(this.pool!.globalPoolTokenAmount)
        .minus(new BN(1))
        .times(tokenBalance)
        .times(this.providedPercentOfPool)
        .times(0.01);
      return {
        ...acc,
        [assetId]: dk
      };
    }, {});
  }

  get baseTokenAmountUsdnEquivalent() {
    if (this.baseToken == null) return "";
    const rate = this.rootStore.poolsStore.usdtRate(this.baseToken.assetId, 1) ?? BN.ZERO;
    const value = rate.times(this.baseTokenAmount);
    return "~ " + BN.formatUnits(value, this.baseToken.decimals).toFixed(2);
  }

  get totalAmountToDeposit(): string | null {
    const tokensToDepositAmounts = this.tokensToDepositAmounts;
    if (tokensToDepositAmounts == null || this.pool == null) return null;
    const total = this.pool.tokens.reduce<BN>((acc, token) => {
      const rate = this.rootStore.poolsStore.usdtRate(token.assetId, 1) ?? BN.ZERO;
      const balance = tokensToDepositAmounts[token.assetId];
      const usdnEquivalent = BN.formatUnits(balance.times(rate), token.decimals);
      return acc.plus(usdnEquivalent);
    }, BN.ZERO);

    if (total.eq(0) && this.recommendedSwaps.length > 0) {
      return this.potentialAmountToDeposit;
    }

    return !total.isNaN() ? "$ " + total.toFormat(total?.toNumber() > 0.001 ? 2 : 4) : null;
  }

  get potentialAmountToDeposit(): string | null {
    if (this.pool == null || this.recommendedSwaps.length === 0) return null;

    const projectedBalances: Record<string, BN> = {};

    for (const token of this.pool.tokens) {
      const currentBalance = this.rootStore.accountStore.findBalanceByAssetId(token.assetId)?.balance ?? BN.ZERO;
      const swap = this.recommendedSwaps.find(s => s.tokenAssetId === token.assetId);
      const additionalAmount = swap?.amountToReceive ?? BN.ZERO;
      projectedBalances[token.assetId] = currentBalance.plus(additionalAmount);
    }

    const projectedMinPIssued = BN.min(
      ...this.pool.tokens.map(({ assetId }) => {
        const balance = projectedBalances[assetId] ?? BN.ZERO;
        return this.pool!.globalPoolTokenAmount.times(balance).div(this.pool!.liquidity[assetId]);
      })
    );

    const projectedTotal = this.pool.tokens.reduce<BN>((acc, token) => {
      const tokenBalance = this.pool!.liquidity[token.assetId] ?? BN.ZERO;
      const dk = this.pool!.globalPoolTokenAmount.plus(projectedMinPIssued)
        .div(this.pool!.globalPoolTokenAmount)
        .minus(new BN(1))
        .times(tokenBalance)
        .times(this.providedPercentOfPool)
        .times(0.01);

      const rate = this.rootStore.poolsStore.usdtRate(token.assetId, 1) ?? BN.ZERO;
      const usdnEquivalent = BN.formatUnits(dk.times(rate), token.decimals);
      return acc.plus(usdnEquivalent);
    }, BN.ZERO);

    return !projectedTotal.isNaN() && projectedTotal.gt(0)
      ? "~$ " + projectedTotal.toFormat(projectedTotal.toNumber() > 0.001 ? 2 : 4)
      : null;
  }

  get baseTokenBalance() {
    return this.rootStore.accountStore.findBalanceByAssetId(this.baseToken.assetId);
  }

  get canDepositBaseToken(): boolean {
    const asset = this.baseTokenBalance;
    if (asset == null || asset.balance == null) return false;
    if (this.baseTokenAmount.eq(0)) return false;
    return asset.balance?.gt(0.0001) && !asset.balance.lt(this.baseTokenAmount);
  }

  depositMultiply = async () => {
    const { accountStore } = this.rootStore;
    if (this.pool?.address == null) return;
    if (this.tokensToDepositAmounts == null || this.pool.layer2Address == null) return;
    this._setLoading(true);
    this.setNotificationParams(null);
    const payment = Object.entries(this.tokensToDepositAmounts).reduce(
      (acc, [assetId, value]) => [
        ...acc,
        {
          assetId: assetId === "WAVES" ? null : assetId,
          amount: value.toSignificant(0).toString()
        }
      ],
      [] as Array<{ assetId: string | null; amount: string }>
    );

    accountStore
      .invoke({
        dApp: CONTRACT_ADDRESSES.layer2,
        payment,
        call: {
          function: "generateIndexAndStake",
          args: this.pool.isCustom ? [{ type: "string", value: this.pool.address }] : []
        }
      })
      .then((txId) => {
        txId &&
          this.setNotificationParams(
            buildSuccessLiquidityDialogParams({
              accountStore,
              poolDomain: this.poolDomain,
              txId: txId
            })
          );
      })
      .catch((e) => {
        this.setNotificationParams(
          buildErrorDialogParams({
            title: "Transaction is not completed",
            description: e.message ?? JSON.stringify(e),
            onTryAgain: this.depositMultiply
          })
        );
      })
      .then(() => accountStore.updateAccountAssets(true))
      .finally(() => this._setLoading(false));
  };

  onMaxBaseTokenClick = () => {
    const userTokenBalance = this.baseTokenBalance;
    userTokenBalance && userTokenBalance.balance && this.setBaseTokenAmount(userTokenBalance.balance);
  };

  showHighSlippageWarning = () => {
    const slippagePercent = this.baseTokenSlippage;
    const { baseToken, baseTokenAmount } = this;
    const slippage = BN.formatUnits(baseTokenAmount.times(slippagePercent), baseToken.decimals).toFormat(2);
    const formatSlippagePercent = slippagePercent.times(100).toFormat(2);
    this.setNotificationParams(
      buildWarningLiquidityDialogParams({
        title: "High slippage rate",
        description: `You might lose up to ${slippage} ${baseToken.symbol} (${formatSlippagePercent} % of the total amount) on this operation due to slippage. We recommend to cancel this operation and use several transactions to split your deposit to smaller parts.`,
        onContinue: this.depositBaseToken,
        continueText: "Add liquidity",
        onCancel: () => this.setNotificationParams(null)
      })
    );
  };

  get baseTokenSlippage(): BN {
    const { pool, baseToken } = this;
    if (pool == null || pool.liquidity == null || baseToken == null) return BN.ZERO;
    const liquidity = pool.liquidity[this.baseToken.assetId];
    return new BN(1).minus(liquidity.div(liquidity.plus(this.baseTokenAmount)));
  }

  depositBaseToken = async () => {
    if (this.pool?.address == null || this.pool.layer2Address == null || !this.canDepositBaseToken) {
      this.setNotificationParams(null);
      return;
    }
    const { accountStore } = this.rootStore;
    this._setLoading(true);
    this.setNotificationParams(null);
    return accountStore
      .invoke({
        dApp: CONTRACT_ADDRESSES.layer2,
        payment: [
          {
            assetId: this.baseToken.assetId,
            amount: this.baseTokenAmount.toString()
          }
        ],
        call: {
          function: "generateIndexWithOneTokenAndStake",
          args: this.pool.isCustom ? [{ type: "string", value: this.pool.address }] : []
        }
      })
      .then((txId) => {
        if (txId) this.handleDepositSuccess(txId);
      })
      .catch((e) => {
        this.setNotificationParams(
          buildErrorDialogParams({
            title: "Smart Contract Error",
            description: `Error: ${e.message || e.toString()}\n\nThis error needs to be addressed by the smart contract developer. The contract may not support single token deposits for non-base tokens yet.`,
            onTryAgain: this.depositBaseToken
          })
        );
      })
      .finally(this.handleDepositFinally);
  }

  private handleDepositSuccess = (txId: string) => {
    this.setNotificationParams(
      buildSuccessLiquidityDialogParams({
        accountStore: this.rootStore.accountStore,
        poolDomain: this.poolDomain,
        txId: txId ?? ""
      })
    );
  }

  private handleDepositFinally = () => {
    this.rootStore.accountStore.updateAccountAssets(true);
    this._setLoading(false);
  };

  recommendedSwaps: IRecommendedSwap[] = [];
  private _setRecommendedSwaps = (swaps: IRecommendedSwap[]) => (this.recommendedSwaps = swaps);

  swapsLoading: boolean = false;
  private _setSwapsLoading = (v: boolean) => (this.swapsLoading = v);

  swapAllLoading: boolean = false;
  private _setSwapAllLoading = (v: boolean) => (this.swapAllLoading = v);

  swapProgress: { current: number; total: number; currentToken: { symbol: string; logo: string } | null } = {
    current: 0,
    total: 0,
    currentToken: null
  };
  private _setSwapProgress = (progress: typeof this.swapProgress) => (this.swapProgress = progress);

  swapResults: Record<string, 'success' | 'failed'> = {};
  private _setSwapResult = (tokenAssetId: string, result: 'success' | 'failed') => {
    this.swapResults = { ...this.swapResults, [tokenAssetId]: result };
  };
  private _clearSwapResults = () => {
    this.swapResults = {};
  };

  customSourceTokens: Record<string, { assetId: string; symbol: string; decimals: number; logo: string }> = {};

  updateSwapSourceToken = async (targetTokenAssetId: string, newSourceAssetId: string) => {
    const { accountStore } = this.rootStore;
    const sourceBalance = accountStore.findBalanceByAssetId(newSourceAssetId);

    if (!sourceBalance) return;

    this.customSourceTokens[targetTokenAssetId] = {
      assetId: sourceBalance.assetId,
      symbol: sourceBalance.symbol ?? "Unknown",
      decimals: sourceBalance.decimals ?? 8,
      logo: sourceBalance.logo ?? ""
    };

    const swapIndex = this.recommendedSwaps.findIndex(s => s.tokenAssetId === targetTokenAssetId);
    if (swapIndex === -1) return;

    const swap = this.recommendedSwaps[swapIndex];
    const targetToken = this.pool?.tokens.find(t => t.assetId === targetTokenAssetId);
    if (!targetToken) return;

    const requiredAmounts = this.requiredTokenAmounts;
    if (!requiredAmounts) return;

    const requiredAmount = requiredAmounts[targetTokenAssetId] || BN.ZERO;
    const userBalance = accountStore.findBalanceByAssetId(targetTokenAssetId)?.balance ?? BN.ZERO;
    const deficit = requiredAmount.minus(userBalance);

    if (deficit.lte(0)) return;

    const deficitFormatted = BN.formatUnits(deficit, targetToken.decimals);
    const targetRate = this.rootStore.poolsStore.usdtRate(targetTokenAssetId) ?? BN.ZERO;
    const deficitUsd = deficitFormatted.times(targetRate);

    const sourceRate = this.rootStore.poolsStore.usdtRate(newSourceAssetId) ?? BN.ZERO;
    if (sourceRate.eq(0)) return;

    const estimatedSourceAmount = deficitUsd.div(sourceRate);
    const sourceToken = this.customSourceTokens[targetTokenAssetId];

    const sourceAmountRaw = estimatedSourceAmount.times(1.02).times(new BN(10).pow(sourceToken.decimals));
    const sourceAmountWithBuffer = new BN(sourceAmountRaw.toFixed(0));

    if (sourceAmountWithBuffer.lt(1000)) return;

    try {
      const calcResponse = await aggregatorService.calc(
        sourceToken.assetId,
        targetTokenAssetId,
        sourceAmountWithBuffer
      );

      const amountToReceive = new BN(calcResponse.estimatedOut || 0);

      const updatedSwaps = [...this.recommendedSwaps];
      updatedSwaps[swapIndex] = {
        ...swap,
        sourceToken: {
          symbol: sourceToken.symbol,
          assetId: sourceToken.assetId,
          decimals: sourceToken.decimals
        },
        amountToSend: sourceAmountWithBuffer,
        amountToSendFormatted: BN.formatUnits(sourceAmountWithBuffer, sourceToken.decimals).toFormat(4),
        amountToReceive,
        amountToReceiveFormatted: BN.formatUnits(amountToReceive, targetToken.decimals).toFormat(4),
        aggregatorResponse: calcResponse
      };
      this._setRecommendedSwaps(updatedSwaps);
    } catch (e) {}
  };

  getSourceTokenLogo = (targetTokenAssetId: string): string | undefined => {
    const customLogo = this.customSourceTokens[targetTokenAssetId]?.logo;
    if (customLogo) return customLogo;

    const defaultSource = this.sourceTokenForSwaps;
    const balance = this.rootStore.accountStore.findBalanceByAssetId(defaultSource.assetId);
    return balance?.logo;
  };

  updateSwapAmount = async (targetTokenAssetId: string, amountStr: string) => {
    const swapIndex = this.recommendedSwaps.findIndex(s => s.tokenAssetId === targetTokenAssetId);
    if (swapIndex === -1) return;

    const swap = this.recommendedSwaps[swapIndex];
    const targetToken = this.pool?.tokens.find(t => t.assetId === targetTokenAssetId);
    if (!targetToken) return;

    // Remove thousand separators (commas) before parsing
    const cleanAmountStr = amountStr.replace(/,/g, "");
    const amount = parseFloat(cleanAmountStr);
    if (isNaN(amount) || amount <= 0) return;

    const sourceAmountRaw = new BN(amount).times(new BN(10).pow(swap.sourceToken.decimals));
    const sourceAmount = new BN(sourceAmountRaw.toFixed(0));

    if (sourceAmount.lte(0)) return;

    try {
      const calcResponse = await aggregatorService.calc(
        swap.sourceToken.assetId,
        targetTokenAssetId,
        sourceAmount
      );

      const amountToReceive = new BN(calcResponse.estimatedOut || 0);

      const updatedSwaps = [...this.recommendedSwaps];
      updatedSwaps[swapIndex] = {
        ...swap,
        amountToSend: sourceAmount,
        amountToSendFormatted: BN.formatUnits(sourceAmount, swap.sourceToken.decimals).toFormat(4),
        amountToReceive,
        amountToReceiveFormatted: BN.formatUnits(amountToReceive, targetToken.decimals).toFormat(4),
        aggregatorResponse: calcResponse
      };
      this._setRecommendedSwaps(updatedSwaps);
    } catch (e) {}
  };

  get tokensWithSurplus(): Array<{
    token: { symbol: string; assetId: string; decimals: number; logo?: string };
    surplus: BN;
    surplusUsd: BN;
  }> {
    const { accountStore, poolsStore } = this.rootStore;
    if (this.pool == null || this.requiredTokenAmounts == null) return [];

    const result: Array<{
      token: { symbol: string; assetId: string; decimals: number; logo?: string };
      surplus: BN;
      surplusUsd: BN;
    }> = [];

    for (const poolToken of this.pool.tokens) {
      const balance = accountStore.findBalanceByAssetId(poolToken.assetId);
      const currentBalance = balance?.balance ?? BN.ZERO;
      const requiredAmount = this.requiredTokenAmounts![poolToken.assetId] ?? BN.ZERO;

      const surplus = currentBalance.minus(requiredAmount);
      if (surplus.gt(0)) {
        const rate = poolsStore.usdtRate(poolToken.assetId, 1) ?? BN.ZERO;
        const surplusUsd = BN.formatUnits(surplus, poolToken.decimals).times(rate);

        if (surplusUsd.gt(1)) {
          result.push({
            token: {
              symbol: poolToken.symbol,
              assetId: poolToken.assetId,
              decimals: poolToken.decimals,
              logo: poolToken.logo
            },
            surplus,
            surplusUsd
          });
        }
      }
    }

    return result.sort((a, b) => b.surplusUsd.minus(a.surplusUsd).toNumber());
  }

  get nonPoolSourceTokens(): Array<{
    token: { symbol: string; assetId: string; decimals: number };
    balanceUsd: BN;
  }> {
    const { accountStore, poolsStore } = this.rootStore;
    if (this.pool == null) return [];

    const poolAssetIds = new Set(this.pool.tokens.map(t => t.assetId));

    const priorityTokens = [
      { assetId: "B45iYkZVC9cudR2yxrsJnrM75StiTrwphbfQ7xkyisip", symbol: "USDT", decimals: 6 },
      { assetId: "WAVES", symbol: "WAVES", decimals: 8 },
      { assetId: "DG2xFkPdDwKUoBkzGAhQtLpSGzfXLiCYPEzeKH2Ad24p", symbol: "XTN", decimals: 6 },
      { assetId: "AP4Cb5xLYGH6ZigHreCZHoXpQTWDkPsG2BHqfDUx6taJ", symbol: "ROME", decimals: 8 },
    ];

    const result: Array<{
      token: { symbol: string; assetId: string; decimals: number };
      balanceUsd: BN;
      priority: number;
    }> = [];

    for (let i = 0; i < priorityTokens.length; i++) {
      const token = priorityTokens[i];
      if (poolAssetIds.has(token.assetId)) continue;

      const balance = accountStore.findBalanceByAssetId(token.assetId);
      if (balance?.balance && balance.balance.gt(0)) {
        const rate = poolsStore.usdtRate(token.assetId, 1) ?? BN.ZERO;
        const balanceUsd = BN.formatUnits(balance.balance, token.decimals).times(rate);

        if (balanceUsd.gt(1)) {
          result.push({
            token: { symbol: token.symbol, assetId: token.assetId, decimals: token.decimals },
            balanceUsd,
            priority: i
          });
        }
      }
    }

    const priorityAssetIds = new Set(priorityTokens.map(t => t.assetId));
    const otherBalances = accountStore.assetBalances
      ?.filter((b) => {
        if (poolAssetIds.has(b.assetId)) return false;
        if (priorityAssetIds.has(b.assetId)) return false;
        return b.balance && b.balance.gt(0) && b.usdnEquivalent && b.usdnEquivalent.gt(1);
      })
      .sort((a, b) => (b.usdnEquivalent?.minus(a.usdnEquivalent ?? BN.ZERO).toNumber() ?? 0));

    if (otherBalances) {
      for (const b of otherBalances) {
        result.push({
          token: { symbol: b.symbol ?? "Unknown", assetId: b.assetId, decimals: b.decimals ?? 8 },
          balanceUsd: b.usdnEquivalent ?? BN.ZERO,
          priority: 100
        });
      }
    }

    return result
      .sort((a, b) => a.priority - b.priority || b.balanceUsd.minus(a.balanceUsd).toNumber())
      .map(({ token, balanceUsd }) => ({ token, balanceUsd }));
  }

  get allAvailableSourceTokens(): Array<{
    token: { symbol: string; assetId: string; decimals: number };
    balanceUsd: BN;
    balanceRaw: BN;
  }> {
    const { accountStore } = this.rootStore;
    const result: Array<{
      token: { symbol: string; assetId: string; decimals: number };
      balanceUsd: BN;
      balanceRaw: BN;
    }> = [];

    for (const { token, surplusUsd, surplus } of this.tokensWithSurplus) {
      result.push({
        token: { symbol: token.symbol, assetId: token.assetId, decimals: token.decimals },
        balanceUsd: surplusUsd,
        balanceRaw: surplus
      });
    }

    for (const { token, balanceUsd } of this.nonPoolSourceTokens) {
      const balance = accountStore.findBalanceByAssetId(token.assetId);
      result.push({
        token,
        balanceUsd,
        balanceRaw: balance?.balance ?? BN.ZERO
      });
    }

    return result;
  }

  get sourceTokenForSwaps() {
    const surplusTokens = this.tokensWithSurplus;
    if (surplusTokens.length > 0) {
      const best = surplusTokens[0];
      return {
        symbol: best.token.symbol,
        assetId: best.token.assetId,
        decimals: best.token.decimals
      };
    }

    const nonPoolTokens = this.nonPoolSourceTokens;
    if (nonPoolTokens.length > 0) {
      return nonPoolTokens[0].token;
    }

    return {
      symbol: "USDT",
      assetId: "B45iYkZVC9cudR2yxrsJnrM75StiTrwphbfQ7xkyisip",
      decimals: 6
    };
  }

  get userTotalPoolAssetsUsd(): BN {
    const { accountStore } = this.rootStore;
    if (this.pool == null) return BN.ZERO;

    return this.pool.tokens.reduce((acc, token) => {
      const balance = accountStore.findBalanceByAssetId(token.assetId);
      const balanceFormatted = balance?.balance ? BN.formatUnits(balance.balance, token.decimals) : BN.ZERO;
      const rate = this.rootStore.poolsStore.usdtRate(token.assetId) ?? BN.ZERO;
      return acc.plus(balanceFormatted.times(rate));
    }, BN.ZERO);
  }

  get targetDepositUsd(): BN {
    return this.userTotalPoolAssetsUsd.times(this.providedPercentOfPool).div(100);
  }

  get requiredTokenAmounts(): Record<string, BN> | null {
    if (this.pool == null) return null;
    const { poolsStore } = this.rootStore;

    const targetUsd = this.targetDepositUsd;
    if (targetUsd.lte(0)) return null;

    return this.pool.tokens.reduce<Record<string, BN>>((acc, token) => {
      const tokenTargetUsd = targetUsd.times(token.share).div(100);

      const rate = poolsStore.usdtRate(token.assetId) ?? BN.ZERO;
      if (rate.lte(0)) return { ...acc, [token.assetId]: BN.ZERO };

      const requiredFormatted = tokenTargetUsd.div(rate);
      const requiredRaw = requiredFormatted.times(new BN(10).pow(token.decimals));

      return { ...acc, [token.assetId]: requiredRaw };
    }, {});
  }

  get tokensWithInsufficientBalance(): Array<{
    token: Balance;
    requiredAmount: BN;
    currentBalance: BN;
    deficit: BN;
    poolToken: { symbol: string; logo: string; share: number; decimals: number; assetId: string };
  }> {
    const { accountStore, poolsStore } = this.rootStore;
    if (this.pool == null || this.requiredTokenAmounts == null) return [];

    return this.pool.tokens
      .map((poolToken) => {
        const balance = accountStore.findBalanceByAssetId(poolToken.assetId);
        const currentBalance = balance?.balance ?? BN.ZERO;
        const requiredAmount = this.requiredTokenAmounts![poolToken.assetId] ?? BN.ZERO;

        const rate = poolsStore.usdtRate(poolToken.assetId, 1) ?? BN.ZERO;
        const balanceUsd = BN.formatUnits(currentBalance, poolToken.decimals).times(rate);
        const effectiveBalance = balanceUsd.lt(1) ? BN.ZERO : currentBalance;
        const deficit = requiredAmount.minus(effectiveBalance);

        return {
          token: balance ?? new Balance(poolToken),
          requiredAmount,
          currentBalance: effectiveBalance,
          deficit,
          poolToken
        };
      })
      .filter(({ deficit }) => deficit.gt(0));
  }

  get hasSwapSourceTokens(): boolean {
    return this.tokensWithSurplus.length > 0 || this.nonPoolSourceTokens.length > 0;
  }

  get hasInsufficientTokens(): boolean {
    if (this.pool == null) return false;
    if (this.providedPercentOfPool.lte(0)) return false;

    const { accountStore, poolsStore } = this.rootStore;

    let hasDeficit = false;

    for (const token of this.pool.tokens) {
      const balance = accountStore.findBalanceByAssetId(token.assetId);
      const userBalance = balance?.balance ?? BN.ZERO;

      if (userBalance.eq(0)) {
        hasDeficit = true;
        break;
      }

      const rate = poolsStore.usdtRate(token.assetId, 1) ?? BN.ZERO;
      const balanceUsd = BN.formatUnits(userBalance, token.decimals).times(rate);
      if (balanceUsd.lt(1)) {
        hasDeficit = true;
        break;
      }

      const requiredForDeposit = this.tokensToDepositAmounts?.[token.assetId] ?? BN.ZERO;
      if (requiredForDeposit.gt(userBalance)) {
        hasDeficit = true;
        break;
      }
    }

    // Only show as "insufficient" if there's a deficit AND we have source tokens to swap from
    return hasDeficit && this.hasSwapSourceTokens;
  }

  get targetDepositUsdFormatted(): string {
    const value = this.targetDepositUsd;
    return !value.isNaN() ? "$ " + value.toFormat(value.gt(0.01) ? 2 : 4) : "$ 0";
  }

  get recommendedSwapsTotalUsd(): BN {
    if (this.recommendedSwaps.length === 0) return BN.ZERO;

    return this.recommendedSwaps.reduce((total, swap) => {
      const rate = this.rootStore.poolsStore.usdtRate(swap.tokenAssetId) ?? BN.ZERO;
      const poolToken = this.pool?.tokens.find(t => t.assetId === swap.tokenAssetId);
      if (!poolToken || rate.eq(0)) return total;

      const amountFormatted = BN.formatUnits(swap.amountToReceive, poolToken.decimals);
      return total.plus(amountFormatted.times(rate));
    }, BN.ZERO);
  }

  get recommendedSwapsTotalUsdFormatted(): string {
    const value = this.recommendedSwapsTotalUsd;
    return !value.isNaN() && value.gt(0) ? "$ " + value.toFormat(value.gt(0.01) ? 2 : 4) : "$ 0";
  }

  getSwapUsdValue(swap: IRecommendedSwap): string {
    const rate = this.rootStore.poolsStore.usdtRate(swap.tokenAssetId) ?? BN.ZERO;
    const poolToken = this.pool?.tokens.find(t => t.assetId === swap.tokenAssetId);
    if (!poolToken || rate.eq(0)) return "$ 0";

    const amountFormatted = BN.formatUnits(swap.amountToReceive, poolToken.decimals);
    const value = amountFormatted.times(rate);
    return !value.isNaN() && value.gt(0) ? "$ " + value.toFormat(value.gt(0.01) ? 2 : 4) : "$ 0";
  }

  calculateRecommendedSwaps = async () => {
    const insufficientTokens = this.tokensWithInsufficientBalance;
    if (insufficientTokens.length === 0) {
      this._setRecommendedSwaps([]);
      return;
    }

    this._setSwapsLoading(true);
    const { poolsStore } = this.rootStore;

    const deficits: Array<{
      poolToken: { symbol: string; logo: string; share: number; decimals: number; assetId: string };
      deficitRaw: BN;
      deficitUsd: BN;
      customSourceAssetId?: string;
    }> = [];

    for (const { deficit, poolToken } of insufficientTokens) {
      const targetRate = poolsStore.usdtRate(poolToken.assetId) ?? BN.ZERO;
      if (targetRate.eq(0)) continue;

      const deficitFormatted = BN.formatUnits(deficit, poolToken.decimals);
      const deficitUsd = deficitFormatted.times(targetRate);

      if (deficitUsd.lt(0.01)) continue;

      const customSource = this.customSourceTokens[poolToken.assetId];

      deficits.push({
        poolToken,
        deficitRaw: deficit,
        deficitUsd,
        customSourceAssetId: customSource?.assetId
      });
    }

    if (deficits.length === 0) {
      this._setRecommendedSwaps([]);
      this._setSwapsLoading(false);
      return;
    }

    deficits.sort((a, b) => b.poolToken.share - a.poolToken.share);

    const availableSources = this.allAvailableSourceTokens.map(s => ({
      token: s.token,
      balanceUsd: s.balanceUsd,
      balanceRaw: s.balanceRaw,
      remainingUsd: s.balanceUsd.times(0.98)
    }));

    if (availableSources.length === 0) {
      this._setRecommendedSwaps([]);
      this._setSwapsLoading(false);
      return;
    }

    const allocations: Array<{
      poolToken: typeof deficits[0]['poolToken'];
      sourceToken: { symbol: string; assetId: string; decimals: number };
      allocatedUsd: BN;
    }> = [];

    for (const { poolToken, deficitUsd, customSourceAssetId } of deficits) {
      let sourceToUse: typeof availableSources[0] | null = null;

      if (customSourceAssetId) {
        const customSource = availableSources.find(s => s.token.assetId === customSourceAssetId);
        if (customSource && customSource.remainingUsd.gt(0.01) && customSource.token.assetId !== poolToken.assetId) {
          sourceToUse = customSource;
        }
      }

      if (!sourceToUse) {
        for (const source of availableSources) {
          if (source.token.assetId === poolToken.assetId) continue;
          if (source.remainingUsd.lte(0.01)) continue;
          sourceToUse = source;
          break;
        }
      }

      if (!sourceToUse) continue;

      const allocatedUsd = BN.min(deficitUsd, sourceToUse.remainingUsd);
      sourceToUse.remainingUsd = sourceToUse.remainingUsd.minus(allocatedUsd);

      allocations.push({
        poolToken,
        sourceToken: sourceToUse.token,
        allocatedUsd
      });
    }

    if (allocations.length === 0) {
      this._setRecommendedSwaps([]);
      this._setSwapsLoading(false);
      return;
    }

    const swapPromises = allocations.map(async ({ poolToken, sourceToken, allocatedUsd }) => {
      try {
        const sourceRate = poolsStore.usdtRate(sourceToken.assetId) ?? BN.ZERO;
        if (sourceRate.eq(0)) return null;

        const estimatedSourceAmount = allocatedUsd.div(sourceRate);

        const sourceAmountRaw = estimatedSourceAmount.times(1.02).times(new BN(10).pow(sourceToken.decimals));
        const sourceAmountWithBuffer = new BN(sourceAmountRaw.toFixed(0));

        if (sourceAmountWithBuffer.lte(0)) return null;

        const aggregatorResponse = await aggregatorService.calc(
          sourceToken.assetId,
          poolToken.assetId,
          sourceAmountWithBuffer
        );

        if (!aggregatorResponse || !aggregatorResponse.estimatedOut || aggregatorResponse.estimatedOut <= 0) {
          return null;
        }

        return {
          tokenSymbol: poolToken.symbol,
          tokenAssetId: poolToken.assetId,
          tokenLogo: poolToken.logo,
          tokenShare: poolToken.share,
          amountToSend: sourceAmountWithBuffer,
          amountToSendFormatted: BN.formatUnits(sourceAmountWithBuffer, sourceToken.decimals).toFormat(2),
          amountToReceive: new BN(aggregatorResponse.estimatedOut),
          amountToReceiveFormatted: BN.formatUnits(new BN(aggregatorResponse.estimatedOut), poolToken.decimals).toFormat(4),
          sourceToken,
          aggregatorResponse,
          loading: false
        } as IRecommendedSwap;
      } catch (e: any) {
        return null;
      }
    });

    const results = await Promise.all(swapPromises);
    this._setRecommendedSwaps(results.filter((r): r is IRecommendedSwap => r !== null));
    this._setSwapsLoading(false);
  };

  executeSingleSwap = async (swap: IRecommendedSwap) => {
    const { accountStore, notificationStore } = this.rootStore;
    if (!swap.aggregatorResponse?.parameters) return;

    const swapIndex = this.recommendedSwaps.findIndex((s) => s.tokenAssetId === swap.tokenAssetId);
    if (swapIndex >= 0) {
      const updatedSwaps = [...this.recommendedSwaps];
      updatedSwaps[swapIndex] = { ...updatedSwaps[swapIndex], loading: true };
      this._setRecommendedSwaps(updatedSwaps);
    }

    try {
      const slippage = JSON.parse(localStorage.getItem("puzzle-user-settings") || '{"slippage": 1}')?.slippage || 1;
      const minimumToReceive = swap.amountToReceive.times(new BN(100 - slippage).div(100));

      const txId = await accountStore.invoke({
        dApp: CONTRACT_ADDRESSES.aggregator,
        payment: [
          {
            assetId: swap.sourceToken.assetId,
            amount: swap.amountToSend.toString()
          }
        ],
        call: {
          function: "swap",
          args: [
            { type: "string", value: swap.aggregatorResponse.parameters },
            { type: "integer", value: minimumToReceive.toFixed(0).toString() }
          ]
        }
      });

      if (txId) {
        notificationStore.notify(`Swapped ${swap.amountToSendFormatted} ${swap.sourceToken.symbol} to ${swap.tokenSymbol}`, {
          type: "success",
          title: "Swap completed!"
        });

        this._setRecommendedSwaps(this.recommendedSwaps.filter((s) => s.tokenAssetId !== swap.tokenAssetId));
        await accountStore.updateAccountAssets(true);
        await this.calculateRecommendedSwaps();
      }
    } catch (e: any) {
      notificationStore.notify(e.message ?? JSON.stringify(e), {
        type: "warning",
        title: "Swap failed"
      });
    } finally {
      const swapIndex = this.recommendedSwaps.findIndex((s) => s.tokenAssetId === swap.tokenAssetId);
      if (swapIndex >= 0) {
        const updatedSwaps = [...this.recommendedSwaps];
        updatedSwaps[swapIndex] = { ...updatedSwaps[swapIndex], loading: false };
        this._setRecommendedSwaps(updatedSwaps);
      }
    }
  };

  executeAllSwaps = async () => {
    if (this.recommendedSwaps.length === 0) return;

    this._setSwapAllLoading(true);
    const { accountStore, notificationStore } = this.rootStore;

    let successCount = 0;
    let failCount = 0;

    for (const swap of this.recommendedSwaps) {
      if (!swap.aggregatorResponse?.parameters) {
        failCount++;
        continue;
      }

      try {
        const slippage = JSON.parse(localStorage.getItem("puzzle-user-settings") || '{"slippage": 1}')?.slippage || 1;
        const minimumToReceive = swap.amountToReceive.times(new BN(100 - slippage).div(100));

        const txId = await accountStore.invoke({
          dApp: CONTRACT_ADDRESSES.aggregator,
          payment: [
            {
              assetId: swap.sourceToken.assetId,
              amount: swap.amountToSend.toString()
            }
          ],
          call: {
            function: "swap",
            args: [
              { type: "string", value: swap.aggregatorResponse.parameters },
              { type: "integer", value: minimumToReceive.toFixed(0).toString() }
            ]
          }
        });

        if (txId) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (e) {
        failCount++;
      }
    }

    await accountStore.updateAccountAssets(true);
    await this.calculateRecommendedSwaps();

    if (successCount > 0) {
      notificationStore.notify(`Successfully completed ${successCount} swap${successCount > 1 ? "s" : ""}`, {
        type: "success",
        title: "Swaps completed!"
      });
    }

    if (failCount > 0) {
      notificationStore.notify(`${failCount} swap${failCount > 1 ? "s" : ""} failed`, {
        type: "warning",
        title: "Some swaps failed"
      });
    }

    this._setSwapAllLoading(false);
  };

  executeSelectedSwaps = async (swaps: IRecommendedSwap[]) => {
    if (swaps.length === 0) return;

    this._setSwapAllLoading(true);
    this._clearSwapResults();
    this._setSwapProgress({ current: 0, total: swaps.length, currentToken: null });

    const { accountStore } = this.rootStore;

    let successCount = 0;
    let failCount = 0;
    let lastError: { message: string; swap: IRecommendedSwap } | null = null;

    for (let i = 0; i < swaps.length; i++) {
      const swap = swaps[i];

      this._setSwapProgress({
        current: i + 1,
        total: swaps.length,
        currentToken: { symbol: swap.tokenSymbol, logo: swap.tokenLogo }
      });

      if (!swap.aggregatorResponse?.parameters) {
        failCount++;
        this._setSwapResult(swap.tokenAssetId, 'failed');
        lastError = { message: "No aggregator parameters", swap };
        continue;
      }

      try {
        const slippage = JSON.parse(localStorage.getItem("puzzle-user-settings") || '{"slippage": 1}')?.slippage || 1;
        const minimumToReceive = swap.amountToReceive.times(new BN(100 - slippage).div(100));

        const txId = await accountStore.invoke({
          dApp: CONTRACT_ADDRESSES.aggregator,
          payment: [
            {
              assetId: swap.sourceToken.assetId,
              amount: swap.amountToSend.toString()
            }
          ],
          call: {
            function: "swap",
            args: [
              { type: "string", value: swap.aggregatorResponse.parameters },
              { type: "integer", value: minimumToReceive.toFixed(0).toString() }
            ]
          }
        });

        if (txId) {
          successCount++;
          this._setSwapResult(swap.tokenAssetId, 'success');
        } else {
          failCount++;
          this._setSwapResult(swap.tokenAssetId, 'failed');
          lastError = { message: "Transaction rejected", swap };
        }
      } catch (e: any) {
        failCount++;
        this._setSwapResult(swap.tokenAssetId, 'failed');
        lastError = { message: e.message ?? JSON.stringify(e), swap };
      }
    }

    await accountStore.updateAccountAssets(true);
    await this.calculateRecommendedSwaps();

    const { notificationStore } = this.rootStore;

    if (successCount > 0) {
      notificationStore.notify(`Successfully completed ${successCount} swap${successCount > 1 ? "s" : ""}`, {
        type: "success",
        title: "Swaps completed!"
      });
    }

    if (failCount > 0 && lastError) {
      this.setNotificationParams(
        buildSwapErrorDialogParams({
          transactionError: lastError.message,
          route: lastError.swap.aggregatorResponse?.parameters,
          onTryAgain: () => {
            this.setNotificationParams(null);
            this.executeSelectedSwaps(swaps);
          }
        })
      );
    }

    this._setSwapAllLoading(false);
    this._setSwapProgress({ current: 0, total: 0, currentToken: null });
  };
}
