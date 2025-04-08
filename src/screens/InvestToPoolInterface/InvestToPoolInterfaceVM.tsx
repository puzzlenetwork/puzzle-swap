import React, { useMemo } from "react";
import { useVM } from "@src/hooks/useVM";
import { makeAutoObservable, reaction, when } from "mobx";
import { RootStore, useStores } from "@stores";
import BN from "@src/utils/BN";
import {
  CONTRACT_ADDRESSES,
  EXPLORER_URL,
  NODE_URL,
  TOKENS_BY_ASSET_ID,
} from "@src/constants";
import nodeService from "@src/services/nodeService";
import { IHistory, ITransaction } from "@src/utils/types";
import { assetBalance } from "@waves/waves-transactions/dist/nodeInteraction";
import makeNodeRequest from "@src/utils/makeNodeRequest";
import poolsService from "@src/services/poolsService";

const ctx = React.createContext<InvestToPoolInterfaceVM | null>(null);

interface IProps {
  children: React.ReactNode;
  poolDomain: string;
}

export const InvestToPoolInterfaceVMProvider: React.FC<IProps> = ({
  poolDomain,
  children,
}) => {
  const rootStore = useStores();
  const store = useMemo(
    () => new InvestToPoolInterfaceVM(rootStore, poolDomain),
    [rootStore, poolDomain]
  );
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useInvestToPoolInterfaceVM = () => useVM(ctx);

class InvestToPoolInterfaceVM {
  public poolDomain: string;
  public rootStore: RootStore;

  public currentBlockHeight: number | null = null;
  private setCurrentBlockHeight = (v: number) => (this.currentBlockHeight = v);

  loading: boolean = false;
  private _setLoading = (l: boolean) => (this.loading = l);

  loadingHistory: boolean = false;
  private _setLoadingHistory = (l: boolean) => (this.loadingHistory = l);

  public indexTokenId: string | null = null;
  private setIndexTokenId = (value: string) => (this.indexTokenId = value);

  public indexTokenBalance: BN = BN.ZERO;
  private setIndexBalance = (value: BN) => (this.indexTokenBalance = value);

  public totalRewardToClaim: BN | null = null;
  private setTotalRewardToClaim = (value: BN) =>
    (this.totalRewardToClaim = value);

  public dicToClaim: any | null = null;
  private setDicToClaim = (value: any) =>
    (this.dicToClaim = value);

  public totalClaimedReward: BN | null = null;
  private setTotalClaimedReward = (value: BN) =>
    (this.totalClaimedReward = value);

  public claimedRewardList: any | null = null;
  private setClaimedRewardList = (value: any) =>
      (this.claimedRewardList = value);

  public lastClaimDate: BN = BN.ZERO;
  private _setLastClaimDate = (v: BN) => (this.lastClaimDate = v);

  public globalIndexStaked: BN = BN.ZERO;
  private _setGlobalIndexStaked = (v: BN) => (this.globalIndexStaked = v);

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

  history: IHistory[] = []
  setHistory = (v: IHistory[]) => (this.history = v);

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
          this.updateBlockHeight(),
          this.updatePoolTokenBalances(),
          this.getAddressActivityInfo(),
          this.loadTransactionsHistory(),
          this.calcRewards(),
          this.syncIndexTokenInfo(),
          this.updatePoolChartByDomain(),
        ]);
      }
    );
    reaction(
      () => this.rootStore.accountStore?.address,
      () => {
        this.pool != null && this.getAddressActivityInfo();
        this.pool != null && this.calcRewards();
        this.pool != null && this.updatePoolTokenBalances();
        this.pool != null && this.updatePoolChartByDomain();
      }
    );
  }

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
  getAddressActivityInfo = async () => {
    const { address } = this.rootStore.accountStore;
    if (address == null) return;
    const keysArray = {
      globalIndexStaked: "global_indexStaked",
      userIndexStaked: `${address}_indexStaked`,
      claimedReward: `${address}_claimedRewardValue`,
      lastClaimDate: `${address}_DG2xFkPdDwKUoBkzGAhQtLpSGzfXLiCYPEzeKH2Ad24p_lastClaim`,
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

    console.log("HERE");
    const res = await fetch(`https://puzzle-py-api-feaf3dd76a7a.herokuapp.com/api/claimedRewardsInPool?pool=${this.pool.address}&user=${address}`)
    if (!res.ok) {
      // This will activate the closest `error.js` Error Boundary
      throw new Error('Failed to fetch data')
    }
    const resJson = await res.json();
    console.log(resJson);

    const claimedReward = parsedNodeResponse["claimedReward"];
    const claimedRewardList: {string: number} = resJson;
    const lastClaimDate = parsedNodeResponse["lastClaimDate"];
    const userIndexStaked = parsedNodeResponse["userIndexStaked"];
    const globalIndexStaked = parsedNodeResponse["globalIndexStaked"];
    lastClaimDate && this._setLastClaimDate(lastClaimDate);
    this.setTotalClaimedReward(claimedReward ?? BN.ZERO);
    this.setClaimedRewardList(claimedRewardList ?? {});
    this.setUserIndexStaked(userIndexStaked);
    this._setGlobalIndexStaked(globalIndexStaked);
  };

  calcRewards = async () => {
    const { address } = this.rootStore.accountStore;
    if (address == null || this.pool?.address == null) return;
    const data = await nodeService.evaluate(
      CONTRACT_ADDRESSES.calcReward,
      `calcRewardToClaim(false, "${this.pool?.address}", "${address}")`
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

    this.setTotalRewardToClaim(totalRewardInDoll);
    this.setDicToClaim(dicClaim);
  };

  get poolCompositionValues() {
    if (this.pool.tokens == null) return [];
    if (this.pool.liquidity == null) return [];
    return this.pool.tokens.reduce<any[]>((acc, token) => {
      const pool = this.rootStore.poolsStore.pools.find((el) => el.address === this.pool.address)
      if (!pool?.assets) return []
      const asset = pool?.assets.find((el: any) => el.asset_id === token.assetId)
      const balance = new BN(asset?.balance ?? BN.ZERO)
      const rate = this.rootStore.poolsStore.usdtRate(token.assetId);
      return [
        ...acc,
        {
          ...token,
          share: token.share,
          value: new BN(balance ?? 0).times(rate ?? 0),
          parsedBalance: balance,
        },
      ];
    }, []);
  }

  get totalProvidedLiquidityByAddress() {
    if (
      this.rootStore.accountStore.address == null ||
      this.userIndexStaked == null
    )
      return BN.ZERO;
    const liquidityInUsdt = this.pool.globalLiquidity
      .times(this.userIndexStaked)
      .div(this.pool.globalPoolTokenAmount);
    return liquidityInUsdt.isNaN() ? BN.ZERO : liquidityInUsdt;
  }

  get shareOfPool() {
    if (this.rootStore.accountStore.address == null) return BN.ZERO;
    return this.totalProvidedLiquidityByAddress
      .times(new BN(100))
      .div(this.pool.globalLiquidity);
  }

  get poolBalancesTable() {
    if (this.pool.tokens == null) return null;
    return this.pool?.tokens.map((token) => {
      if (
        this.userIndexStaked == null ||
        this.userIndexStaked?.eq(0) ||
        this.pool.liquidity == null
      ) {
        return { ...token, usdnEquivalent: BN.ZERO, value: BN.ZERO };
      }
      const top =
        this.pool.liquidity[token.assetId]?.times(
          this.userIndexStaked ?? BN.ZERO
        ) ?? BN.ZERO;
      const tokenAmountToGet = top.div(this.pool.globalPoolTokenAmount);
      const parserAmount = BN.formatUnits(tokenAmountToGet, token.decimals);
      const rate =
        this.rootStore.poolsStore.usdtRate(token.assetId, 1) ?? BN.ZERO;
      const usdnEquivalent = BN.formatUnits(
        tokenAmountToGet.times(rate),
        token.decimals
      );
      return { ...token, usdnEquivalent: usdnEquivalent, value: parserAmount };
    });
  }
  claimRewards = async () => {
    if (this.totalRewardToClaim == null || this.totalRewardToClaim.eq(0))
      return;
    if (this.pool.layer2Address == null) return;
    this._setLoading(true);
    const { accountStore, notificationStore } = this.rootStore;
    accountStore
      .invoke({
        dApp: this.pool.address,
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

  updateBlockHeight = async () => {
    const data = await nodeService.blocksHeight();
    this.setCurrentBlockHeight(data.height);
  };
  updatePoolTokenBalances = async () => {
    const { pool } = this;
    const { data }: { data: TContractAssetBalancesResponse } =
      await makeNodeRequest(`/assets/balance/${pool.address}`);
    const value = data.balances.map((token) => {
      return { assetId: token.assetId, balance: new BN(token.balance) };
    });
    this.setPoolAssetBalances(value);
  };
  updatePoolChartByDomain = async () => {
   const data = await poolsService.getPoolChartByDomain(this.pool.address);
   this.setHistory(data)
  }

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
    const transactions = await nodeService.transactions(this.pool.address, 20);

    const parsedTransactions = transactions?.map(tx => {
      if (tx.dApp === this.pool.address|| tx.dApp === this.pool.layer2Address) {
        return tx;
      };
      if (tx.stateChanges) {
        const invokes = tx.stateChanges.invokes;
        const localTx = invokes.find(x => x.dApp === this.pool.address || x.dApp === this.pool.layer2Address);
        if(localTx) {
          localTx.height = tx.height;
          localTx.id = tx.id;
          return localTx;
        }

        for (let i = 0; i < invokes.length; i++) {
          const localInvokes = invokes[i].stateChanges.invokes;
          const localTx = localInvokes.find(x => x.dApp === this.pool.address || x.dApp === this.pool.layer2Address);
          if (localTx) {
            localTx.height = tx.height;
            localTx.id = tx.id;
            return localTx;
          }
        }
      }
      return null;
    });

    parsedTransactions && this.setTransactionsHistory(parsedTransactions);
  };

  loadMoreHistory = async () => {
    this._setLoadingHistory(true);
    const { pool, transactionsHistory } = this;
    if (transactionsHistory == null) return;
    const after = transactionsHistory.slice(-1).pop();
    if (after == null) return;
    const v0 = await nodeService.transactions(
      pool.address,
      20,
      after.id
    );
    const v = v0?.map(tx => {
      if (tx.dApp === this.pool.address || tx.dApp === this.pool.layer2Address) {return tx}
      else {
        const localTx = tx.stateChanges.invokes.find(x => x.dApp === this.pool.address || x.dApp === this.pool.layer2Address);
        console.log(localTx);
        if (!localTx) {return tx}
        else {
          localTx.height = tx.height;
          localTx.id = tx.id;
          return localTx;
        }
      }
    })
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
        dApp: this.pool.address,
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
        dApp: this.pool.address,
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
      .then(this.updatePoolTokenBalances)
      .then((txId) => {
        notificationStore.notify(`Your have staked index token`, {
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

  prepareCompletePoolInitialization = () => {
    const assets = this.pool.tokens.map((t) => ({
      assetId: t.assetId,
      share: new BN(t.share),
    }));
    const state = {
      assets,
      logo: this.pool.logo,
      title: this.pool.title,
      domain: this.pool.domain,
      step: 3,
      fileName: "–",
      fileSize: "–",
      maxStep: 3,
      swapFee: this.pool.swapFee,
    };
    localStorage.setItem("puzzle-custom-pool", JSON.stringify(state));
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
