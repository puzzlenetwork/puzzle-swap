import { RootStore } from "./index";
import { makeAutoObservable, reaction } from "mobx";
import rangesService, { IProvidedAssetResponse, IProvidedResponse } from "@src/services/rangesService";
import { Range } from "@src/entities/Range";
import BN from "@src/utils/BN";

const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export class IProvidedAsset {
  assetId: string;
  name: string;
  leverage: BN;
  earnedAmount: BN;
  earnedAmountUsd: BN;
  providedAmount: BN;
  providedAmountUsd: BN;

  constructor(params: IProvidedAssetResponse) {
    this.assetId = params.asset_id;
    this.name = params.name;
    this.leverage = new BN(params.leverage);
    this.earnedAmount = new BN(params.earned_amount);
    this.earnedAmountUsd = new BN(params.earned_amount_usd);
    this.providedAmount = new BN(params.provided_amount);
    this.providedAmountUsd = new BN(params.provided_amount_usd);
  }
}

export class ProvidedData {
  providerAddress: string;
  poolAddress: string;
  poolMode: string;
  indexStaked: BN;
  share: BN;
  providedUsd: BN;
  claimedUsd: BN;
  unclaimedUsd: BN;
  lpTokenId?: string;
  lpTokenPrice: BN;
  lpTokenMarketPrice: BN;
  lpTokenName?: string;
  lpTokenDomain: string;
  assetsData: IProvidedAsset[];

  constructor(params: IProvidedResponse) {
    this.providerAddress = params.provider_address;
    this.poolAddress = params.pool_address;
    this.poolMode = params.pool_mode;
    this.indexStaked = new BN(params.index_staked);
    this.share = new BN(params.share);
    this.providedUsd = new BN(params.provided_usd);
    this.claimedUsd = new BN(params.claimed_usd);
    this.unclaimedUsd = new BN(params.unclaimed_usd);
    this.lpTokenId = params.lp_token_id;
    this.lpTokenPrice = new BN(params.lp_token_price);
    this.lpTokenMarketPrice = new BN(params.lp_token_market_price);
    this.lpTokenName = params.lp_token_name;
    this.lpTokenDomain = params.lp_token_domain;
    this.assetsData = params.assets_data.map((item) => new IProvidedAsset(item));
  }
}

export default class RangesStore {
  rangesPaginationSize = 10;
  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
    this.syncRanges();
    this.syncInvestments();
    this.syncUserInvestedAmount();

