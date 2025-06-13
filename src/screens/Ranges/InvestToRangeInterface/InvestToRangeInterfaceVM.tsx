import React, { useMemo } from "react";
import { useVM } from "@src/hooks/useVM";
import { RootStore, useStores } from "@stores";
import { makeAutoObservable, when } from "mobx";
import rangesService from "@src/services/rangesService";
import { IRangeParamsResponse, Range } from "@src/entities/Range";
import BN from "@src/utils/BN";
import { IHistory } from "@src/utils/types";
import { EXPLORER_URL, NODE_URL, TOKENS_BY_ASSET_ID } from "@src/constants";
import { assetBalance } from "@waves/waves-transactions/dist/nodeInteraction";
import dayjs, { ManipulateType } from "dayjs";

const ctx = React.createContext<InvestToRangeInterfaceVM | null>(null);

interface IProps {
  children: React.ReactNode;
  rangeAddress: string;
}

export const InvestToRangeInterfaceVMProvider: React.FC<IProps> = ({
  rangeAddress,
  children,
}) => {
  const rootStore = useStores();
  const store = useMemo(
    () => new InvestToRangeInterfaceVM(rootStore, rangeAddress),
    [rootStore, rangeAddress]
  );
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useInvestToRangeInterfaceVM = () => useVM(ctx);

class InvestToRangeInterfaceVM {
  private rootStore: RootStore;

  private rangeAddress: string;
  public get range() {
    return this.rootStore.rangesStore.getRangeByAddress(this.rangeAddress);
  }

  loading: boolean = false;
  private _setLoading = (l: boolean) => (this.loading = l);
  
  history: IHistory[] = [];
  setHistory = (v: IHistory[]) => (this.history = v);

  public indexTokenBalance: BN = BN.ZERO;
  private setIndexBalance = (value: BN) => (this.indexTokenBalance = value);

  public lastClaimDate: BN = BN.ZERO;
  private _setLastClaimDate = (v: BN) => (this.lastClaimDate = v);

  public globalIndexStaked: BN = BN.ZERO;
  private _setGlobalIndexStaked = (v: BN) => (this.globalIndexStaked = v);

  public userIndexStaked: BN | null = null;
  private setUserIndexStaked = (value: BN) => (this.userIndexStaked = value);

  public get totalClaimedReward(): BN {
    const userInfo = this.range!.stakedProviders.providersStaked.find((p) => p.address === this.rootStore.accountStore.address);
    return userInfo ? userInfo.claimedUsd : BN.ZERO;
  }

  public get totalRewardToClaim(): BN {
    const userInfo = this.range!.stakedProviders.providersStaked.find((p) => p.address === this.rootStore.accountStore.address);
    return userInfo ? userInfo.unclaimedUsd : BN.ZERO;
  };

  public rewardsDisplayMode: ("all" | "fees" | "extra") = "all";
  public setRewardsDisplayMode = (value: "all" | "fees" | "extra") => (this.rewardsDisplayMode = value);

  public timeRangeToDisplayRewards: ("1d" | "7d" | "1m" | "3m" | "1y" | "all") = "all";
  private _setTimeRangeToDisplayRewards = (value: ("1d" | "7d" | "1m" | "3m" | "1y" | "all")) => (this.timeRangeToDisplayRewards = value);
  public setTimeRangeToDisplayRewards = (value: ("1d" | "7d" | "1m" | "3m" | "1y" | "all")) => {
    this._setTimeRangeToDisplayRewards(value);
    this.syncLPRewards(value);
  };

  public LPRewardsByTime: Record<("1d" | "7d" | "1m" | "3m" | "1y" | "all"), { assetId: string, feesEarned: BN, extraEarned: BN }[]> = {} as Record<("1d" | "7d" | "1m" | "3m" | "1y" | "all"), { assetId: string, feesEarned: BN, extraEarned: BN }[]>;
  public updateLPRewardsByTime = (key: ("1d" | "7d" | "1m" | "3m" | "1y" | "all"), value: { assetId: string, feesEarned: BN, extraEarned: BN }[]) => (this.LPRewardsByTime[key] = value);

  public get LPRewardsToDisplay(): {assetId: string, amount: BN}[] {
    switch (this.rewardsDisplayMode) {
      case "all":
        return this.LPRewardsByTime[this.timeRangeToDisplayRewards]?.map(({ assetId, feesEarned, extraEarned }) => ({ assetId, amount: feesEarned.plus(extraEarned) })).filter(({ amount }) => amount.gt(0)) ?? [];
      case "fees":
        return this.LPRewardsByTime[this.timeRangeToDisplayRewards]?.map(({ assetId, feesEarned }) => ({ assetId, amount: feesEarned })).filter(({ amount }) => amount.gt(0)) ?? [];
      case "extra":
        return this.LPRewardsByTime[this.timeRangeToDisplayRewards]?.map(({ assetId, extraEarned }) => ({ assetId, amount: extraEarned })).filter(({ amount }) => amount.gt(0)) ?? [];
      default:
        return [];
    }
  }

  public chartDataKey: ("volume" | "fees" | "liquidity") = "volume";
  public setChartDataKey = (value: "volume" | "fees" | "liquidity") => (this.chartDataKey = value);

  public get chartData() {
    return this.range?.charts?.map(({ owner_fees, protocol_fees, time, ...rest }) => ({
      fees: owner_fees + protocol_fees,
      time: time * 1000,
      ...rest
    })).sort((a, b) => (a.time < b.time ? -1 : 1)) || [];
  }

  public get chartTotal(): BN {
    switch (this.chartDataKey) {
      case "volume":
        return new BN(this.range!.totals["volume_all"] ?? 0);
      case "fees":
        return new BN((this.range!.totals["pool_fees_all"] ?? 0) + (this.range!.totals["owner_fees_all"] ?? 0) + (this.range!.totals["protocol_fees_all"] ?? 0));
      case "liquidity":
        return new BN(this.range!.liquidity ?? 0);
    }
    return new BN(this.range!.totals[this.chartDataKey] ?? 0)
  }

  public useMaxStakeUnstakeAmount: boolean = false;
  public setUseMaxStakeUnstakeAmount = (value: boolean) => (this.useMaxStakeUnstakeAmount = value);

  public stakeUnstakeAmount: BN = BN.ZERO;
  public setStakeUnstakeAmount = (value: BN) => (this.stakeUnstakeAmount = value);

  constructor(rootStore: RootStore, rangeAddress: string) {
    this.rootStore = rootStore;
    this.rangeAddress = rangeAddress;
    makeAutoObservable(this);
    
    rangesService.getRangeByAddress(rangeAddress, { charts: true })
      .then((rangeData) => {
        if (!rangeData) return;
        const newRange = new Range(rangeData);
        this.rootStore.rangesStore.updateRange(newRange);
        this.setHistory(rangeData.charts || []);
      });
    
    when(
      () => this.range != null,
      () => {
        this.getAddressActivityInfo();
        this.updateLPRewardsByTime("all", this.range!.assets.map(({ assetId, feesEarned, extraEarned }) => ({ assetId, feesEarned: feesEarned, extraEarned: extraEarned })));
      })
  }

  prepareCompleteRangeInitialization = () => {
    const assets = this.range!.assets.map((t) => ({
      assetId: t.assetId,
      share: t.share,
    }));
    const state = {
      assets,
      logo: this.range!.logo,
      title: this.range!.title,
      domain: this.range!.domain,
      step: 3,
      fileName: "–",
      fileSize: "–",
      maxStep: 3,
      swapFee: this.range!.swapFee,
    };
    localStorage.setItem("puzzle-custom-range", JSON.stringify(state));
  };

  syncIndexTokenInfo = async () => {
    const { address } = this.rootStore.accountStore;
    if (address == null) return;
    const balance = await assetBalance(this.range!.lpTokenId, address, NODE_URL);
    this.setIndexBalance(new BN(balance ?? 0));
  };

  getAddressActivityInfo = async () => {
    const { address } = this.rootStore.accountStore;
    if (address == null) return;
    const keysArray = {
      globalIndexStaked: "global_indexStaked",
      userIndexStaked: `${address}_indexStaked`,
      lastClaimDate: `${address}_DG2xFkPdDwKUoBkzGAhQtLpSGzfXLiCYPEzeKH2Ad24p_lastClaim`,
    };
    const response = await this.range!.contractKeysRequest(
      Object.values(keysArray)
    );

    const parsedNodeResponse = [...(response ?? [])].reduce<Record<string, BN>>(
      (acc, { key, value }) => {
        Object.entries(keysArray).forEach(([regName, regValue]) => {
          const regexp = new RegExp(regValue);
          if (regexp.test(key)) {
            acc[regName] = new BN(value);
          }
        });
        return acc;
      },
      {}
    );

    const lastClaimDate = parsedNodeResponse["lastClaimDate"];
    const userIndexStaked = parsedNodeResponse["userIndexStaked"];
    const globalIndexStaked = parsedNodeResponse["globalIndexStaked"];
    lastClaimDate && this._setLastClaimDate(lastClaimDate);
    this.setUserIndexStaked(userIndexStaked);
    this._setGlobalIndexStaked(globalIndexStaked);
  };

  public syncLPRewards = async (period: ("1d" | "7d" | "1m" | "3m" | "1y" | "all")) => {
    if (period === "all") {
      rangesService.getRangeByAddress(this.rangeAddress).then((rangeData: IRangeParamsResponse) => {
        if (!rangeData) return;
        this.updateLPRewardsByTime(period, Object.entries(rangeData.period_fees).map(([assetId, fees]) => ({ assetId, extraEarned: new BN(fees.extra_earned), feesEarned: new BN(fees.fees_earned) })));
      })
      return;
    };
    const periods = {
      "1d": [1, "days"],
      "7d": [7, "days"],
      "1m": [1, "months"],
      "3m": [3, "months"],
      "1y": [1, "years"],
    };
    const startTime = dayjs().subtract(Number(periods[period][0]), periods[period][1] as ManipulateType).unix();
    rangesService.getRangeByAddress(this.rangeAddress, { startTime, endTime: dayjs().unix() }).then((rangeData: IRangeParamsResponse) => {
      if (!rangeData) return;
      this.updateLPRewardsByTime(period, Object.entries(rangeData.period_fees).map(([assetId, fees]) => ({ assetId, extraEarned: new BN(fees.extra_earned), feesEarned: new BN(fees.fees_earned) })));
    })
  }

  get totalProvidedLiquidityByAddress(): BN {
    const userInfo = this.range?.stakedProviders.providersStaked.find((p) => p.address === this.rootStore.accountStore.address);
    return userInfo?.indexStaked ? userInfo.indexStaked.times(this.range!.indexTokenRate) : BN.ZERO;
  }

  get shareOfPool(): BN {
    const userInfo = this.range!.stakedProviders.providersStaked.find((p) => p.address === this.rootStore.accountStore.address);
    return userInfo ? userInfo.share : BN.ZERO;
  }

  get poolBalancesTable() {
    if (this.range?.assets == null) return null;

    return this.range.assets
      .map((a) => ({ ...a, ...TOKENS_BY_ASSET_ID[a.assetId] }))
      .map((token) => {
      if (
        this.userIndexStaked == null ||
        this.userIndexStaked?.eq(0)
      ) {
        return { ...token, usdnEquivalent: BN.ZERO, value: BN.ZERO };
      }
      const userAmount = this.shareOfPool.times(token.factBalance);
      const userUsdnEquivalent = this.shareOfPool.times(token.factBalanceUsd);
      return {
        ...token,
        usdnEquivalent: userUsdnEquivalent,
        value: userAmount,
      }
    });
  }

  claimRewards = async () => {
    if (this.totalRewardToClaim == null || this.totalRewardToClaim.eq(0))
      return;
    if (this.range!.layer2Address == null) return;
    this._setLoading(true);
    const { accountStore, notificationStore } = this.rootStore;
    accountStore
      .invoke({
        dApp: this.range!.address,
        payment: [],
        call: {
          function: "claimIndexRewards",
          args: [],
        },
      })
      .then((txId) => {
        notificationStore.notify(`Your rewards was claimed`, {
          type: "success",
          title: `Success`,
          link: `${EXPLORER_URL}/transactions/${txId}`,
          linkTitle: "View on Explorer",
        });
      })
      .catch((e) => {
        notificationStore.notify(e.message ?? JSON.stringify(e), {
          type: "error",
          title: "Transaction is not completed",
        });
      })
      .finally(() => this._setLoading(false));
  };

  get canClaimRewards() {
    return !(
      this.totalRewardToClaim == null ||
      this.totalRewardToClaim.eq(0) ||
      this.loading
    );
  }
  
  unstakeIndex = async () => {
    if (this.userIndexStaked == null || this.userIndexStaked?.eq(0)) return;
    if (this.range!.layer2Address == null) return;
    this._setLoading(true);
    const { accountStore, notificationStore } = this.rootStore;
    const unstakeAmount = this.useMaxStakeUnstakeAmount ? this.userIndexStaked?.toString() : this.stakeUnstakeAmount.toString();
    accountStore
      .invoke({
        dApp: this.range!.address,
        payment: [],
        call: {
          function: "unstakeIndex",
          args: [
            {
              type: "integer",
              value: unstakeAmount,
            },
          ],
        },
      })
      .then((txId) => {
        notificationStore.notify(`You have unstaked index token`, {
          type: "success",
          title: `Success`,
          link: `${EXPLORER_URL}/transactions/${txId}`,
          linkTitle: "View on Explorer",
        });
        this.getAddressActivityInfo();
        this.syncIndexTokenInfo();
      })
      .catch((e) => {
        notificationStore.notify(e.message ?? JSON.stringify(e), {
          type: "error",
          title: "Transaction is not completed",
        });
      })
      .finally(() => this._setLoading(false));
  };

  get canStakeIndex() {
    return (!this.indexTokenBalance.eq(0) && (this.useMaxStakeUnstakeAmount && !(this.stakeUnstakeAmount.eq(0) || this.stakeUnstakeAmount.gt(this.indexTokenBalance))));
  }

  stakeIndex = async () => {
    if (!this.canStakeIndex) return;
    this._setLoading(true);
    const { accountStore, notificationStore } = this.rootStore;
    accountStore
      .invoke({
        dApp: this.range!.address,
        payment: [
          {
            assetId: this.range!.lpTokenId === "WAVES" ? null : this.range!.lpTokenId,
            amount: this.useMaxStakeUnstakeAmount ? this.indexTokenBalance.toString() : this.stakeUnstakeAmount.toString(),
          },
        ],
        call: {
          function: "stakeIndex",
          args: [],
        },
      })
      .then(this.syncIndexTokenInfo)
      .then((txId) => {
        notificationStore.notify(`Your have staked index token`, {
          type: "success",
          title: `Success`,
          link: `${EXPLORER_URL}/transactions/${txId}`,
          linkTitle: "View on Explorer",
        });
        this.getAddressActivityInfo();
        this.syncIndexTokenInfo();
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
