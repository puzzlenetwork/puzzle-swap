import React, { useMemo } from "react";
import { useVM } from "@src/hooks/useVM";
import { makeAutoObservable, when } from "mobx";
import { RootStore, useStores } from "@stores";
import BN from "@src/utils/BN";
import { EXPLORER_URL, IToken, TOKENS_BY_ASSET_ID } from "@src/constants";
import { LPData, RangeAsset } from "@src/entities/Range";
import rangesService from "@src/services/rangesService";
import { Range } from "@src/entities/Range";

interface IProps {
  children: React.ReactNode;
  rangeAddress: string;
}

const ctx = React.createContext<WithdrawFromRangeVM | null>(null);

export const WithdrawFromRangeVMProvider: React.FC<IProps> = ({ rangeAddress, children }) => {
  const rootStore = useStores();
  const store = useMemo(() => new WithdrawFromRangeVM(rootStore, rangeAddress), [rootStore, rangeAddress]);
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
  setPercentToWithdraw = (value: number | number[]) => {
    this.percentToWithdraw = new BN(value.toString());
    this.syncTokensToWithdrawAmounts();
  };

  public get range() {
    return this.rootStore.rangesStore.getRangeByAddress(this.rangeAddress)!;
  }

  constructor(rootStore: RootStore, rangeAddress: string) {
    this.rangeAddress = rangeAddress;
    this.rootStore = rootStore;
    makeAutoObservable(this);

    this.loadRange(rangeAddress);

    when(
      () => this.rootStore.accountStore.address != null && this.range != null,
      () => {
        this.updateUserIndexStaked();
        this.syncLPData();
        this.syncTokensToWithdrawAmounts();
      }
    );
  }

  private setRangeAddress = (address: string) => {
    this.rangeAddress = address;
  };

  private loadRange = async (rangeAddressOrDomain: string) => {
    const existingRange = this.rootStore.rangesStore.getRangeByAddress(rangeAddressOrDomain) || 
                         this.rootStore.rangesStore.getRangeByDomain(rangeAddressOrDomain);
    
    if (existingRange) {
      this.setRangeAddress(existingRange.address);
      return;
    }

    try {
      const rangeData = await rangesService.getRangeByAddress(rangeAddressOrDomain, { charts: true });
      const range = new Range(rangeData);
      this.rootStore.rangesStore.updateRange(range);
      this.setRangeAddress(range.address);
      const _ = this.range;
    } catch (error) {
      
      try {
        const response = await rangesService.getRanges({
          page: 1,
          size: 200,
          minLiquidity: 0
        });
        
        response.ranges.forEach((rangeData) => {
          const r = new Range(rangeData);
          this.rootStore.rangesStore.updateInAllRanges(r);
        });
        
        const foundRange = this.rootStore.rangesStore.getRangeByDomain(rangeAddressOrDomain);
        if (foundRange) {
          this.setRangeAddress(foundRange.address);
          const rangeData = await rangesService.getRangeByAddress(foundRange.address, { charts: true });
          const range = new Range(rangeData);
          this.rootStore.rangesStore.updateRange(range);
        }
      } catch (error) {
      }
    }
  };

  updateUserIndexStaked = async () => {
    const effectiveAddress = this.rootStore.accountStore.effectiveAddress;
    if (effectiveAddress == null) return;
    const response = await this.range.contractKeysRequest(`${effectiveAddress}_indexStaked`);
    if (response != null && response.length > 0) {
      this.setUserIndexStaked(new BN(response[0].value));
      this.syncTokensToWithdrawAmounts();
    }
  };

  public syncLPData = async () => {
    const effectiveAddress = this.rootStore.accountStore.effectiveAddress;
    if (!effectiveAddress) return;
    rangesService.getLPData(this.rangeAddress, effectiveAddress).then((data) => {
      if (!data) return;
      const newLPData = new LPData(data);
      this.setLPData(newLPData);
      this.syncTokensToWithdrawAmounts();
    });
  };

  get withdrawCompositionTokens(): (IToken & RangeAsset & { withdraw: BN; inUsdn: BN })[] {
    return this.range.assets
      .reduce<(RangeAsset & { withdraw: BN; inUsdn: BN })[]>((acc, token) => {
        const withdraw =
          (this && this.tokensToWithdrawAmounts && this.tokensToWithdrawAmounts[token.assetId].amount) ?? BN.ZERO;
        const inUsdn =
          (this && this.tokensToWithdrawAmounts && this.tokensToWithdrawAmounts[token.assetId].usdnEquivalent) ??
          BN.ZERO;
        return [
          ...acc,
          {
            ...token,
            withdraw,
            inUsdn
          }
        ];
      }, [])
      .map((token) => ({
        ...TOKENS_BY_ASSET_ID[token.assetId],
        ...token
      }));
  }

  public tokensToWithdrawAmounts: Record<string, WithdrawToken> | null = null;
  private _setTokensToWithdrawAmounts = (value: Record<string, WithdrawToken> | null) =>
    (this.tokensToWithdrawAmounts = value);

  public syncTokensToWithdrawAmounts = () => {
    if (this.userIndexStaked == null || this.lpData == null) return null;
    return this._setTokensToWithdrawAmounts(
      this.range.assets.reduce<Record<string, WithdrawToken>>((acc, { assetId }) => {
        const userAssetData = this.lpData?.assetsData.find((asset) => asset.assetId === assetId);
        if (!userAssetData)
          return {
            ...acc,
            [assetId]: {
              amount: BN.ZERO,
              usdnEquivalent: BN.ZERO
            }
          };

        const topToWithdraw = userAssetData.providedAmount;
        const toWithdraw = topToWithdraw.times(this.percentToWithdraw).div(100);

        const topUsdToWithdraw = userAssetData.providedAmountUsd;
        const usdToWithdraw = topUsdToWithdraw.times(this.percentToWithdraw).div(100);

        return {
          ...acc,
          [assetId]: {
            amount: toWithdraw,
            usdnEquivalent: usdToWithdraw
          }
        };
      }, {})
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
    const value = this.userIndexStaked.times(0.01).times(this.percentToWithdraw).toSignificant(0).toString();

    const args = [{ type: "integer", value }];

    this.rootStore.accountStore
      .invoke({
        dApp: this.range.address,
        payment: [],
        call: {
          function: "redeemIndex",
          args: args as Array<{ type: "integer" | "string"; value: string }>
        }
      })
      .then((txId) => {
        txId &&
          notificationStore.notify(`Liquidity is successfully withdrawn from the range ${this.range.domain}.`, {
            type: "success",
            title: "Successfully withdrawn",
            link: `${EXPLORER_URL}/transactions/${txId}`,
            linkTitle: "View on Explorer"
          });
      })
      .catch((e) => {
        notificationStore.notify(e.message ?? JSON.stringify(e), {
          type: "warning",
          title: "Transaction is not completed"
        });
      })
      .then(() => {
        this.rootStore.accountStore.updateAccountAssets(true);
        this.updateUserIndexStaked();
        this.syncLPData().then(
          () => this.syncTokensToWithdrawAmounts(),
        )
      })
      .finally(() => this._setLoading(false));
  };
}
