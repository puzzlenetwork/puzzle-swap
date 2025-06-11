import React, { useMemo } from "react";
import { useVM } from "@src/hooks/useVM";
import { RootStore, useStores } from "@stores";
import { makeAutoObservable, when } from "mobx";
import rangesService from "@src/services/rangesService";
import { IRangeAsset, IStakedProviders, Range } from "@src/entities/Range";
import BN from "@src/utils/BN";
import { IHistory } from "@src/utils/types";
import nodeService from "@src/services/nodeService";
import { CONTRACT_ADDRESSES, EXPLORER_URL, NODE_URL, TOKENS_BY_ASSET_ID } from "@src/constants";
import { assetBalance } from "@waves/waves-transactions/dist/nodeInteraction";

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

  public indexTokenId: string | null = null;
  private setIndexTokenId = (value: string) => (this.indexTokenId = value);

  public indexTokenBalance: BN = BN.ZERO;
  private setIndexBalance = (value: BN) => (this.indexTokenBalance = value);

  public lastClaimDate: BN = BN.ZERO;
  private _setLastClaimDate = (v: BN) => (this.lastClaimDate = v);

  public globalIndexStaked: BN = BN.ZERO;
  private _setGlobalIndexStaked = (v: BN) => (this.globalIndexStaked = v);

  public userIndexStaked: BN | null = null;
  private setUserIndexStaked = (value: BN) => (this.userIndexStaked = value);

  public get totalClaimedReward(): BN | null {
    const userInfo = this.range?.stakedProviders.providers_staked.find((p) => p.address === this.rootStore.accountStore.address);
    return userInfo ? new BN(userInfo.claimed_usd) : BN.ZERO;
  }

  public get totalRewardToClaim(): BN | null {
    const userInfo = this.range?.stakedProviders.providers_staked.find((p) => p.address === this.rootStore.accountStore.address);
    return userInfo ? new BN(userInfo.unclaimed_usd) : BN.ZERO;
  };

  public rewardsDisplayMode: ("all" | "fees" | "extra") = "all";
  public setRewardsDisplayMode = (value: "all" | "fees" | "extra") => (this.rewardsDisplayMode = value);

  public timeRangeToDisplayRewards: ("1d" | "7d" | "1m" | "3m" | "1y" | "all") = "all";
  public setTimeRangeToDisplayRewards = (value: ("1d" | "7d" | "1m" | "3m" | "1y" | "all")) => (this.timeRangeToDisplayRewards = value);

  public get LPRewardsToDisplay(): {assetId: string, amount: BN}[] {
    switch (this.rewardsDisplayMode) {
      case "all":
        return this.range!.assets.map(({ asset_id, fees_earned, extra_earned }) => ({ assetId: asset_id, amount: new BN(fees_earned + extra_earned) })).filter(({ amount }) => amount.gt(0));
      case "fees":
        return this.range!.assets.map(({ asset_id, fees_earned }) => ({ assetId: asset_id, amount: new BN(fees_earned) })).filter(({ amount }) => amount.gt(0));
      case "extra":
        return this.range!.assets.map(({ asset_id, extra_earned }) => ({ assetId: asset_id, amount: new BN(extra_earned) })).filter(({ amount }) => amount.gt(0));
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
      })
  }

  prepareCompleteRangeInitialization = () => {
    const assets = this.range!.assets.map((t) => ({
      assetId: t.asset_id,
      share: new BN(t.share),
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
    const indexTokenIdResponse = await this.range!.contractKeysRequest(
      "static_poolToken_idStr"
    );
    if (address == null) return;
    if (indexTokenIdResponse != null && indexTokenIdResponse.length === 1) {
      const indexTokenId = indexTokenIdResponse[0].value.toString();
      this.setIndexTokenId(indexTokenId);
      const balance = await assetBalance(indexTokenId, address, NODE_URL);
      this.setIndexBalance(new BN(balance ?? 0));
    }
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

  get totalProvidedLiquidityByAddress() {
    const userInfo = this.range?.stakedProviders.providers_staked.find((p) => p.address === this.rootStore.accountStore.address);
    return userInfo?.index_staked ? new BN(userInfo.index_staked).times(this.range!.indexTokenRate ?? BN.ZERO) : BN.ZERO;
  }

  get shareOfPool() {
    const userInfo = this.range?.stakedProviders.providers_staked.find((p) => p.address === this.rootStore.accountStore.address);
    return userInfo ? new BN(userInfo.share) : BN.ZERO;
  }

  get poolBalancesTable() {
    if (this.range?.assets == null) return null;

    return this.range.assets
      .map((a) => ({ ...a, ...TOKENS_BY_ASSET_ID[a.asset_id] }))
      .map((token) => {
      if (
        this.userIndexStaked == null ||
        this.userIndexStaked?.eq(0) ||
        this.range!.liquidity == null
      ) {
        return { ...token, usdnEquivalent: BN.ZERO, value: BN.ZERO };
      }
      const userAmount = this.shareOfPool.times(token.fact_balance);
      const userUsdnEquivalent = this.shareOfPool.times(token.fact_balance_usd);
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
    accountStore
      .invoke({
        dApp: this.range!.address,
        payment: [],
        call: {
          function: "unstakeIndex",
          args: [
            {
              type: "integer",
              value: this.useMaxStakeUnstakeAmount ? this.userIndexStaked?.toString() : this.stakeUnstakeAmount.toString(),
            },
          ],
        },
      })
      .then((txId) => {
        notificationStore.notify(`Your have unstaked index tokem`, {
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
    if (this.indexTokenId == null) return;
    accountStore
      .invoke({
        dApp: this.range!.address,
        payment: [
          {
            assetId: this.indexTokenId === "WAVES" ? null : this.indexTokenId,
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
