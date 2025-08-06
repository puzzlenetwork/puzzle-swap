import React, { useMemo } from "react";
import { useVM } from "@src/hooks/useVM";
import { makeAutoObservable, when } from "mobx";
import { RangesStore, RootStore, useStores } from "@stores";
import rangesService from "@src/services/rangesService";
import { GlobalRangesInfo } from "@src/entities/Range";
import BN from "@src/utils/BN";
import { address } from "@waves/ts-lib-crypto";

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

  public rangesInfo: GlobalRangesInfo | null = null;
  private _setRangesInfo = (v: GlobalRangesInfo) => (this.rangesInfo = v);

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    this.syncRanges();
    this.syncFiltersWithRangesStore();
    when(
      () => this.rootStore.accountStore.address !== null,
      () => this.syncUserInvestedAmount(),
    );
    makeAutoObservable(this);
  }

  searchValue: string = "";
  setSearchValue = (v: string) => {
    this.searchValue = v;
    this.rootStore.rangesStore.setSearchValue(v);
  };

  rangesSortings = [
    { title: "Fact Liquidity ↓", key: "fact_liquidityD" },
    { title: "Fact Liquidity ↑", key: "fact_liquidityA" },
    { title: "Virtual Liquidity ↓", key: "virtual_liquidityD" },
    { title: "Virtual Liquidity ↑", key: "virtual_liquidityA" },
    { title: "Earned ↓", key: "earnedD" },
    { title: "Earned ↑", key: "earnedA" },
  ];
  rangesSorting: number = 0;
  setRangesSorting = (v: number) => {
    this.rangesSorting = v;
    this.rootStore.rangesStore.setFilter({
      sortBy: this.rangesSortings[v].key.slice(0, -1) as "fact_liquidity" | "earned" | "virtual_liquidity",
      order: (this.rangesSortings[v].key.slice(-1) === "A" ? "asc" : "desc") as "asc" | "desc",
    });
  };

  statsRanges = [
    { title: "Stats All Time", key: "all" },
    { title: "Stats Last Day", key: "1d" },
    { title: "Stats Last Week", key: "7d" },
    { title: "Stats Last Month", key: "30d" },
    { title: "Stats Last 3 Months", key: "90d" },
    { title: "Stats Last Year", key: "1y" },
  ]
  selectedStatsRange: number = 0;
  setSelectedStatsRange = (v: number) => {
    this.selectedStatsRange = v;
    this.rootStore.rangesStore.setTimeRange(this.statsRanges[v].key as "all" | "1d" | "7d" | "30d" | "90d" | "1y");
  }

  showPriceInUsd: boolean = false;
  setShowPriceInUsd = (v: boolean) => {
    this.showPriceInUsd = v
    this.rootStore.rangesStore.setShowPriceInUsd(v);
  };

  showOnlyActiveRanges: boolean = false;
  setShowOnlyActiveRanges = (v: boolean) => {
    this.showOnlyActiveRanges = v;
    this.rootStore.rangesStore.setOnlyActiveRanges(v ? true : undefined);
  };

  showOnlyUserRanges: boolean = false;
  setShowOnlyUserRanges = (v: boolean) => {
    this.showOnlyUserRanges = v;
    if (v) {
      const { address } = this.rootStore.accountStore;
      this.rootStore.rangesStore.setUserAddress(address ?? undefined);
    } else {
      this.rootStore.rangesStore.setUserAddress(undefined);
    }
  }

  userInvestedAmount: BN | null = null;
  setUserInvestedAmount = (v: number) => (this.userInvestedAmount = new BN(v));

  syncFiltersWithRangesStore = () => {
    const rangesStore = this.rootStore.rangesStore;
    this.searchValue = rangesStore.searchValue;
    this.rangesSorting = this.rangesSortings.findIndex(({ key }) => key === `${rangesStore.filter.sortBy}${rangesStore.filter.order === "asc" ? "A" : "D"}`) ?? 0;
    this.selectedStatsRange = this.statsRanges.findIndex(({ key }) => key === rangesStore.timeRange) ?? 0;
    this.showOnlyActiveRanges = !!rangesStore.onlyActiveRanges;
    this.showOnlyUserRanges = !!rangesStore.userAddress;
    this.showPriceInUsd = rangesStore.showPriceInUsd;
  }

  syncUserInvestedAmount = async () => {
    const { address } = this.rootStore.accountStore;
    if (!address) return;
    rangesService.getUserTotalProvided(address).then((amount) => {
      this.setUserInvestedAmount(amount);
    });
  };

  syncRanges = async () => {
    rangesService.getGlobalRangesInfo().then((data) => {
      const newRangesInfo = new GlobalRangesInfo(data);
      this._setRangesInfo(newRangesInfo);
    })
  };
}
