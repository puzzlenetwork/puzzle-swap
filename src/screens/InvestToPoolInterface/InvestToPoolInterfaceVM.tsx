import React, { useMemo } from "react";
import { useVM } from "@src/hooks/useVM";
import { makeAutoObservable, reaction, when } from "mobx";
import { RootStore, useStores } from "@stores";
import BN from "@src/utils/BN";
import { EXPLORER_URL, IToken, NODE_URL } from "@src/constants";
import nodeService from "@src/services/nodeService";
import { ITransaction } from "@src/utils/types";
import { assetBalance } from "@waves/waves-transactions/dist/nodeInteraction";
import makeNodeRequest from "@src/utils/makeNodeRequest";

const ctx = React.createContext<InvestToPoolInterfaceVM | null>(null);

export const InvestToPoolInterfaceVMProvider: React.FC<{
  poolDomain: string;
}> = ({ poolDomain, children }) => {
  const rootStore = useStores();
  const store = useMemo(
    () => new InvestToPoolInterfaceVM(rootStore, poolDomain),
    [rootStore, poolDomain]
  );
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useInvestToPoolInterfaceVM = () => useVM(ctx);

type IReward = {
  value: BN;
  usdEquivalent: BN;
};

class InvestToPoolInterfaceVM {
  public poolDomain: string;
  public rootStore: RootStore;

  loading: boolean = false;
  private _setLoading = (l: boolean) => (this.loading = l);

  loadingHistory: boolean = false;
  private _setLoadingHistory = (l: boolean) => (this.loadingHistory = l);

  public indexTokenId: string | null = null;
  private setIndexTokenId = (value: string) => (this.indexTokenId = value);

  public indexTokenBalance: BN = BN.ZERO;
  private setIndexBalance = (value: BN) => (this.indexTokenBalance = value);

  public accountLiquidity: BN | null = null;
  private setAccountLiquidity = (value: BN) => (this.accountLiquidity = value);

  public accountShareOfPool: BN | null = null;
  private setAccountShareOfPool = (value: BN) =>
    (this.accountShareOfPool = value);

  public totalRewardToClaim: BN = BN.ZERO;
  private setTotalRewardToClaim = (value: BN) =>
    (this.totalRewardToClaim = value);

  public totalClaimedReward: BN = BN.ZERO;
  private setTotalClaimedReward = (value: BN) =>
    (this.totalClaimedReward = value);

  public lastClaimDate: BN = BN.ZERO;
  private _setLastClaimDate = (v: BN) => (this.lastClaimDate = v);

  public poolAssetBalances: { assetId: string; balance: BN }[] = [];
  private setPoolAssetBalances = (value: { assetId: string; balance: BN }[]) =>
    (this.poolAssetBalances = value);

  public transactionsHistory: ITransaction[] | null = null;
  private setTransactionsHistory = (value: any[]) =>
    (this.transactionsHistory = value);

  public userIndexStaked: BN | null = null;
  private setUserIndexStaked = (value: BN) => (this.userIndexStaked = value);

  nftPaymentName: string = "";
  setNFTPaymentName = (v: string) => (this.nftPaymentName = v);

  public get pool() {
    return this.rootStore.poolsStore.getPoolByDomain(this.poolDomain)!;
  }

  constructor(rootStore: RootStore, poolDomain: string) {
    this.poolDomain = poolDomain;
    this.rootStore = rootStore;
    makeAutoObservable(this);
    when(() => this.pool?.isCustom === true, this.loadNFTPaymentInfo);
    when(
      () => this.pool != null,
      async () => {
        await Promise.all([
          this.updatePoolTokenBalances(),
          this.loadTransactionsHistory(),
          this.syncIndexTokenInfo(),
        ]);
      }
    );
    reaction(
      () => this.rootStore.accountStore?.address,
      () => {
        this.pool != null && this.updateRewardInfo();
        this.pool != null && this.updatePoolTokenBalances();
        this.pool != null && this.updateAccountLiquidityInfo();
      }
    );
    when(
      () => rootStore.accountStore.address != null && this.pool != null,
      this.updateAccountLiquidityInfo
    );
    when(
      () => rootStore.accountStore.address != null && this.pool != null,
      this.updateRewardInfo
    );
  }

  updateAccountLiquidityInfo = async () => {
    if (this.rootStore.accountStore.address) {
      const info = await this.pool.getAccountLiquidityInfo(
        this.rootStore.accountStore.address
      );
      this.setAccountShareOfPool(info.shareOfPool);
      this.setAccountLiquidity(info.liquidityInUsdn);
    }
  };

  syncIndexTokenInfo = async () => {
    const { address } = this.rootStore.accountStore;
    const indexTokenIdResponse = await this.pool.contractKeysRequest(
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
  getTokenRewardInfo = async (
    token: IToken
  ): Promise<IReward & { assetId: string }> => {
    const { accountStore } = this.rootStore;
    const { address } = accountStore;
    const assetBalance = this.poolAssetBalances.find(
      ({ assetId }) => assetId === token.assetId
    );
    const realBalance = assetBalance?.balance ?? BN.ZERO;

    const keysArray = {
      globalTokenBalance: `global_${token.assetId}_balance`,
      globalLastCheckTokenEarnings: `global_lastCheck_${token.assetId}_earnings`,
      globalIndexStaked: "global_indexStaked",
      globalLastCheckTokenInterest: `global_lastCheck_${token.assetId}_interest`,
      userLastCheckTokenInterest: `${address}_lastCheck_${token.assetId}_interest`,
      userIndexStaked: `${address}_indexStaked`,
      claimedReward: `${address}_claimedRewardValue`,
      lastClaimDate: `${address}_lastClaim`,
    };
    const response = await this.pool.contractKeysRequest(
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

    const globalTokenBalance = parsedNodeResponse["globalTokenBalance"];
    const globalLastCheckTokenEarnings =
      parsedNodeResponse["globalLastCheckTokenEarnings"];
    const globalIndexStaked =
      parsedNodeResponse["globalIndexStaked"] ?? BN.ZERO;
    const globalLastCheckTokenInterest =
      parsedNodeResponse["globalLastCheckTokenInterest"];
    const userLastCheckTokenInterest =
      parsedNodeResponse["userLastCheckTokenInterest"];
    const userIndexStaked = parsedNodeResponse["userIndexStaked"];
    const claimedReward = parsedNodeResponse["claimedReward"];
    const lastClaimDate = parsedNodeResponse["lastClaimDate"];

    this.setTotalClaimedReward(claimedReward ?? BN.ZERO);
    this.setUserIndexStaked(userIndexStaked);
    lastClaimDate && this._setLastClaimDate(lastClaimDate);

    const newEarnings = BN.max(
      realBalance.minus(globalTokenBalance),
      globalLastCheckTokenEarnings
    ).minus(globalLastCheckTokenEarnings);

    const lastCheckInterest =
      globalLastCheckTokenInterest == null || globalIndexStaked.eq(0)
        ? BN.ZERO
        : globalLastCheckTokenInterest;

    const currentInterest = lastCheckInterest.plus(
      newEarnings.div(globalIndexStaked)
    );

    const lastCheckUserInterest = userLastCheckTokenInterest
      ? userLastCheckTokenInterest
      : BN.ZERO;

    const rewardAvailable = currentInterest
      .minus(lastCheckUserInterest)
      .times(BN.formatUnits(userIndexStaked, 8));

    const rate =
      this.rootStore.poolsStore.usdnRate(token.assetId, 1) ?? BN.ZERO;

    const usdEquivalent = rewardAvailable.times(rate);

    return {
      value: rewardAvailable.isNaN()
        ? BN.ZERO
        : BN.formatUnits(rewardAvailable, token.decimals),
      assetId: token.assetId,
      usdEquivalent: BN.formatUnits(usdEquivalent, token.decimals),
    };
  };

  updateRewardInfo = async () => {
    const rawData = await Promise.all(
      this.pool.tokens.map(this.getTokenRewardInfo)
    );
    const totalRewardAmount = rawData.reduce(
      (acc, value) =>
        acc.plus(value.usdEquivalent.isNaN() ? BN.ZERO : value.usdEquivalent),
      BN.ZERO
    );
    this.setTotalRewardToClaim(totalRewardAmount);
  };

  get poolCompositionValues() {
    if (this.pool.tokens == null) return [];
    return this.pool.tokens.reduce<
      (IToken & { value: BN; parsedBalance: BN })[]
    >((acc, token) => {
      const balance = BN.formatUnits(
        this.pool.liquidity[token.assetId] ?? BN.ZERO,
        token.decimals
      );
      const rate = this.rootStore.poolsStore.usdnRate(token.assetId);
      return [
        ...acc,
        {
          ...token,
          value: balance.times(rate ?? 0),
          parsedBalance: balance,
        },
      ];
    }, []);
  }

  get poolBalancesTable() {
    if (this.pool.tokens == null) return null;
    return this.pool?.tokens.map((token) => {
      if (this.userIndexStaked == null || this.userIndexStaked?.eq(0)) {
        return { ...token, usdnEquivalent: BN.ZERO, value: BN.ZERO };
      }
      const top =
        this.pool.liquidity[token.assetId]?.times(
          this.userIndexStaked ?? BN.ZERO
        ) ?? BN.ZERO;
      const tokenAmountToGet = top.div(this.pool.globalPoolTokenAmount);
      const parserAmount = BN.formatUnits(tokenAmountToGet, token.decimals);
      const rate =
        this.rootStore.poolsStore.usdnRate(token.assetId, 1) ?? BN.ZERO;
      const usdnEquivalent = BN.formatUnits(
        tokenAmountToGet.times(rate),
        token.decimals
      );
      return { ...token, usdnEquivalent: usdnEquivalent, value: parserAmount };
    });
  }

  claimRewards = async () => {
    if (this.totalRewardToClaim.eq(0)) return;
    if (this.pool.layer2Address == null) return;
    this._setLoading(true);
    const { accountStore, notificationStore } = this.rootStore;
    accountStore
      .invoke({
        dApp: this.pool.contractAddress,
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
          link: `${EXPLORER_URL}/tx/${txId}`,
          linkTitle: "View on Explorer",
        });
      })
      .catch((e) => {
        notificationStore.notify(e.message ?? JSON.stringify(e), {
          type: "error",
          title: "Transaction is not completed",
        });
      })
      .then(this.updateRewardInfo)
      .finally(() => this._setLoading(false));
  };

  get canClaimRewards() {
    return !(this.totalRewardToClaim.eq(0) || this.loading);
  }

  updatePoolTokenBalances = async () => {
    const { pool } = this;
    //todo ✅
    const { data }: { data: TContractAssetBalancesResponse } =
      await makeNodeRequest(`/assets/balance/${pool.contractAddress}`);
    const value = data.balances.map((token) => {
      return { assetId: token.assetId, balance: new BN(token.balance) };
    });
    this.setPoolAssetBalances(value);
  };

  loadNFTPaymentInfo = async () => {
    const { isCustom, artefactOriginTransactionId } = this.pool;
    if (isCustom == null || !isCustom || artefactOriginTransactionId == null)
      return;
    const data = await nodeService.transactionInfo(artefactOriginTransactionId);
    this.setNFTPaymentName(
      data?.stateChanges.invokes[0].call.args[0].value.toString() ?? ""
    );
  };

  loadTransactionsHistory = async () => {
    //todo ✅
    const v = await nodeService.transactions(this.pool.contractAddress);
    v && this.setTransactionsHistory(v);
  };

  loadMoreHistory = async () => {
    this._setLoadingHistory(true);
    const { pool, transactionsHistory } = this;
    if (transactionsHistory == null) return;
    const after = transactionsHistory.slice(-1).pop();
    if (after == null) return;
    //todo ✅
    const v = await nodeService.transactions(
      pool.contractAddress,
      10,
      after.id
    );
    this._setLoadingHistory(false);
    v && this.setTransactionsHistory([...transactionsHistory, ...v]);
  };

  unstakeIndex = async () => {
    if (this.userIndexStaked == null || this.userIndexStaked?.eq(0)) return;
    if (this.pool.layer2Address == null) return;
    this._setLoading(true);
    const { accountStore, notificationStore } = this.rootStore;
    accountStore
      .invoke({
        dApp: this.pool.contractAddress,
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
          link: `${EXPLORER_URL}/tx/${txId}`,
          linkTitle: "View on Explorer",
        });
      })
      .catch((e) => {
        notificationStore.notify(e.message ?? JSON.stringify(e), {
          type: "error",
          title: "Transaction is not completed",
        });
      })
      .then(this.updateRewardInfo)
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
        dApp: this.pool.contractAddress,
        payment: [
          {
            assetId: this.indexTokenId,
            amount: this.indexTokenBalance.toString(),
          },
        ],
        call: {
          function: "stakeIndex",
          args: [],
        },
      })
      .then(this.syncIndexTokenInfo)
      .then(this.updateRewardInfo)
      .then(this.updatePoolTokenBalances)
      .then((txId) => {
        notificationStore.notify(`Your have staked index token`, {
          type: "success",
          title: `Success`,
          link: `${EXPLORER_URL}/tx/${txId}`,
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
}

type TContractAssetBalancesResponse = {
  address: string;
  balances: IPoolTokenBalance[];
};
type IPoolTokenBalance = {
  assetId: string;
  balance: number;
  issueTransaction: null | any;
  minSponsoredAssetFee: number;
  quantity: number;
  reissuable: boolean;
  sponsorBalance: number;
};
