import React, { useMemo } from "react";
import { useVM } from "@src/hooks/useVM";
import { RootStore, useStores } from "@stores";
import { makeAutoObservable, when } from "mobx";
import rangesService from "@src/services/rangesService";
import { IRangeParamsResponse, LPData, Range } from "@src/entities/Range";
import BN from "@src/utils/BN";
import { IHistory } from "@src/utils/types";
import { EXPLORER_URL, NODE_URL, TOKENS_BY_ASSET_ID } from "@src/constants";
import { assetBalance } from "@waves/waves-transactions/dist/nodeInteraction";
import dayjs, { ManipulateType } from "dayjs";
import nodeService from "@src/services/nodeService";

const ctx = React.createContext<RangeDetailsInterfaceVM | null>(null);

interface IProps {
  children: React.ReactNode;
  rangeDomain: string;
}

export const RangeDetailsInterfaceVMProvider: React.FC<IProps> = ({ rangeDomain, children }) => {
  const rootStore = useStores();
  const store = useMemo(() => new RangeDetailsInterfaceVM(rootStore, rangeDomain), [rootStore, rangeDomain]);
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useRangeDetailsInterfaceVM = () => useVM(ctx);

class RangeDetailsInterfaceVM {
  private rootStore: RootStore;

  private rangeDomain: string;
  public get range() {
    const byDomain = this.rootStore.rangesStore.getRangeByDomain(this.rangeDomain);
    if (byDomain) return byDomain;
    return this.rootStore.rangesStore.getRangeByAddress(this.rangeDomain);
  }
  
  public get rangeAddress(): string {
    return this.range?.address || '';
  }
  
  public initialize = async () => {
    await this.loadRangeData();
  };

  private loadRangeData = async () => {
    let range = this.range;
    if (!range) {
      try {
        const rangeData = await rangesService.getRangeByAddress(this.rangeDomain, { charts: true, timeRange: "30d" });
        if (rangeData) {
          const newRange = new Range(rangeData);
          this.rootStore.rangesStore.updateRange(newRange);
          this.setHistory(rangeData.charts || []);
          this.updateBlockHeight();
          this.setCurrentPeriodApr(new BN(rangeData.period_stats.apr));
          return;
        }
      } catch (error) {
        console.error("Error loading range by address:", error);
      }

      try {
        const response = await rangesService.getRanges({
          page: 1,
          size: 200,
          minLiquidity: 0,
          timeRange: "30d"
        });

        response.ranges.forEach((rangeData) => {
          const r = new Range(rangeData);
          this.rootStore.rangesStore.updateInAllRanges(r);
        });

        range = this.range;
        const initialRange = response.ranges.find(r => r.address === this.rangeDomain);
        if (initialRange) {
          this.setCurrentPeriodApr(new BN(initialRange.period_stats.apr));
        }
      } catch (error) {
        console.error("Error loading range by domain:", error);
      }
    }

    if (range) {
      Promise.all([
        rangesService.getRanges({
          page: 1,
          size: 200,
          minLiquidity: 0,
          timeRange: "30d"
        }),
        rangesService.getRangeByAddress(range.address, { charts: true, timeRange: "30d" })
      ]).then(([rangesResponse, rangeData]) => {
        if (!rangeData) return;

        const rangeFromList = rangesResponse.ranges.find(r => r.address === range!.address);
        if (rangeFromList) {
          this.setCurrentPeriodApr(new BN(rangeFromList.period_stats.apr));
          const newRange = new Range(rangeFromList);
          this.rootStore.rangesStore.updateRange(newRange);
        } else {
          this.setCurrentPeriodApr(new BN(rangeData.period_stats.apr));
          const newRange = new Range(rangeData);
          this.rootStore.rangesStore.updateRange(newRange);
        }

        this.setHistory(rangeData.charts || []);
        this.updateBlockHeight();
      });
    }
  };

  loading: boolean = false;
  private _setLoading = (l: boolean) => (this.loading = l);

  history: IHistory[] = [];
  setHistory = (v: IHistory[]) => (this.history = v);

  public indexTokenBalance: BN = BN.ZERO;
  private setIndexBalance = (value: BN) => (this.indexTokenBalance = value);

  public indexTokenDecimals: number = 8;
  private _setIndexTokenDecimals = (value: number) => (this.indexTokenDecimals = value);

  public lpData: LPData | null = null;
  setLPData = (v: LPData) => (this.lpData = v);

  public rewardsDisplayMode: "all" | "fees" | "extra" = "all";
  public setRewardsDisplayMode = (value: "all" | "fees" | "extra") => (this.rewardsDisplayMode = value);

  public showUsdPrice: boolean = false;
  public setShowUsdPrice = (value: boolean) => (this.showUsdPrice = value);

  public timeRangeToDisplayRewards: "1d" | "7d" | "1m" | "3m" | "1y" | "all" = "1m";
  private _setTimeRangeToDisplayRewards = (value: "1d" | "7d" | "1m" | "3m" | "1y" | "all") =>
    (this.timeRangeToDisplayRewards = value);
  public setTimeRangeToDisplayRewards = (value: "1d" | "7d" | "1m" | "3m" | "1y" | "all") => {
    this._setTimeRangeToDisplayRewards(value);
    this.reloadRangeWithTimeRange(value);
  };

  public currentPeriodApr: BN = BN.ZERO;
  private setCurrentPeriodApr = (value: BN) => (this.currentPeriodApr = value);

  private reloadRangeWithTimeRange = async (period: "1d" | "7d" | "1m" | "3m" | "1y" | "all") => {
    const timeRangeMap: Record<"1d" | "7d" | "1m" | "3m" | "1y" | "all", "1d" | "7d" | "30d" | "90d" | "1y" | "all"> = {
      "1d": "1d",
      "7d": "7d",
      "1m": "30d",
      "3m": "90d",
      "1y": "1y",
      "all": "all"
    };
    const timeRange = timeRangeMap[period];

    Promise.all([
      rangesService.getRanges({
        page: 1,
        size: 200,
        minLiquidity: 0,
        timeRange: timeRange
      }),
      rangesService.getRangeByAddress(this.rangeAddress, { timeRange })
    ]).then(([rangesResponse, rangeData]) => {
      const rangeFromList = rangesResponse.ranges.find(r => r.address === this.rangeAddress);

      if (rangeFromList) {
        this.setCurrentPeriodApr(new BN(rangeFromList.period_stats.apr));
        const newRange = new Range(rangeFromList);
        this.rootStore.rangesStore.updateRange(newRange);
      } else if (rangeData) {
        this.setCurrentPeriodApr(new BN(rangeData.period_stats.apr));
        const newRange = new Range(rangeData);
        this.rootStore.rangesStore.updateRange(newRange);
      }

      if (rangeData) {
        this.updatelpRewardsByTime(
          period,
          Object.entries(rangeData.period_stats.fees).map(([assetId, fees]) => ({
            assetId,
            extraEarned: new BN(fees.extra_earned),
            feesEarned: new BN(fees.fees_earned),
            totalEarnedUsd: new BN(fees.total_earned_usd)
          }))
        );
      }
    });
  };

  public lpRewardsByTime: Record<
    "1d" | "7d" | "1m" | "3m" | "1y" | "all",
    { assetId: string; feesEarned: BN; extraEarned: BN; totalEarnedUsd: BN }[]
  > = {} as Record<"1d" | "7d" | "1m" | "3m" | "1y" | "all", { assetId: string; feesEarned: BN; extraEarned: BN; totalEarnedUsd: BN }[]>;
  public updatelpRewardsByTime = (
    key: "1d" | "7d" | "1m" | "3m" | "1y" | "all",
    value: { assetId: string; feesEarned: BN; extraEarned: BN; totalEarnedUsd: BN }[]
  ) => (this.lpRewardsByTime[key] = value);

  public get currentApr(): BN {
    if (this.currentPeriodApr && !this.currentPeriodApr.eq(0)) {
      return this.currentPeriodApr;
    }
    return this.range?.periodStats?.apr ?? BN.ZERO;
  }

  public get LPRewardsToDisplay(): { assetId: string; amount: BN; usdValue?: BN }[] {
    const data = this.lpRewardsByTime[this.timeRangeToDisplayRewards] ?? [];

    switch (this.rewardsDisplayMode) {
      case "all":
        return data
          .map(({ assetId, feesEarned, extraEarned, totalEarnedUsd }) => ({
            assetId,
            amount: feesEarned.plus(extraEarned),
            usdValue: totalEarnedUsd
          }))
          .filter(({ amount }) => amount.gt(0));
      case "fees":
        return data
          .map(({ assetId, feesEarned, totalEarnedUsd }) => {
            const total = feesEarned.plus(this.lpRewardsByTime[this.timeRangeToDisplayRewards]?.find(r => r.assetId === assetId)?.extraEarned || BN.ZERO);
            const feeRatio = total.gt(0) ? feesEarned.div(total) : BN.ZERO;
            return {
              assetId,
              amount: feesEarned,
              usdValue: totalEarnedUsd.times(feeRatio)
            };
          })
          .filter(({ amount }) => amount.gt(0));
      case "extra":
        return data
          .map(({ assetId, extraEarned, totalEarnedUsd, feesEarned }) => {
            const total = feesEarned.plus(extraEarned);
            const extraRatio = total.gt(0) ? extraEarned.div(total) : BN.ZERO;
            return {
              assetId,
              amount: extraEarned,
              usdValue: totalEarnedUsd.times(extraRatio)
            };
          })
          .filter(({ amount }) => amount.gt(0));
      default:
        return [];
    }
  }

  public chartDataLoaded: IHistory[] | null = null;
  public setChartDataLoaded = (value: IHistory[]) => (this.chartDataLoaded = value);

  public chartDataKey: "volume" | "fees" | "liquidity" = "volume";
  public setChartDataKey = (value: "volume" | "fees" | "liquidity") => (this.chartDataKey = value);

  public get chartData() {
    return (
      (this.chartDataLoaded ?? this.range?.charts)
        ?.map(({ owner_fees, protocol_fees, time, ...rest }) => ({
          fees: owner_fees + protocol_fees,
          time: time * 1000,
          ...rest
        }))
        .sort((a, b) => (a.time < b.time ? -1 : 1)) || []
    );
  }

  public chartDataRange: "1d" | "7d" | "1m" | "3m" | "1y" | "all" = "all";
  public setChartDataRange = (range: "1d" | "7d" | "1m" | "3m" | "1y" | "all") => {
    this.chartDataRange = range;
    this.syncChartData(range);
  };

  public get chartTotal(): BN {
    const postfix = this.chartDataRange === "1m" ? "30d" : this.chartDataRange === "3m" ? "90d" : this.chartDataRange;
    switch (this.chartDataKey) {
      case "volume":
        return new BN(this.range?.totals[`volume_${postfix}`] ?? 0);
      case "fees":
        return new BN(this.range?.totals[`pool_fees_${postfix}`] ?? 0);
      case "liquidity":
        return new BN(this.range?.totals[`liquidity_${postfix}`] ?? 0);
    }
    return new BN(this.range?.totals[`${this.chartDataKey}_${postfix}`] ?? 0);
  }

  public currentBlockHeight: number = 0;
  private setCurrentBlockHeight = (value: number) => (this.currentBlockHeight = value);

  updateBlockHeight = async () => {
    const data = await nodeService.blocksHeight();
    this.setCurrentBlockHeight(data.height);
  };

  public useMaxStakeUnstakeAmount: boolean = true;
  public setUseMaxStakeUnstakeAmount = (value: boolean) => (this.useMaxStakeUnstakeAmount = value);

  public stakeUnstakeAmount: BN = this.indexTokenBalance;
  public setStakeUnstakeAmount = (value: BN) => (this.stakeUnstakeAmount = value);

  public stakeUnstakeAction: "stake" | "unstake" = "stake";
  public setStakeUnstakeAction = (value: "stake" | "unstake") => {
    this.stakeUnstakeAction = value;
    if (value === "stake") {
      this.setStakeUnstakeAmount(this.indexTokenBalance);
    } else if (value === "unstake") {
      this.lpData?.indexStaked && this.setStakeUnstakeAmount(BN.parseUnits(this.lpData.indexStaked, this.indexTokenDecimals));
    }
  }

  constructor(rootStore: RootStore, rangeDomain: string) {
    this.rootStore = rootStore;
    this.rangeDomain = rangeDomain;
    makeAutoObservable(this);

    when(
      () => this.range != null,
      () => {
        this.syncChartData("all");
        this.reloadRangeWithTimeRange("1m");
        this.syncIndexTokenInfo();
      }
    );

    when(
      () => this.range != null && this.rootStore.accountStore.address != null,
      () => {
        this.syncLPData();
      }
    );
  }

  convertTimeRange = (timeRange: "1d" | "7d" | "1m" | "3m" | "1y" | "all"): [number, number] => {
    if (timeRange === "all") {
      return [0, dayjs().unix()];
    }
    const periods: Record<string, [number, ManipulateType]> = {
      "1d": [1, "days"],
      "7d": [7, "days"],
      "1m": [1, "months"],
      "3m": [3, "months"],
      "1y": [1, "years"]
    };
    const startTime = dayjs().subtract(periods[timeRange][0], periods[timeRange][1]).unix();
    const endTime = dayjs().unix();
    return [startTime, endTime];
  };

  syncIndexTokenInfo = async () => {
    const address = this.rootStore.accountStore.effectiveAddress;
    if (address == null) return;
    const balance = await assetBalance(this.range!.lpTokenId, address, NODE_URL);
    this.setIndexBalance(new BN(balance ?? 0));
    if (this.stakeUnstakeAction === "stake") {
      this.setStakeUnstakeAmount(this.indexTokenBalance);
    } else if (this.stakeUnstakeAction === "unstake") {
      this.setStakeUnstakeAmount(BN.parseUnits(this.lpData!.indexStaked, this.indexTokenDecimals));
    }
    const lpTokenId = this.range?.lpTokenId;
    const decimals = (lpTokenId && TOKENS_BY_ASSET_ID[lpTokenId]?.decimals) ?? 8;
    decimals && this._setIndexTokenDecimals(decimals);
  };

  public isLPDataLoading = false;
  public setIsLPDataLoading = (value: boolean) => (this.isLPDataLoading = value);

  public syncLPData = async () => {
    const effectiveAddress = this.rootStore.accountStore.effectiveAddress;
    if (!effectiveAddress) return;
    this.setIsLPDataLoading(true);
    rangesService
      .getLPData(this.rangeAddress, effectiveAddress, true)
      .then((data) => {
        if (!data) return;
        const newLPData = new LPData(data);
        this.setLPData(newLPData);
      })
      .finally(() => {
        this.setIsLPDataLoading(false);
      });
  };


  public syncChartData = async (period: "1d" | "7d" | "1m" | "3m" | "1y" | "all") => {
    const [startTime, endTime] = this.convertTimeRange(period);
    rangesService.getChartData(this.rangeAddress, { startTime, endTime }).then((data) => {
      if (!data) return;
      this.setChartDataLoaded(data);
    });
  };

  get rangeBalancesTable() {
    if (this.range?.assets == null) return null;

    return this.range.assets
      .map((a) => ({ ...a, ...TOKENS_BY_ASSET_ID[a.assetId] }))
      .map((token) => {
        if (this.lpData == null) {
          return { ...token, usdnEquivalent: BN.ZERO, value: BN.ZERO };
        }
        const tokenInLP = this.lpData.assetsData.find((a) => a.assetId === token.assetId);
        if (tokenInLP == null) {
          return { ...token, usdnEquivalent: BN.ZERO, value: BN.ZERO };
        }
        const userAmount = tokenInLP.providedAmount;
        const userUsdnEquivalent = tokenInLP.providedAmountUsd;
        return {
          ...token,
          usdnEquivalent: userUsdnEquivalent,
          value: userAmount
        };
      });
  }

  get canClaimRewards() {
    return !(this.lpData?.unclaimedUsd == null || this.lpData.unclaimedUsd.eq(0) || this.loading);
  }

  claimRewards = async () => {
    if (this.lpData?.unclaimedUsd == null || this.lpData.unclaimedUsd.eq(0)) return;
    this._setLoading(true);
    const { accountStore, notificationStore } = this.rootStore;
    accountStore
      .invoke({
        dApp: this.range!.address,
        payment: [],
        call: {
          function: "claimIndexRewards",
          args: []
        }
      })
      .then((txId) => {
        notificationStore.notify(`Your rewards was claimed`, {
          type: "success",
          title: `Success`,
          link: `${EXPLORER_URL}/transactions/${txId}`,
          linkTitle: "View on Explorer"
        });
      })
      .catch((e) => {
        console.error("claimRewards error", e);
        notificationStore.notify(e.message ?? JSON.stringify(e), {
          type: "warning",
          title: "Transaction is not completed"
        });
      })
      .finally(() => {
        this.rootStore.accountStore.updateAccountAssets(true);
        this._setLoading(false);
        this.syncLPData();
      });
  };

  get canUnstakeIndex() {
    return (
      this.lpData &&
      this.lpData.indexStaked &&
      this.lpData.indexStaked.gt(0) &&
      (this.useMaxStakeUnstakeAmount ||
        (this.stakeUnstakeAmount.gt(0) &&
          BN.formatUnits(this.stakeUnstakeAmount, this.indexTokenDecimals).lte(this.lpData.indexStaked)))
    );
  }

  unstakeIndex = async () => {
    if (!this.canUnstakeIndex) return;
    this._setLoading(true);
    const { accountStore, notificationStore } = this.rootStore;
    const unstakeAmount = this.useMaxStakeUnstakeAmount
      ? BN.parseUnits(this.lpData!.indexStaked, this.indexTokenDecimals).toString()
      : this.stakeUnstakeAmount.toString();
    accountStore
      .invoke({
        dApp: this.range!.address,
        payment: [],
        call: {
          function: "unstakeIndex",
          args: [
            {
              type: "integer",
              value: unstakeAmount
            }
          ]
        },
        fee: !this.range?.lpTokenId ? 100500000 : 500000 // 0.1005 WAVES if the lp token was not issued
      })
      .then((txId) => {
        notificationStore.notify(`You have unstaked index token`, {
          type: "success",
          title: `Success`,
          link: `${EXPLORER_URL}/transactions/${txId}`,
          linkTitle: "View on Explorer"
        });
        
        // Мгновенно обновляем staked balance
        if (this.lpData) {
          if (this.useMaxStakeUnstakeAmount) {
            this.lpData.indexStaked = BN.ZERO;
            this.lpData.providedUsd = BN.ZERO;
          } else {
            const unstakeAmountFormatted = BN.formatUnits(this.stakeUnstakeAmount, this.indexTokenDecimals);
            const ratio = unstakeAmountFormatted.div(this.lpData.indexStaked);
            
            this.lpData.indexStaked = this.lpData.indexStaked.minus(unstakeAmountFormatted);
            this.lpData.providedUsd = this.lpData.providedUsd.times(new BN(1).minus(ratio));
            
            if (this.lpData.indexStaked.lt(0)) {
              this.lpData.indexStaked = BN.ZERO;
              this.lpData.providedUsd = BN.ZERO;
            }
          }
        }
        
        this.syncIndexTokenInfo();
        this.syncLPData();
      })
      .catch((e) => {
        notificationStore.notify(e.message ?? JSON.stringify(e), {
          type: "warning",
          title: "Transaction is not completed"
        });
      })
      .finally(() => {
        this.rootStore.accountStore.updateAccountAssets(true);
        this._setLoading(false);
      });
  };

  get canStakeIndex() {
    return (
      this.indexTokenBalance &&
      this.indexTokenBalance.gt(0) &&
      (this.useMaxStakeUnstakeAmount ||
        (this.stakeUnstakeAmount.gt(0) && this.stakeUnstakeAmount.lte(this.indexTokenBalance)))
    );
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
            amount: this.useMaxStakeUnstakeAmount
              ? this.indexTokenBalance.toString()
              : this.stakeUnstakeAmount.toString()
          }
        ],
        call: {
          function: "stakeIndex",
          args: []
        }
      })
      .then((txId) => {
        notificationStore.notify(`Your have staked index token`, {
          type: "success",
          title: `Success`,
          link: `${EXPLORER_URL}/transactions/${txId}`,
          linkTitle: "View on Explorer"
        });
        this.syncIndexTokenInfo();
        this.syncLPData();
      })
      .catch((e) => {
        notificationStore.notify(e.message ?? JSON.stringify(e), {
          type: "warning",
          title: "Transaction is not completed"
        });
      })
      .finally(() => {
        this.rootStore.accountStore.updateAccountAssets(true);
        this._setLoading(false);
      });
  };
}
