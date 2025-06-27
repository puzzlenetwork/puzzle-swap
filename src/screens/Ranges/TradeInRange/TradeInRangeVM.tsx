import React, { useMemo } from "react";
import { useVM } from "@src/hooks/useVM";
import { makeAutoObservable, when } from "mobx";
import { EXPLORER_URL, TOKENS_BY_ASSET_ID } from "@src/constants";
import { RootStore, useStores } from "@stores";
import Balance from "@src/entities/Balance";
import BN from "@src/utils/BN";

const ctx = React.createContext<TradeInRangeVM | null>(null);

interface IProps {
  children: React.ReactNode;
  rangeAddress: string;
}

export const TradeInRangeVMProvider: React.FC<IProps> = ({
  rangeAddress,
  children,
}) => {
  const rootStore = useStores();
  const store = useMemo(
    () => new TradeInRangeVM(rootStore, rangeAddress),
    [rootStore, rangeAddress]
  );
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useTradeInRangeVM = () => useVM(ctx);

class TradeInRangeVM {
  constructor(
    private rootStore: RootStore,
    public readonly rangeAddress: string
  ) {
    makeAutoObservable(this);
    when(
      () => this.defaultAssetId0 != null && this.defaultAssetId1 != null,
      () => {
        this.setAssetId0(this.defaultAssetId0);
        this.setAssetId1(this.defaultAssetId1);
      }
    );
  }

  public get range() {
    return this.rootStore.rangesStore.getRangeByAddress(this.rangeAddress)!;
  }

  public get defaultAssetId0() {
    return this.range.baseTokenId;
  }

  public get defaultAssetId1() {
    return this.range.assets[1].assetId;
  }

  assetId0: string = "";
  setAssetId0 = (assetId: string) => (this.assetId0 = assetId);

  get token0() {
    return this.range?.assets.find(({ assetId }) => assetId === this.assetId0);
  }

  get balance0() {
    return this.balances?.find((b) => b.assetId === this.assetId0)?.balance;
  }

  get amount0MaxClickFunc(): (() => void) | undefined {
    const { token0, balance0 } = this;
    return token0 != null && balance0 != null
      ? () => this.setAmount0(balance0)
      : undefined;
  }

  amount0: BN = BN.ZERO;
  setAmount0 = (amount: BN) => (this.amount0 = amount);

  loading: boolean = false;
  private _setLoading = (l: boolean) => (this.loading = l);

  get amount0UsdnEquivalent(): string {
    const { token0 } = this;
    const usdtRate = this.rootStore.poolsStore.usdtRate(this.assetId0, 1);
    if (token0 == null || usdtRate == null) return "—";
    const result = usdtRate.times(
      BN.formatUnits(this.amount0, TOKENS_BY_ASSET_ID[token0.assetId].decimals)
    );
    if (!result.gt(0)) return "—";
    return `~ ${usdtRate
      .times(BN.formatUnits(this.amount0, TOKENS_BY_ASSET_ID[token0.assetId].decimals))
      .toFormat(2)} $`;
  }

  get liquidityOfToken0() {
    return this.range.assets.find(({ assetId }) => assetId === this.assetId0)?.balance ?? BN.ZERO;
  }

  assetId1: string = "";
  setAssetId1 = (assetId: string) => (this.assetId1 = assetId);

  get token1() {
    return this.range.assets.find(({ assetId }) => assetId === this.assetId1);
  }

  get liquidityOfToken1() {
    return this.range.assets.find(({ assetId }) => assetId === this.assetId1)?.balance ?? BN.ZERO;
  }

  get rate() {
    return (
      this.liquidityOfToken1.div(this.token1?.share ?? 1)
      .div(this.liquidityOfToken0.div(this.token0?.share ?? 1))
    );
  }

  get priceImpact() {
    //100 * (Price(0,1) / (Amount0/Amount1))
    const rate = this.rate;
    if (this.token1 == null || this.token0 == null || rate.eq(BN.ZERO)) {
      return null;
    }
    const amount0 = BN.formatUnits(this.amount0, TOKENS_BY_ASSET_ID[this.token0!.assetId].decimals);
    const amount1 = BN.formatUnits(this.amount1, TOKENS_BY_ASSET_ID[this.token1!.assetId].decimals);
    //(amount0/(amount1*rate))*100
    let priceImpact = amount0.times(rate).div(amount1).minus(1).times(100);
    // let priceImpact = new BN(100).times(rate.div(amount0.div(amount1)));
    if (priceImpact.gt(100)) priceImpact = new BN(100);
    return priceImpact.isNaN() ? BN.ZERO : priceImpact;
  }

  switchTokens = () => {
    const assetId0 = this.assetId0;
    this.setAssetId0(this.assetId1);
    this.setAssetId1(assetId0);
  };

  get balances() {
    const { accountStore } = this.rootStore;
    return this.range?.assets
      .map((t) => {
        const balance = accountStore.findBalanceByAssetId(t.assetId);
        return balance ?? new Balance(TOKENS_BY_ASSET_ID[t.assetId]);
      })
      .sort((a, b) => {
        if (a.usdnEquivalent == null && b.usdnEquivalent == null) return 0;
        if (a.usdnEquivalent == null && b.usdnEquivalent != null) return 1;
        if (a.usdnEquivalent == null && b.usdnEquivalent == null) return -1;
        return a.usdnEquivalent!.lt(b.usdnEquivalent!) ? 1 : -1;
      });
  }

  get amount1() {
    const { liquidityOfToken0: l0, liquidityOfToken1: l1 } = this;
    const { token1, token0, amount0 } = this;
    if (l0 == null || l1 == null || token1 == null || token0 == null) {
      return BN.ZERO;
    }
    const share0 = new BN(token0.share);
    const share1 = new BN(token1.share);

    try {
      const power = share0.div(share1).toSignificant(8).toNumber();
      const base = l0.div(l0.plus(BN.formatUnits(amount0, TOKENS_BY_ASSET_ID[token0.assetId].decimals))).toNumber();
      const rightPart = new BN(1).minus(Math.pow(base, power));

      return BN.parseUnits(
        l1
          .times(rightPart)
          .times(new BN(100).minus(this.range.swapFee).div(100)),
        TOKENS_BY_ASSET_ID[token1.assetId].decimals
      );
    } catch (e) {
      return BN.ZERO;
    }
  }

  get amount1UsdnEquivalent(): string {
    const { token1 } = this;
    const usdtRate = this.rootStore.poolsStore.usdtRate(this.assetId1, 1);
    if (token1 == null || usdtRate == null) return "—";
    const result = usdtRate.times(
      BN.formatUnits(this.amount1, TOKENS_BY_ASSET_ID[token1.assetId].decimals)
    );
    if (!result.gt(0)) return "—";
    return `~ ${usdtRate
      .times(BN.formatUnits(this.amount1, TOKENS_BY_ASSET_ID[token1.assetId].decimals))
      .toFormat(2)} $`;
  }

  get minimumToReceive(): BN {
    const slippage =
      JSON.parse(
        localStorage.getItem("puzzle-user-settings") || '{"slippage": 1}'
      )?.slippage || 1;
    return this.amount1.times(new BN(100 - slippage).div(100));
  }

  swap = async () => {
    const { notificationStore } = this.rootStore;
    if (this.range?.address == null) return;
    if (this.token0 == null || this.amount0.eq(0)) return;
    if (!this.token1 || !this.amount1.gt(0) || !this.minimumToReceive) return;
    this._setLoading(true);
    this.rootStore.accountStore
      .invoke({
        dApp: this.rangeAddress,
        payment: [
          {
            assetId:
              this.token0.assetId === "WAVES" ? null : this.token0.assetId,
            amount: this.amount0.toString(),
          },
        ],
        call: {
          function: "swap",
          args: [
            { type: "string", value: this.token1.assetId },
            {
              type: "integer",
              value: this.minimumToReceive.toFixed(0).toString(),
            },
          ],
        },
      })
      .then((txId) => {
        notificationStore.notify(
          "You can view the details of it in Waves Explorer",
          {
            type: "success",
            title: "Transaction is completed",
            link: `${EXPLORER_URL}/transactions/${txId}`,
            linkTitle: "View on Explorer",
          }
        );
      })
      .catch((e) => {
        notificationStore.notify(e.message ?? JSON.stringify(e), {
          type: "error",
          title: "Transaction is not completed",
        });
      })
      .finally(() => this._setLoading(false));
  };
}
