import React, { useMemo } from "react";
import { useVM } from "@src/hooks/useVM";
import { makeAutoObservable, reaction, when } from "mobx";
import { RootStore, useStores } from "@stores";
import BN from "@src/utils/BN";
import nodeService from "@src/services/nodeService";
import {
  CONTRACT_ADDRESSES,
  EXPLORER_URL,
  TOKENS_BY_SYMBOL,
} from "@src/constants";
import poolsService from "@src/services/poolsService";

interface IProps {
  children: React.ReactNode;
}

const ctx = React.createContext<NFTStakingVM | null>(null);

export const NFTStakingVMProvider: React.FC<IProps> = ({ children }) => {
  const rootStore = useStores();
  const store = useMemo(() => new NFTStakingVM(rootStore), [rootStore]);
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useNFTStakingVM = () => useVM(ctx);

class NFTStakingVM {
  private contractAddress = CONTRACT_ADDRESSES.ultraStaking;

  loading: boolean = false;
  private _setLoading = (l: boolean) => (this.loading = l);

  constructor(private rootStore: RootStore) {
    makeAutoObservable(this);
    poolsService.getStats().then((d) => this._setStats(d));
    when(
      () => rootStore.accountStore.address != null,
      this.updateAddressStakingInfo
    );
    reaction(
      () => this.rootStore.accountStore?.address,
      this.updateAddressStakingInfo
    );
  }

  public nftDisplayState: number = 0;
  setNftDisplayState = (v: number) => (this.nftDisplayState = v);

  public claimedRewardInUSDN: BN | null = null;
  public claimedRewardInPuzzle: BN | null = null;

  public availableToClaim: BN | null = null;
  public lastClaimDate: BN = BN.ZERO;

  public stats: any = null;
  private _setStats = (v: any) => (this.stats = v);

  private _setClaimedRewardInUSDN = (v: BN) => (this.claimedRewardInUSDN = v);
  private _setClaimedRewardInPuzzle = (v: BN) =>
    (this.claimedRewardInPuzzle = v);
  private _setAvailableToClaim = (v: BN) => (this.availableToClaim = v);
  private _setLastClaimDate = (v: BN) => (this.lastClaimDate = v);

  private updateAddressStakingInfo = async () => {
    const { address } = this.rootStore.accountStore;
    const { contractAddress } = this;
    const usdn = TOKENS_BY_SYMBOL.XTN.assetId;
    const puzzle = TOKENS_BY_SYMBOL.PUZZLE.assetId;
    const keysArray = {
      globalStaked: "global_staked",
      addressStaked: `${address}_staked`,
      claimedRewardInUSDN: `${address}_${usdn}_claimed`,
      claimedRewardInPuzzle: `${address}_${puzzle}_claimed`,
      globalLastCheckInterest: `global_lastCheck_${puzzle}_interest`,
      addressLastCheckInterest: `${address}_lastCheck_${puzzle}_interest`,
      lastClaimDate: `${address}_${puzzle}_lastClaim`,
    };
    const response = await nodeService.nodeKeysRequest(
      contractAddress,
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

    const addressStaked = parsedNodeResponse["addressStaked"] ?? BN.ZERO;
    const claimedRewardInUSDN = parsedNodeResponse["claimedRewardInUSDN"];
    const claimedRewardInPuzzle = parsedNodeResponse["claimedRewardInPuzzle"];
    const globalLastCheckInterest =
      parsedNodeResponse["globalLastCheckInterest"] ?? BN.ZERO;
    const addressLastCheckInterest =
      parsedNodeResponse["addressLastCheckInterest"] ?? BN.ZERO;
    const lastClaimDate = parsedNodeResponse["lastClaimDate"];

    if (addressStaked == null) {
      this._setAvailableToClaim(BN.ZERO);
      this._setClaimedRewardInUSDN(BN.ZERO);
      this._setClaimedRewardInPuzzle(BN.ZERO);
      return;
    }

    this._setClaimedRewardInUSDN(claimedRewardInUSDN ?? BN.ZERO);
    this._setClaimedRewardInPuzzle(claimedRewardInPuzzle ?? BN.ZERO);
    const availableToClaim = globalLastCheckInterest
      .minus(addressLastCheckInterest)
      .times(addressStaked);
    this._setAvailableToClaim(availableToClaim);
    lastClaimDate && this._setLastClaimDate(lastClaimDate);
  };

  get canClaim(): boolean {
    return this.availableToClaim != null && this.availableToClaim.gt(0);
  }

  claim = async () => {
    if (!this.canClaim) return;
    this._setLoading(true);
    const { accountStore, notificationStore } = this.rootStore;
    await accountStore
      .invoke({
        dApp: this.contractAddress,
        payment: [],
        call: { function: "claimReward", args: [] },
      })
      .then(
        (txId) =>
          txId &&
          notificationStore.notify(`Your rewards was claimed`, {
            type: "success",
            title: `Success`,
            link: `${EXPLORER_URL}/transactions/${txId}`,
            linkTitle: "View on Explorer",
          })
      )
      .catch((e) => {
        notificationStore.notify(e.message ?? JSON.stringify(e), {
          type: "error",
          title: "Transaction is not completed",
        });
      })
      .then(this.updateAddressStakingInfo)
      .finally(() => this._setLoading(false));
  };

  stake = async (assetId?: string) => {
    if (assetId == null) return;
    const { accountStore, notificationStore } = this.rootStore;
    this._setLoading(true);
    await accountStore
      .invoke({
        dApp: this.contractAddress,
        payment: [
          { assetId: assetId === "WAVES" ? null : assetId, amount: "1" },
        ],
        call: { function: "stake", args: [] },
      })
      .then(
        (txId) =>
          txId &&
          notificationStore.notify(`Your have staked your nft`, {
            type: "success",
            title: `Success`,
            link: `${EXPLORER_URL}/transactions/${txId}`,
            linkTitle: "View on Explorer",
          })
      )
      .catch((e) => {
        notificationStore.notify(e.message ?? JSON.stringify(e), {
          type: "error",
          title: "Transaction is not completed",
        });
      })
      .then(async () => {
        this.rootStore.nftStore.setAccountNFTs(null);
        this.rootStore.nftStore.setStakedAccountNFTs(null);
        await Promise.all([
          this.rootStore.nftStore.syncAccountNFTs(),
          this.rootStore.nftStore.syncAccountNFTsOnStaking(),
          this.updateAddressStakingInfo(),
        ]);
      })
      .finally(() => this._setLoading(false));
  };

  unStake = async (assetId?: string) => {
    if (assetId == null) return;
    this._setLoading(true);
    const { rootStore } = this;
    const { accountStore, notificationStore } = rootStore;
    await accountStore
      .invoke({
        dApp: this.contractAddress,
        payment: [],
        call: {
          function: "unStake",
          args: [{ type: "string", value: assetId }],
        },
      })
      .then(
        (txId) =>
          txId &&
          notificationStore.notify(`Your have unstaked your nft`, {
            type: "success",
            title: `Success`,
            link: `${EXPLORER_URL}/transactions/${txId}`,
            linkTitle: "View on Explorer",
          })
      )
      .catch((e) => {
        notificationStore.notify(e.message ?? JSON.stringify(e), {
          type: "error",
          title: "Transaction is not completed",
        });
      })
      .then(async () => {
        this.rootStore.nftStore.setAccountNFTs(null);
        this.rootStore.nftStore.setStakedAccountNFTs(null);
        await Promise.all([
          this.rootStore.nftStore.syncAccountNFTs(),
          this.rootStore.nftStore.syncAccountNFTsOnStaking(),
          this.updateAddressStakingInfo(),
        ]);
      })
      .finally(() => this._setLoading(false));
  };
}
