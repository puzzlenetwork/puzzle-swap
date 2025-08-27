import { GlobalRangesInfo } from "@src/entities/Range";
import { useVM } from "@src/hooks/useVM";
import rangesService, { IGetGlobalRangesInfo } from "@src/services/rangesService";
import BN from "@src/utils/BN";
import { RootStore, useStores } from "@stores";
import { makeAutoObservable, reaction } from "mobx";
import React, { useMemo } from "react";

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
  private _setRangesInfo = (v: GlobalRangesInfo | null) => (this.rangesInfo = v);

  public loading = true;
  private _setLoading = (l: boolean) => (this.loading = l);

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    this.syncRanges().then(() => {
      this._setLoading(false);
    });
    this.syncFiltersWithRangesStore();

    reaction(
      () => this.rootStore.accountStore.address,
      () => this.rootStore.rangesStore.syncUserInvestedAmount(),
    )

    reaction(
      () => this.rootStore.rangesStore.userInvestedAmount,
      (val) => {
        this.userInvestedAmount = val;
      },
      { fireImmediately: true }
    );

    makeAutoObservable(this);
  }

  searchValue: string = "";
  setSearchValue = (v: string) => {
    this._setLoading(true);
    this.searchValue = v;
    this.rootStore.rangesStore.setSearchValue(v).then(() => {
      this.rootStore.rangesStore.setPagination({ page: 1, size: this.rootStore.rangesStore.pagination.size }).then(() => {
        this._setLoading(false);
      });
    });
  };

  rangesSortings = [
    { title: "Fact Liquidity ↓", key: "fact_liquidityD" },
    { title: "Fact Liquidity ↑", key: "fact_liquidityA" },
    { title: "Virtual Liquidity ↓", key: "virtual_liquidityD" },
    { title: "Virtual Liquidity ↑", key: "virtual_liquidityA" },
    { title: "Earned ↓", key: "earnedD" },
    { title: "Earned ↑", key: "earnedA" }
  ];
  rangesSorting: number = 0;
  setRangesSorting = (v: number) => {
    this._setLoading(true);
    this.rangesSorting = v;
    this.rootStore.rangesStore.setFilter({
      sortBy: this.rangesSortings[v].key.slice(0, -1) as "fact_liquidity" | "earned" | "virtual_liquidity",
      order: (this.rangesSortings[v].key.slice(-1) === "A" ? "asc" : "desc") as "asc" | "desc"
    }).then(() => {
      this.rootStore.rangesStore.setPagination({ page: 1, size: this.rootStore.rangesStore.pagination.size }).then(() => {
        this._setLoading(false);
      });
    });
  };

  statsRanges = [
    { title: "Stats All Time", key: "all" },
    { title: "Stats Last Day", key: "1d" },
    { title: "Stats Last Week", key: "7d" },
    { title: "Stats Last Month", key: "30d" },
    { title: "Stats Last 3 Months", key: "90d" },
    { title: "Stats Last Year", key: "1y" }
  ];
  selectedStatsRange: number = 0;
  setSelectedStatsRange = (v: number) => {
    this.selectedStatsRange = v;
    this.rootStore.rangesStore.setTimeRange(this.statsRanges[v].key as "all" | "1d" | "7d" | "30d" | "90d" | "1y");
  };

  showPriceInUsd: boolean = false;
  setShowPriceInUsd = (v: boolean) => {
    this.showPriceInUsd = v;
    this.rootStore.rangesStore.setShowPriceInUsd(v);
  };

  showOnlyActiveRanges: boolean = false;
  setShowOnlyActiveRanges = (v: boolean) => {
    this._setLoading(true);
    this.showOnlyActiveRanges = v;
    this.rootStore.rangesStore.setOnlyActiveRanges(v ? true : undefined).then(() => {
      this.rootStore.rangesStore.setPagination({ page: 1, size: this.rootStore.rangesStore.pagination.size }).then(() => {
        this._setLoading(false);
      });
    });
  };

  showOnlyUserRanges: boolean = false;
  setShowOnlyUserRanges = (v: boolean) => {
    this.showOnlyUserRanges = v;
    console.log("Setting showOnlyUserRanges to:", v);
    this._setLoading(true);
    this.handleShowOnlyUserRangesChange(v).then(() => {
      this._setLoading(false);
    });
  };
  handleShowOnlyUserRangesChange = async (v: boolean) => {
    console.log("Handling showOnlyUserRangesChange:", v);
    return Promise.all([
      (async () => {
        console.log("In async function for handleShowOnlyUserRangesChange, v =", v);
        if (v) {
          const { address } = this.rootStore.accountStore;
          await this.rootStore.rangesStore.setUserAddress(address ?? undefined);
          await this.rootStore.rangesStore.setMinLiquidity(address ? 0 : 1);
        } else {
          await this.rootStore.rangesStore.setUserAddress(undefined);
        }
      })(),
      this.syncRanges({ userAddress: v ? (this.rootStore.accountStore.address ?? undefined) : undefined }),
    ]);
  }

  userInvestedAmount: BN | null = null;

  syncFiltersWithRangesStore = () => {
    const rangesStore = this.rootStore.rangesStore;
    this.searchValue = rangesStore.searchValue;
    this.rangesSorting =
      this.rangesSortings.findIndex(
        ({ key }) => key === `${rangesStore.filter.sortBy}${rangesStore.filter.order === "asc" ? "A" : "D"}`
      ) ?? 0;
    this.selectedStatsRange = this.statsRanges.findIndex(({ key }) => key === rangesStore.timeRange) ?? 0;
    this.showOnlyActiveRanges = !!rangesStore.onlyActiveRanges;
    this.showOnlyUserRanges = !!rangesStore.userAddress;
    this.showPriceInUsd = rangesStore.showPriceInUsd;
  };

  syncRanges = async (params?: Partial<IGetGlobalRangesInfo>) => {
    this._setRangesInfo(null);
    rangesService.getGlobalRangesInfo({
      minLiquidity: this.rootStore.rangesStore.minLiquidity,
      userAddress: this.rootStore.rangesStore.userAddress,
      ...params
    }).then((data) => {
      const newRangesInfo = new GlobalRangesInfo(data);
      this._setRangesInfo(newRangesInfo);
    });
  };
}
