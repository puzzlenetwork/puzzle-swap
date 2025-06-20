import React, { useMemo } from "react";
import { useVM } from "@src/hooks/useVM";
import { makeAutoObservable, when } from "mobx";
import { RootStore, useStores } from "@stores";
import BN from "@src/utils/BN";
import { EXPLORER_URL, IToken, TOKENS_BY_ASSET_ID } from "@src/constants";
import { LPData, RangeAsset } from "@src/entities/Range";
import rangesService from "@src/services/rangesService";

interface IProps {
  children: React.ReactNode;
  rangeAddress: string;
}

const ctx = React.createContext<WithdrawFromRangeVM | null>(null);

export const WithdrawFromRangeVMProvider: React.FC<IProps> = ({
  rangeAddress,
  children,
}) => {
  const rootStore = useStores();
  const store = useMemo(
    () => new WithdrawFromRangeVM(rootStore, rangeAddress),
    [rootStore, rangeAddress]
  );
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useWithdrawFromRangeVM = () => useVM(ctx);

type WithdrawToken = {
  amount: BN;
  usdnEquivalent: BN;
};

class WithdrawFromRangeVM {
  public rangeAddress: string;
  public rootStore: RootStore;

  public userIndexStaked: BN | null = null;
  private setUserIndexStaked = (value: BN) => (this.userIndexStaked = value);

  public loading: boolean = false;
  private _setLoading = (l: boolean) => (this.loading = l);

  public lpData: LPData | null = null;
  setLPData = (v: LPData) => (this.lpData = v);

  percentToWithdraw: BN = new BN(50);
  setPercentToWithdraw = (value: number | number[]) =>
    (this.percentToWithdraw = new BN(value.toString()));

  public get range() {
    return this.rootStore.rangesStore.getRangeByAddress(this.rangeAddress)!;
  }

  constructor(rootStore: RootStore, rangeAddress: string) {
    this.rangeAddress = rangeAddress;
    this.rootStore = rootStore;
    makeAutoObservable(this);

    when(
      () => this.rootStore.accountStore.address != null && this.range != null,
      () => {
        this.updateUserIndexStaked();
        this.syncLPData();
      }
    );
  }

  updateUserIndexStaked = async () => {
    if (this.rootStore.accountStore.address == null) return;
    const response = await this.range.contractKeysRequest(
      `${this.rootStore.accountStore.address}_indexStaked`
    );
    if (response != null && response.length > 0) {
      this.setUserIndexStaked(new BN(response[0].value));
    }
  };

  public syncLPData = async () => {
    if (!this.rootStore.accountStore.address) return;
    rangesService.getLPData(this.rangeAddress, this.rootStore.accountStore.address)
      .then((data) => {
        if (!data) return;
        console.log("LPData", data)
        const newLPData = new LPData(data);
        this.setLPData(newLPData);
      })
  }

  get withdrawCompositionTokens(): (IToken & RangeAsset & { withdraw: BN; inUsdn: BN })[] {
    return this.range.assets.reduce<(RangeAsset & { withdraw: BN; inUsdn: BN })[]>(
      (acc, token) => {
        const withdraw =
          (this &&
            this.tokensToWithdrawAmounts &&
            this.tokensToWithdrawAmounts[token.assetId].amount) ??
          BN.ZERO;
        const inUsdn =
          (this &&
            this.tokensToWithdrawAmounts &&
            this.tokensToWithdrawAmounts[token.assetId].usdnEquivalent) ??
          BN.ZERO;
        return [
          ...acc,
          {
            ...token,
            withdraw,
            inUsdn,
          },
        ];
      },
      []
    ).map((token) => ({
      ...TOKENS_BY_ASSET_ID[token.assetId],
      ...token,
    }));
  }

  get tokensToWithdrawAmounts(): Record<string, WithdrawToken> | null {
    if (this.userIndexStaked == null || this.lpData == null) return null;
    return this.range.assets.reduce<Record<string, WithdrawToken>>(
      (acc, { assetId }) => {
        const userAssetData = this.lpData?.assetsData.find((asset) => asset.assetId === assetId)
        if (!userAssetData) return {
          ...acc,
          [assetId]: {
            amount: BN.ZERO,
            usdnEquivalent: BN.ZERO,
          },
        }

        const topToWithdraw = userAssetData.providedAmount;
        const toWithdraw = topToWithdraw.times(this.percentToWithdraw).div(100);

        const topUsdToWithdraw = userAssetData.providedAmountUsd;
        const usdToWithdraw = topUsdToWithdraw.times(this.percentToWithdraw).div(100);

        return {
          ...acc,
          [assetId]: {
            amount: toWithdraw,
            usdnEquivalent: usdToWithdraw,
          },
        };
      },
      {}
    );
  }

  get totalAmountToWithdraw(): BN {
    const tokensToWithdrawAmounts = this.tokensToWithdrawAmounts;
    if (tokensToWithdrawAmounts == null) return BN.ZERO;
    return Object.values(tokensToWithdrawAmounts).reduce<BN>(
      (acc, { usdnEquivalent }) => acc.plus(usdnEquivalent),
      BN.ZERO
    );
  }

  get totalAmountToWithdrawDisplay(): string {
    const total = this.totalAmountToWithdraw;
    return "$ " + total.toFormat(2);
  }

  withdraw = () => {
    const { notificationStore } = this.rootStore;
    if (this.percentToWithdraw.eq(0)) return;
    if (this.userIndexStaked == null) return;

    this._setLoading(true);
    const value = this.userIndexStaked
      .times(0.01)
      .times(this.percentToWithdraw)
      .toSignificant(0)
      .toString();

    const args = [{ type: "integer", value }];

    this.rootStore.accountStore
      .invoke({
        dApp: this.range.address,
        payment: [],
        call: {
          function: "redeemIndex",
          args: args as Array<{ type: "integer" | "string"; value: string }>,
        },
      })
      .then((txId) => {
        txId &&
          notificationStore.notify(
            `Liquidity is successfully withdrawn from the range ${this.range.title}.`,
            {
              type: "success",
              title: "Successfully withdrawn",
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
      .then(() => {
        this.updateUserIndexStaked();
        this.syncLPData();
      })
      .finally(() => this._setLoading(false));
  };
}
