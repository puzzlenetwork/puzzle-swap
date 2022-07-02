import RootStore from "@stores/RootStore";
import { makeAutoObservable } from "mobx";
import { TOKENS_BY_ASSET_ID, TOKENS_LIST } from "@src/constants";
import wavesCapService from "@src/services/wavesCapService";
import BN from "@src/utils/BN";

export interface ISerializedTokenStore {
  watchList: string[];
}

export type TTokenStatistics = {
  assetId: string;
  totalSupply: BN;
  circulatingSupply: BN;
  totalBurned: BN;
  fullyDilutedMC: BN;
  marketCap: BN;
  currentPrice: BN;
  change24H: BN;
};

export default class TokenStore {
  public rootStore: RootStore;

  initialized: boolean = false;
  private setInitialized = (v: boolean) => (this.initialized = v);

  statistics: Array<TTokenStatistics> = [];
  private setStatistics = (v: Array<TTokenStatistics>) => (this.statistics = v);

  get statisticsByAssetId() {
    return this.statistics.reduce(
      (acc, stats) => ({ ...acc, [stats.assetId]: stats }),
      {} as Record<string, TTokenStatistics>
    );
  }

  public watchList: string[];
  public addToWatchList = (assetId: string) => this.watchList.push(assetId);
  public removeFromWatchList = (assetId: string) => {
    const index = this.watchList.indexOf(assetId);
    index !== -1 && this.watchList.splice(index, 1);
  };

  private syncTokenStatistics = async () => {
    const { notificationStore } = this.rootStore;
    const assets = TOKENS_LIST.map(({ assetId }) => assetId);
    const stats = await wavesCapService.getAssetsStats(assets).catch((e) => {
      notificationStore.notify(e.message ?? e.toString(), {
        type: "error",
      });
      return [];
    });
    const statistics = stats.map((details) => {
      const asset = TOKENS_BY_ASSET_ID[details.id];
      const decimals = asset.decimals;
      const firstPrice = new BN(details.data?.["firstPrice_usd-n"] ?? 0);
      const currentPrice = new BN(details.data?.["lastPrice_usd-n"] ?? 0);

      const totalSupply = BN.formatUnits(details.totalSupply, decimals);
      const circulatingSupply = BN.formatUnits(details.circulating, decimals);

      const change24H = currentPrice.div(firstPrice).minus(1).times(100);
      return {
        assetId: details.id,
        totalSupply,
        circulatingSupply: BN.formatUnits(details.circulating, decimals),
        change24H: currentPrice.div(firstPrice).minus(1).times(100),
        change24HUsd: change24H.times(currentPrice),
        currentPrice,
        fullyDilutedMC: totalSupply.times(currentPrice),
        marketCap: circulatingSupply.times(currentPrice),
        totalBurned: totalSupply.minus(circulatingSupply),
        volume24: new BN(details["24h_vol_usd-n"]),
      };
    });
    this.setStatistics(statistics);
  };

  constructor(rootStore: RootStore, initState?: ISerializedTokenStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
    this.watchList = initState?.watchList ?? [];
    Promise.all([this.syncTokenStatistics()]).then(() =>
      this.setInitialized(true)
    );
    setInterval(this.syncTokenStatistics, 60 * 1000);
  }

  serialize = (): ISerializedTokenStore => ({
    watchList: this.watchList,
  });
}
