import { RootStore } from "./index";
import { makeAutoObservable } from "mobx";

export default class RangesStore {
  constructor(rootStore: RootStore) {
    console.log("constructor of ranges tore");
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  public rootStore: RootStore;
}
