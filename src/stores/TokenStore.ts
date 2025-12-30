import RootStore from "@stores/RootStore";
import { makeAutoObservable } from "mobx";
import { TOKENS_BY_ASSET_ID, TOKENS_LIST } from "@src/constants";
import wavesCapService from "@src/services/wavesCapService";
import BN from "@src/utils/BN";
import tokensService, { TokenStatisticsFromBackend } from "@src/services/tokensService";

export interface ISerializedTokenStore {
  watchList: string[];
  hiddenTokens: string[];
}

export type TTokenStatistics = {
  assetId: string;
  decimals: number;
  name: string;
  symbol: string;
  totalSupply: BN;
  circulatingSupply: BN;
  totalBurned: BN;
  fullyDilutedMC: BN;
  marketCap: BN;
  currentPrice: BN;
  change24H: BN;
  change24HUsd: BN;
  volume24: BN;
  changeStr: string;
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

  public hiddenTokens: string[];
  public hideToken = (assetId: string) => {
    if (!this.hiddenTokens.includes(assetId)) {
      this.hiddenTokens.push(assetId);
    }
  };
  public unhideToken = (assetId: string) => {
    const index = this.hiddenTokens.indexOf(assetId);
    index !== -1 && this.hiddenTokens.splice(index, 1);
  };
  public isTokenHidden = (assetId: string) => this.hiddenTokens.includes(assetId);

  private syncTokenStatistics = async () => {
    const { notificationStore } = this.rootStore;
    const assets = TOKENS_LIST.map(({ assetId }) => assetId);
    const stats = await wavesCapService.getAssetsStats(assets).catch((e) => {
      notificationStore.notify(e.message ?? e.toString(), {
        type: "warning"
      });
      return [];
    });
    const statistics = stats.map((details) => {
      const asset = TOKENS_BY_ASSET_ID[details.id] ?? details.precision;
      const decimals = asset.decimals;
      const firstPrice = new BN(details.data?.["firstPrice_usdt-erc20-ppt"] ?? 0);
      const currentPrice = new BN(details.data?.["lastPrice_usdt-erc20-ppt"] ?? 0);

      const totalSupply = BN.formatUnits(details.totalSupply, decimals);
      const circulatingSupply = BN.formatUnits(details.circulating, decimals);

      const change24H = currentPrice.div(firstPrice).minus(1).times(100);
      const change24HUsd = change24H.div(100).times(currentPrice);

      const changePrefix = change24H?.gte(0) ? "+" : "-";
      const formatChange24HUsd = change24HUsd?.times(change24H?.gte(0) ? 1 : -1).toFormat(4);
      const formatChange24H = change24H?.times(change24H?.gte(0) ? 1 : -1).toFormat(2);
      const changeStr = `${changePrefix} $${formatChange24HUsd} (${formatChange24H}%)`;
      return {
        assetId: details.id,
        decimals,
        name: details.name,
        symbol: details.shortcode,
        totalSupply,
        circulatingSupply: BN.formatUnits(details.circulating, decimals),
        change24H,
        change24HUsd,
        currentPrice,
        changeStr,
        fullyDilutedMC: totalSupply.times(currentPrice),
        marketCap: circulatingSupply.times(currentPrice),
        totalBurned: totalSupply.minus(circulatingSupply),
        volume24: new BN(details["24h_vol_usd"])
      };
    });
    this.setStatistics(statistics);
  };

  initializedFromBackend: boolean = false;
  private setInitializedFromBackend = (v: boolean) => (this.initializedFromBackend = v);

  statisticsFromBackend: Array<TokenStatisticsFromBackend> = [];
  private setStatisticsFromBackend = (v: Array<TokenStatisticsFromBackend>) => (this.statisticsFromBackend = v);

  get statisticsFromBackendByAssetId() {
    return this.statisticsFromBackend.reduce(
      (acc, stats) => ({ ...acc, [stats.assetId]: stats }),
      {} as Record<string, TokenStatisticsFromBackend>
    );
  }

  private syncTokenStatisticsFromBackend = async () => {
    const rawStats = await tokensService.getRanges();
    const stats = rawStats.map((stat) => new TokenStatisticsFromBackend(stat));

    this.setStatisticsFromBackend(stats);
  }

  constructor(rootStore: RootStore, initState?: ISerializedTokenStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
    this.watchList = initState?.watchList ?? [];
    this.hiddenTokens = initState?.hiddenTokens ?? [];
    Promise.all([
      this.syncTokenStatistics().then(() => this.setInitialized(true)),
      this.syncTokenStatisticsFromBackend().then(() => this.setInitializedFromBackend(true)),
    ]);
    setInterval(this.syncTokenStatistics, 60 * 1000);
    setInterval(this.syncTokenStatisticsFromBackend, 60 * 1000);
  }

  serialize = (): ISerializedTokenStore => ({
    watchList: this.watchList,
    hiddenTokens: this.hiddenTokens
  });
}
