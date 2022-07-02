import React, { useMemo } from "react";
import { useVM } from "@src/hooks/useVM";
import { makeAutoObservable, reaction } from "mobx";
import { RootStore, useStores } from "@stores";
import { TOKEN_DETAILS_BY_SYMBOL, TOKENS_BY_ASSET_ID } from "@src/constants";
import dayjs, { Dayjs } from "dayjs";
import axios from "axios";

const ctx = React.createContext<ExploreTokenVM | null>(null);

export const ExploreTokenVMProvider: React.FC<{ assetId: string }> = ({
  assetId,
  children,
}) => {
  const rootStore = useStores();
  const store = useMemo(
    () => new ExploreTokenVM(rootStore, assetId),
    [assetId, rootStore]
  );
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useExploreTokenVM = () => useVM(ctx);

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

class ExploreTokenVM {
  public rootStore: RootStore;
  private readonly assetId: string;

  loading = true;
  setLoading = (v: boolean) => (this.loading = v);

  chartLoading = true;
  setChartLoading = (v: boolean) => (this.chartLoading = v);

  get asset() {
    return TOKENS_BY_ASSET_ID[this.assetId];
  }

  get about() {
    return TOKEN_DETAILS_BY_SYMBOL[this.asset.symbol];
  }

  get statistics() {
    return this.rootStore.tokenStore.statisticsByAssetId[this.assetId];
  }

  selectedChartPeriod: keyof TChartDataRecord = "1d";
  setSelectedChartPeriod = (v: string) =>
    (this.selectedChartPeriod = v as keyof TChartDataRecord);

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

  syncChart = async () => {
    console.log("ok");
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

  constructor(rootStore: RootStore, assetId: string) {
    this.rootStore = rootStore;
    this.assetId = assetId;
    makeAutoObservable(this);
    this.syncChart();
    reaction(() => this.selectedChartPeriod, this.syncChart);
  }
}
