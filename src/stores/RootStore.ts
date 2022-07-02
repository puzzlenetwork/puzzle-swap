import { makeAutoObservable } from "mobx";
import PoolsStore from "@stores/PoolsStore";
import AccountStore, { ISerializedAccountStore } from "@stores/AccountStore";
import NotificationStore from "@stores/NotificationStore";
import NftStore from "@stores/NFTStore";
import StakeStore from "@stores/StakeStore";
import TokenStore, { ISerializedTokenStore } from "@stores/TokenStore";

export interface ISerializedRootStore {
  accountStore?: ISerializedAccountStore;
  tokenStore?: ISerializedTokenStore;
}

export default class RootStore {
  public accountStore: AccountStore;
  public poolsStore: PoolsStore;
  public notificationStore: NotificationStore;
  public nftStore: NftStore;
  public stakeStore: StakeStore;
  public tokenStore: TokenStore;

  constructor(initState?: ISerializedRootStore) {
    this.tokenStore = new TokenStore(this);
    this.notificationStore = new NotificationStore(this);
    this.accountStore = new AccountStore(this, initState?.accountStore);
    this.poolsStore = new PoolsStore(this);
    this.nftStore = new NftStore(this);
    this.stakeStore = new StakeStore(this);
    makeAutoObservable(this);
  }

  serialize = (): ISerializedRootStore => ({
    accountStore: this.accountStore.serialize(),
    tokenStore: this.tokenStore.serialize(),
  });
}
