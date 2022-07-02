import RootStore from "@stores/RootStore";
import { makeAutoObservable } from "mobx";

export interface ISerializedTokenStore {
  watchList: string[];
}

export default class TokenStore {
  public rootStore: RootStore;

  public watchList: string[];
  public addToWatchList = (assetId: string) => this.watchList.push(assetId);
  public removeFromWatchList = (assetId: string) => {
    const index = this.watchList.indexOf(assetId);
    index !== -1 && this.watchList.splice(index, 1);
  };
  constructor(rootStore: RootStore, initState?: ISerializedTokenStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
    this.watchList = initState?.watchList ?? [];
  }

  serialize = (): ISerializedTokenStore => ({
    watchList: this.watchList,
  });
}
