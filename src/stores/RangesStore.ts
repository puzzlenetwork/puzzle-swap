import { RootStore } from "./index";
import { makeAutoObservable } from "mobx";
import rangesService from "@src/services/rangesService";
import { Range } from "@src/entities/Range";

export default class RangesStore {
  constructor(rootStore: RootStore) {
    console.log("constructor of ranges tore");
    this.rootStore = rootStore;
    makeAutoObservable(this);
    this.syncRanges();
  }

  public rootStore: RootStore;

  // Ranges data
  ranges: Range[] = [];
  setRanges = (ranges: Range[]) => (this.ranges = ranges);
  getRangeByAddress = (address: string) => this.ranges.find((range) => range.address === address);

  loading: boolean = false;

  // Pagination state
  pagination = {
    page: 1,
    size: 10,
  };

  // Total number of ranges
  totalItems = 0;

  // Filter state
  filter = {
    sortBy: "liquidity" as "liquidity" | "earned" | "virtualLiquidity",
    order: "desc" as "asc" | "desc",
  };

  // Search value
  searchValue = "";

  // Methods for pagination
  setPagination = (pagination: { page: number; size: number }) => {
    this.pagination = pagination;
    this.syncRanges();
  };

  setTotalItems = (items: number) => {
    this.totalItems = items;
  };

  // Methods for filtering
  setFilter = (filter: {
    sortBy: "liquidity" | "earned" | "virtualLiquidity";
    order: "asc" | "desc";
  }) => {
    this.filter = filter;
    this.syncRanges();
  };

  setSearchValue = (value: string) => {
    this.searchValue = value;
    this.syncRanges();
  };

  // Get pagination parameters for API calls
  get paginationParams() {
    return {
      page: this.pagination.page,
      size: this.pagination.size,
      sortBy: this.filter.sortBy,
      order: this.filter.order,
      search: this.searchValue,
    };
  }

  // Sync ranges from API
  syncRanges = async () => {
    try {
      this.loading = true;
      console.log("syncRanges");
      const { ranges, totalItems } = await rangesService.getRanges(this.paginationParams);
      console.log("ranges", ranges);
      this.ranges = ranges.map((range) => new Range(range));
      this.setTotalItems(totalItems);
    } catch (error) {
      console.error("Error fetching ranges:", error);
    } finally {
      this.loading = false;
    }
  };
}
