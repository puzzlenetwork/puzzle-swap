import React, { useMemo } from "react";
import { useVM } from "@src/hooks/useVM";
import { RootStore, useStores } from "@stores";
import { makeAutoObservable, when } from "mobx";
import rangesService from "@src/services/rangesService";
import { IStakedProviders, Range } from "@src/entities/Range";
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

  public dicToClaim: any | null = null;
  private setDicToClaim = (value: any) => (this.dicToClaim = value);

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
        this.calcRewards();
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

  calcRewards = async () => {
    const { address } = this.rootStore.accountStore;
    if (address == null || this.range?.address == null) return;
    const data = await nodeService.evaluate(
      CONTRACT_ADDRESSES.calcReward,
      `calcRewardToClaim(false, "${this.range?.address}", "${address}")`
    );
    const tokensStr = data.result.value["_2"].value;
    const tokens = tokensStr
      .toString()
      .split("|")
      .filter((v) => v !== "");
    const dicClaim = {};
    const totalRewardInDoll = tokens.reduce((acc, v) => {
      const details = v.split(",");
      const assetId = details[0];
      const amount = details[1];
      if (new BN(amount).lt(0)) {
        return acc.plus(0);
      }
      // @ts-ignore
      dicClaim[assetId] = amount;
      const dollEquivalent = this.rootStore.poolsStore
        .usdtRate(assetId)
        ?.times(BN.formatUnits(amount, TOKENS_BY_ASSET_ID[assetId]?.decimals));
      return acc.plus(dollEquivalent ?? 0);
    }, BN.ZERO);

    this.setDicToClaim(dicClaim);
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
      .then(this.calcRewards)
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
              value: this.userIndexStaked?.toString(),
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
      .then(this.calcRewards)
      .finally(() => this._setLoading(false));
  };

  get canStakeIndex() {
    return !this.indexTokenBalance.eq(0);
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
            amount: this.indexTokenBalance.toString(),
          },
        ],
        call: {
          function: "stakeIndex",
          args: [],
        },
      })
      .then(this.syncIndexTokenInfo)
      .then(this.calcRewards)
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
