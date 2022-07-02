import React, { useMemo } from "react";
import { useVM } from "@src/hooks/useVM";
import { autorun, makeAutoObservable, reaction } from "mobx";
import { RootStore, useStores } from "@stores";
import axios from "axios";
import dayjs, { Dayjs } from "dayjs";
import BN from "@src/utils/BN";
import { TOKENS_BY_SYMBOL, TOKENS_LIST } from "@src/constants";
import transactionsService from "@src/services/transactionsService";

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

class ExploreVM {
  assetId: string;
  setAssetId = (assetId: string) => (this.assetId = assetId);

  get asset() {
    return TOKENS_LIST.find(({ assetId }) => assetId === this.assetId);
  }

  get assetWithStats() {
    return TOKENS_LIST.find(({ assetId }) => assetId === this.assetId);
  }

  loading = true;
  setLoading = (v: boolean) => (this.loading = v);

  chartLoading = true;
  setChartLoading = (v: boolean) => (this.chartLoading = v);

  aggregatorTradesHistory: any[] = [];
  setAggregatorTradesHistory = (v: any[]) => (this.aggregatorTradesHistory = v);

  aggregatorTradesHistorySkip = 0;
  setAggregatorTradesHistorySkip = (v: number) =>
    (this.aggregatorTradesHistorySkip = v);

  megaPolsInvestHistory: any[] = [];
  setMegaPoolsInvestHistory = (v: any[]) => (this.megaPolsInvestHistory = v);

  tokenNameFilter: string = "";
  setTokenNameFilter = (v: string) => (this.tokenNameFilter = v);

  tokenCategoryFilter: number = 0;
  setTokenCategoryFilter = (v: number) => (this.tokenCategoryFilter = v);

  tokenUserFilter: number = 0;
  setUserFilter = (v: number) => (this.tokenUserFilter = v);

  megaPolsInvestHistorySkip = 0;
  setMegaPoolsInvestHistorySkip = (v: number) =>
    (this.aggregatorTradesHistorySkip = v);

  get tokenDetails() {
    return this.rootStore.tokenStore.statisticsByAssetId[this.assetId] ?? {};
  }

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
    autorun(() => {
      console.log(window.location.search);
    });
    const search = new URLSearchParams(window.location.search);
    this.assetId = search.get("assetId") ?? TOKENS_BY_SYMBOL.PUZZLE.assetId;

    Promise.all([
      this.syncChart(),
      this.syncAggregatorTradesHistory(),
      this.syncMegaPolsInvestHistory(),
    ]).then();
    reaction(() => this.selectedChartPeriod, this.syncChart);
  }

  syncAggregatorTradesHistory = async () => {
    this.setLoading(true);
    const txs = await transactionsService.getTransactions([
      ["func", "swap"],
      ["func", "swapWithReferral"],
      ["aggregator", true],
      ["after", this.aggregatorTradesHistorySkip],
    ]);
    this.setAggregatorTradesHistorySkip(this.aggregatorTradesHistorySkip + 5);
    this.setAggregatorTradesHistory([
      ...this.aggregatorTradesHistory,
      ...txs,
    ] as any[]);
    this.setLoading(false);
  };
  syncMegaPolsInvestHistory = async () => {
    this.setLoading(true);
    const txs = await transactionsService.getTransactions([
      ["func", "unstakeAndRedeemIndex"],
      ["func", "generateIndexAndStake"],
      ["func", "generateIndexWithOneTokenAndStake"],
      ["after", this.megaPolsInvestHistorySkip],
    ]);
    this.setMegaPoolsInvestHistorySkip(this.megaPolsInvestHistorySkip + 5);
    this.setMegaPoolsInvestHistory([
      ...this.megaPolsInvestHistory,
      ...txs,
    ] as any[]);
    this.setLoading(false);
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
    console.log(this.assetId);
    const req = `https://wavescap.com/api/chart/asset/${this.assetId}-usd-n-${this.selectedChartPeriod}.json`;
    const { data } = await axios.get(req);
    this.setChartData(this.selectedChartPeriod, {
      ...data,
      start: dayjs(data.start),
      end: dayjs(),
    });
    this.setChartLoading(false);
  };
  //----------------------------------------------------------------------------------------
  //----------------------------------------------------------------------------------------
  get top3Gainers() {
    return this.rootStore.tokenStore.statistics
      .slice()
      .sort((a, b) => (a.change24H.gt(b.change24H) ? -1 : 1))
      .slice(0, 3);
  }

  get top3Losers() {
    return this.rootStore.tokenStore.statistics
      .slice()
      .sort((a, b) => (a.change24H.gt(b.change24H) ? 1 : -1))
      .slice(0, 3);
  }
}
