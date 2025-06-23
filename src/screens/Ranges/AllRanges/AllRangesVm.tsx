import React, { useMemo } from "react";
import { useVM } from "@src/hooks/useVM";
import { makeAutoObservable } from "mobx";
import { RootStore, useStores } from "@stores";
import rangesService from "@src/services/rangesService";
import { GlobalRangesInfo } from "@src/entities/Range";

interface IProps {
  children: React.ReactNode;
}

const ctx = React.createContext<AllRangesVm | null>(null);

export const AllRangesProvider: React.FC<IProps> = ({ children }) => {
  const rootStore = useStores();
  const store = useMemo(() => new AllRangesVm(rootStore), [rootStore]);
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useAllRangesVm = () => useVM(ctx);

class AllRangesVm {
  public rootStore: RootStore;

  rangeCategoryFilter: number = 0;
  setRangeCategoryFilter = (v: number) => (this.rangeCategoryFilter = v);

  public rangesInfo: GlobalRangesInfo | null = null;
  private _setRangesInfo = (v: GlobalRangesInfo) => (this.rangesInfo = v);

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    this.syncRanges();
    makeAutoObservable(this);
  }

  searchValue: string = "";
  setSearchValue = (v: string) => (this.searchValue = v);

  rangesSortings = [
    { title: "Fact Liquidity ↑", key: "factLiqAsc" },
    { title: "Fact Liquidity ↓", key: "factLiqDesc" },
    { title: "Virtual Liquidity ↑", key: "virtLiqAsc" },
    { title: "Virtual Liquidity ↓", key: "virtLiqDesc" },
    { title: "Earned ↑", key: "earnedAsc" },
    { title: "Earned ↓", key: "earnedDesc" },
  ];
  rangesSorting: number = 0;
  setRangesSorting = (v: number) => (this.rangesSorting = v);

  statsRanges = [
    { title: "Stats All Time", key: "all" },
    { title: "Stats Last Day", key: "1d" },
    { title: "Stats Last Week", key: "7d" },
    { title: "Stats Last Month", key: "1m" },
    { title: "Stats Last 3 Months", key: "3m" },
    { title: "Stats Last Year", key: "1y" },
  ]
  selectedStatsRange: number = 0;
  setSelectedStatsRange = (v: number) => {
    this.selectedStatsRange = v;
  }

  syncRanges = async () => {
    rangesService.getGlobalRangesInfo().then((data) => {
      const newRangesInfo = new GlobalRangesInfo(data);
      this._setRangesInfo(newRangesInfo);
    })
  };
}