    reaction(
      () => [this.rootStore.accountStore.address, this.rootStore.accountStore.smartAccountAddress],
      () => {
        this.userAddress = undefined;
        this.syncRanges();
        this.syncInvestments();
        this.syncUserInvestedAmount();
      }
    )
    // Re-sync invested amount when balances change (e.g. after deposit/withdraw)
    reaction(
      () => [this.rootStore.accountStore.effectiveAddress, this.rootStore.accountStore.assetBalances],
      this.debouncedSyncUserInvestedAmount
    );
  }

  public rootStore: RootStore;

  allRanges: Range[] = [];
  updateInAllRanges = (range: Range) => {
    const index = this.allRanges.findIndex((r) => r.address === range.address);
    if (index !== -1) {
      this.allRanges[index] = range;
    } else {
      this.allRanges.push(range);
    }
  };

  // Ranges data
  ranges: Range[] = [];
  setRanges = (ranges: Range[]) => {
    this.ranges = ranges;
    ranges.forEach((range) => this.updateInAllRanges(range));
  };
  updateRange = (range: Range) => {
    const index = this.ranges.findIndex((r) => r.address === range.address);
    if (index !== -1) {
      this.ranges[index] = range;
    } else {
      this.ranges.push(range);
    }
    this.updateInAllRanges(range);
  };
  getRangeByAddress = (address: string) => this.allRanges.find((range) => range.address === address);
  getRangeByDomain = (domain: string) => {
    const input = domain?.trim();
    if (!input) return undefined;

    const normalize = (v: string) => v.trim().toLowerCase();
    const variants = new Set<string>();
    variants.add(normalize(input));
    variants.add(normalize(input.replace(/-/g, ' ')));
    variants.add(normalize(input.replace(/\s+/g, '-')));
    return this.allRanges.find((range) => {
      const d = normalize(range.domain);
      if (variants.has(d)) return true;
      // Be lenient: treat last hyphen as a space for cases like "AAA-BBB CCC"
      const lastHyphenAsSpace = normalize(d.replace(/-([^\-]+)$/,' $1'));
      return variants.has(lastHyphenAsSpace);
    });
  };

  loading: boolean = false;
  setLoading = (loading: boolean) => (this.loading = loading);

  investmentsLoading: boolean = false;
  setInvestmentsLoading = (loading: boolean) => (this.investmentsLoading = loading);

  userInvestedAmountLoading: boolean = false;
  setUserInvestedAmountLoading = (loading: boolean) => (this.userInvestedAmountLoading = loading);

  debouncedSyncUserInvestedAmount = debounce(() => {
    this.syncUserInvestedAmount();
  }, 2000);

  // Pagination state
  pagination = {
    page: 1,
    size: this.rangesPaginationSize
  };

  // Total number of ranges
  totalItems = 0;

  // Filter state
  filter = RangesStore.loadSorting();

  // Time range to show statistics
  timeRange = "30d" as "all" | "1d" | "7d" | "30d" | "90d" | "1y";

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
  setFilter = async (filter: { sortBy: "fact_liquidity" | "earned" | "virtual_liquidity" | "apr"; order: "asc" | "desc" }) => {
    this.filter = filter;
    RangesStore.saveSorting(filter);
    await this.syncRanges();
  };

  private static readonly SORTING_KEY = "puzzle-ranges-sorting";

  private static loadSorting(): { sortBy: "fact_liquidity" | "earned" | "virtual_liquidity" | "apr"; order: "asc" | "desc" } {
    try {
      const raw = localStorage.getItem(RangesStore.SORTING_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.sortBy && parsed.order) return parsed;
      }
    } catch {}
    return { sortBy: "apr", order: "desc" };
  }

  private static saveSorting(filter: { sortBy: string; order: string }) {
    localStorage.setItem(RangesStore.SORTING_KEY, JSON.stringify(filter));
  }

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

  investmentsData: ProvidedData[] = [];
  setInvestmentsData = (data: ProvidedData[]) => (this.investmentsData = data);
  syncInvestments = async () => {
    const { address, effectiveAddress } = this.rootStore.accountStore;
    if (!address) {
      this.setInvestmentsData([]);
      return;
    }
    const targetAddress = effectiveAddress ?? address;
    if (this.investmentsLoading) return;
    try {
      this.setInvestmentsLoading(true);
      const data = await rangesService.getUserInvestments(targetAddress);
      this.setInvestmentsData(data.map((item) => new ProvidedData(item)));
    } catch (error) {
      console.error("Error fetching investments:", error);
    } finally {
      this.setInvestmentsLoading(false);
    }
  };

  // --- User total invested amount (USD) ---
  userInvestedAmount: BN | null = null;
  setUserInvestedAmount = (v: number) => {
    this.userInvestedAmount = new BN(v);
  };
  syncUserInvestedAmount = async () => {
    const { address, effectiveAddress } = this.rootStore.accountStore;
    if (!address) {
      this.userInvestedAmount = null;
      return;
    }
    const targetAddress = effectiveAddress ?? address;
    if (this.userInvestedAmountLoading) return;
    try {
      this.setUserInvestedAmountLoading(true);
      const amount = await rangesService.getUserTotalProvided(targetAddress);
      this.setUserInvestedAmount(amount);
    } catch (error) {
      console.error("Error fetching user invested amount:", error);
    } finally {
      this.setUserInvestedAmountLoading(false);
    }
  };
}
