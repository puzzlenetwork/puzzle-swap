import React, { useMemo } from "react";
import { useVM } from "@src/hooks/useVM";
import { makeAutoObservable, reaction } from "mobx";
import { RootStore, useStores } from "@stores";
import axios from "axios";
import dayjs, { Dayjs } from "dayjs";
import BN from "@src/utils/BN";
import wavesCapService from "@src/services/wavesCapService";
import { TOKENS_LIST } from "@src/constants";

const ctx = React.createContext<ExploreVM | null>(null);

export const ExploreVMProvider: React.FC = ({ children }) => {
  const rootStore = useStores();
  const store = useMemo(() => new ExploreVM(rootStore), [rootStore]);
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useExploreVM = () => useVM(ctx);

type TChartData = {
  start: Dayjs;
  end: Dayjs;
  data: Array<[number, number]>;
};

export type TChartDataRecord = {
  "1d"?: TChartData;
  "1w"?: TChartData;
  "1m"?: TChartData;
  "3m"?: TChartData;
  "1y"?: TChartData;
  all?: TChartData;
};

export type TTokenDetails = {
  totalSupply: BN;
  circulatingSupply: BN;
  fullyDilutedMC: BN;
  marketCap: BN;
  currentPrice: BN;
  change24H: BN;
};
class ExploreVM {
  assetId = "HEB8Qaw9xrWpWs8tHsiATYGBWDBtP2S7kcPALrMu43AS";

  get asset() {
    return TOKENS_LIST.find(({ assetId }) => assetId === this.assetId);
  }

  chartLoading = true;
  setChartLoading = (v: boolean) => (this.chartLoading = v);

  tokenDetails: Partial<TTokenDetails> = {};
  setTokenDetails = (v: Partial<TTokenDetails>) => (this.tokenDetails = v);

  selectedChartPeriod: keyof TChartDataRecord = "1d";
  setSelectedChartPeriod = (v: keyof TChartDataRecord) =>
    (this.selectedChartPeriod = v);
  chartData: TChartDataRecord = {};
  setChartData = (period: keyof TChartDataRecord, value: TChartData) =>
    (this.chartData = { ...this.chartData, [period]: value });

  get chart() {
    const { start, end, data } = this.chartData[this.selectedChartPeriod] ?? {};
    if (start == null || data == null || end == null) return [];
    const step = +(
      end.diff(dayjs(start), "milliseconds") / data.length
    ).toFixed(0);
    return data.map(([volume], i) => ({
      volume,
      date: start.add(step * i, "milliseconds").toISOString(),
    }));
  }

  public rootStore: RootStore;
  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
    this.syncChart();
    this.syncTokenDetails();
    reaction(() => this.selectedChartPeriod, this.syncChart);
  }

  syncTokenDetails = async () => {
    const assetDetails = await wavesCapService.getAssetStats(this.assetId);

    const decimals = this.asset?.decimals;
    const firstPrice = new BN(assetDetails.data?.["firstPrice_usd-n"] ?? 0);
    const lastPrice = new BN(assetDetails.data?.["lastPrice_usd-n"] ?? 0);
    this.setTokenDetails({
      totalSupply: BN.formatUnits(assetDetails.totalSupply, decimals),
      circulatingSupply: BN.formatUnits(assetDetails.circulating, decimals),
      change24H: lastPrice.div(firstPrice).minus(1).times(100),
      currentPrice: lastPrice,
    });
  };

  get low24H() {
    const min = Math.min(...this.chart.map(({ volume }) => volume));
    return new BN(min);
  }

  get high24H() {
    const max = Math.max(...this.chart.map(({ volume }) => volume));
    return new BN(max);
  }

  syncChart = async () => {
    if (this.chartData[this.selectedChartPeriod] != null) return;
    this.setChartLoading(true);
    const req = `https://wavescap.com/api/chart/asset/${this.assetId}-usd-n-${this.selectedChartPeriod}.json`;
    const { data } = await axios.get(req);
    this.setChartData(this.selectedChartPeriod, {
      ...data,
      start: dayjs(data.start),
      end: dayjs(),
    });
    this.setChartLoading(false);
  };
}
