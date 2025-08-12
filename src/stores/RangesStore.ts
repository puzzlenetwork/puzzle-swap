import { RootStore } from "./index";
import { makeAutoObservable } from "mobx";
import rangesService from "@src/services/rangesService";
import { Range } from "@src/entities/Range";

export default class RangesStore {
  rangesPaginationSize = 10;
  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
    this.syncRanges();
  }

  public rootStore: RootStore;

  // Ranges data
  ranges: Range[] = [];
  setRanges = (ranges: Range[]) => (this.ranges = ranges);
  updateRange = (range: Range) => {
    const index = this.ranges.findIndex((r) => r.address === range.address);
    if (index !== -1) {
      this.ranges[index] = range;
    } else {
      this.ranges.push(range);
    }
  };
  getRangeByAddress = (address: string) => this.ranges.find((range) => range.address === address);

  loading: boolean = false;
  setLoading = (loading: boolean) => (this.loading = loading);

  // Pagination state
  pagination = {
    page: 1,
    size: this.rangesPaginationSize
  };

  // Total number of ranges
  totalItems = 0;

  // Filter state
  filter = {
    sortBy: "fact_liquidity" as "fact_liquidity" | "earned" | "virtual_liquidity",
    order: "desc" as "asc" | "desc"
  };

  // Time range to show statistics
  timeRange = "all" as "all" | "1d" | "7d" | "30d" | "90d" | "1y";

  minLiquidity = 1;

  onlyActiveRanges: boolean | undefined = undefined;

  // Search value
  searchValue = "";

  // If specified, filters ranges by user address (show only ones, with investments)
  userAddress?: string = undefined;

  showPriceInUsd: boolean = false;
  setShowPriceInUsd = (v: boolean) => (this.showPriceInUsd = v);

  // Methods for pagination
  setPagination = async (pagination: { page: number; size: number }) => {
    this.pagination = pagination;
    await this.syncRanges();
  };

  setTotalItems = (items: number) => {
    this.totalItems = items;
  };

  // Methods for filtering
  setFilter = async (filter: { sortBy: "fact_liquidity" | "earned" | "virtual_liquidity"; order: "asc" | "desc" }) => {
    this.filter = filter;
    await this.syncRanges();
  };

  setTimeRange = async (timeRange: "all" | "1d" | "7d" | "30d" | "90d" | "1y") => {
    this.timeRange = timeRange;
    await this.syncRanges();
  };

  setMinLiquidity = async (minLiquidity: number) => {
    this.minLiquidity = minLiquidity;
    await this.syncRanges();
  };

  setOnlyActiveRanges = async (onlyActive: boolean | undefined) => {
    this.onlyActiveRanges = onlyActive;
    await this.syncRanges();
  };

  setSearchValue = async (value: string) => {
    this.searchValue = value;
    await this.syncRanges();
  };

  setUserAddress = async (value?: string) => {
    this.userAddress = value;
    await this.syncRanges();
  };

  // Get pagination parameters for API calls
  get paginationParams() {
    return {
      page: this.pagination.page,
      size: this.pagination.size,
      sortBy: this.filter.sortBy,
      order: this.filter.order,
      timeRange: this.timeRange,
      title: this.searchValue,
      minLiquidity: this.minLiquidity,
      active: this.onlyActiveRanges,
      userAddress: this.userAddress
    };
  }

  // Sync ranges from API
  syncRanges = async () => {
    try {
      this.setLoading(true);
      const { ranges, totalItems } = await rangesService.getRanges(this.paginationParams);
      this.setRanges(ranges.map((range) => new Range(range)));
      this.setTotalItems(totalItems);
    } catch (error) {
      console.error("Error fetching ranges:", error);
    } finally {
      this.setLoading(false);
    }
  };
}
