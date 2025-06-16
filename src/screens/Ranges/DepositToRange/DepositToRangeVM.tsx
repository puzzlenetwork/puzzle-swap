import React, { useMemo } from "react";
import { useVM } from "@src/hooks/useVM";
import { makeAutoObservable, when } from "mobx";
import { RootStore, useStores } from "@stores";
import { buildErrorDialogParams, buildSuccessDepositToRangeDialogParams, IDialogNotificationProps } from "@src/components/Dialog/DialogNotification";
import { IToken, TOKENS_BY_ASSET_ID } from "@src/constants";
import { Range } from "@src/entities/Range";
import BN from "@src/utils/BN";
import Balance from "@src/entities/Balance";

const ctx = React.createContext<DepositToRangeVM | null>(null);

interface IProps {
  children: React.ReactNode;
  rangeAddress: string;
}

export const DepositToRangeVMProvider: React.FC<IProps> = ({
  rangeAddress,
  children,
}) => {
  const rootStore = useStores();
  const store = useMemo(
    () => new DepositToRangeVM(rootStore, rangeAddress),
    [rootStore, rangeAddress]
  );
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useDepositToRangeVM = () => useVM(ctx);

class DepositToRangeVM {
  rangeAddress: string;
  public get range(): Range {
    return this.rootStore.rangesStore.getRangeByAddress(this.rangeAddress)!;
  }

  rootStore: RootStore;

  loading: boolean = false;
  private _setLoading = (l: boolean) => (this.loading = l);
  
  public notificationParams: IDialogNotificationProps | null = null;
  public setNotificationParams = (params: IDialogNotificationProps | null) =>
    (this.notificationParams = params);

  public selectedTokenToDeposit: IToken | null = null;
  public setSelectedTokenToDeposit = (token: IToken | null) =>
    (this.selectedTokenToDeposit = token);

  public singleTokenAmount: BN = BN.ZERO;
  public setSingleTokenAmount = (amount: BN) => (this.singleTokenAmount = amount);

  constructor(rootStore: RootStore, rangeAddress: string) {
    this.rootStore = rootStore;
    this.rangeAddress = rangeAddress;
    makeAutoObservable(this);

    when(
      () => this.range != null,
      () => {
        this.setNotificationParams(null);
        this.setSelectedTokenToDeposit(TOKENS_BY_ASSET_ID[this.range!.baseTokenId]);
      }
    );
  }

  public get balances(): Balance[] {
    const { accountStore } = this.rootStore;
    return (this.range.assets
      .map((a) => {
        const balance = accountStore.findBalanceByAssetId(a.assetId);
        return balance;
      })
      .filter((balance) => (balance != null)) as Balance[])
      .sort((a: Balance, b: Balance) => {
        if (a?.usdnEquivalent == null && b?.usdnEquivalent == null) return 0;
        if (a?.usdnEquivalent == null && b?.usdnEquivalent != null) return 1;
        if (a?.usdnEquivalent == null && b?.usdnEquivalent == null) return -1;
        return a?.usdnEquivalent!.lt(b?.usdnEquivalent!) ? 1 : -1;
      });
  }

  get selectedTokenBalance() {
    if (this.selectedTokenToDeposit == null) return null;
    return this.rootStore.accountStore.findBalanceByAssetId(
      this.selectedTokenToDeposit.assetId
    );
  }

  get canDepositSingleToken(): boolean {
    const asset = this.selectedTokenBalance;
    if (asset == null || asset.balance == null) return false;
    if (this.singleTokenAmount.isZero()) return false;
    return asset.balance?.gt(0.0001) && !asset.balance.lt(this.singleTokenAmount);
  }

  onMaxSingleTokenClick = () => {
    const userTokenBalance = this.selectedTokenBalance;
    userTokenBalance &&
      userTokenBalance.balance &&
      this.setSingleTokenAmount(userTokenBalance.balance);
  };

  get selectedTokenAmountUsdnEquivalent() {
    if (this.selectedTokenToDeposit == null) return "";
    const rate =
      this.rootStore.poolsStore.usdtRate(this.selectedTokenToDeposit.assetId, 1) ?? BN.ZERO;
    const value = rate.times(this.singleTokenAmount);
    return "~ " + BN.formatUnits(value, this.selectedTokenToDeposit.decimals).toFixed(2);
  }

  depositSingleToken = async () => {
      if (
        this.range == null ||
        !this.canDepositSingleToken
      ) {
        this.setNotificationParams(null);
        return;
      }
      const { accountStore } = this.rootStore;
      this._setLoading(true);
      this.setNotificationParams(null);
      return accountStore
        .invoke({
          dApp: this.range.layer2Address,
          payment: [
            {
              assetId: this.selectedTokenToDeposit!.assetId,
              amount: this.singleTokenAmount.toString(),
            },
          ],
          call: {
            function: "generateIndexWithOneTokenAndStake",
            args: [],
          },
        })
        .then((txId) => {
          txId &&
            this.setNotificationParams(
              buildSuccessDepositToRangeDialogParams({
                accountStore,
                rangeAddress: this.rangeAddress,
                txId: txId ?? "",
              })
            );
        })
        .catch((e) => {
          this.setNotificationParams(
            buildErrorDialogParams({
              title: "Transaction is not completed",
              description: e.message && e.data ? e.message + ` ${e.data}` : JSON.stringify(e),
              onTryAgain: this.depositSingleToken,
            })
          );
        })
        .then(() => accountStore.updateAccountAssets(true))
        .finally(() => this._setLoading(false));
    };
}
