import React, { useMemo } from "react";
import { useVM } from "@src/hooks/useVM";
import { makeAutoObservable, reaction } from "mobx";
import { RootStore, useStores } from "@stores";
import Pool from "@src/entities/Pool";
import BN from "@src/utils/BN";
import poolService from "@src/services/poolsService";
import { TOKENS_BY_ASSET_ID } from "@src/constants";
import { useDebouncedCallback } from 'use-debounce';

interface IProps {
  children: React.ReactNode;
}

const ctx = React.createContext<InvestVM | null>(null);

export const InvestVMProvider: React.FC<IProps> = ({ children }) => {
  const rootStore = useStores();
  const store = useMemo(() => new InvestVM(rootStore), [rootStore]);
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useInvestVM = () => useVM(ctx);

class InvestVM {
  public rootStore: RootStore;

  debounced = useDebouncedCallback(
    (value) => {
      console.log('dev')
      this.rootStore.poolsStore.setSearchPool(value)
    },
    1000
  );

  searchValue = "";
  setSearchValue = (v: string) => {
    this.searchValue = v
    this.debounced(v)
  }

  sortApy = true;
  setSortApy = (v: boolean) => {
    this.sortApy = v
    this.rootStore.poolsStore.setFilter({
      sortBy: "apr",
      order: v ? "asc" : "desc"
    })
  }

  sortLiquidity = true;
  setSortLiquidity = (v: boolean) => {
    this.sortLiquidity = v
    this.rootStore.poolsStore.setFilter({
      sortBy: "liquidity",
      order: v ? "asc" : "desc"
    })
  }

  sortBalance = true;
  setSortBalance = (v: boolean) => (this.sortBalance = v);

  customPools: Pool[] = [];
  setCustomPools = (v: Pool[]) => (this.customPools = v);

  poolCategoryFilter: number = 0;
  setPoolCategoryFilter = (v: number) => (this.poolCategoryFilter = v);

  customPoolFilter: number = 0;
  setCustomPoolFilter = (v: number) => (this.customPoolFilter = v);


  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    this.syncCustomPools();
    makeAutoObservable(this);
  }

  syncCustomPools = async () => {
    const {pools: poolsData, totalItems} = await poolService.getPools(this.rootStore.poolsStore.paramsAllPools);
    this.rootStore.poolsStore.setTotalItems(totalItems)
    const pools = poolsData.map((p) => {
      const tokens = p.assets.map(({ asset_id, share }) => ({
        ...TOKENS_BY_ASSET_ID[asset_id],
        share,
      }));
      return new Pool({ ...p, tokens });
    });
    this.setCustomPools(pools);
  };

  get pools() {
    return this.rootStore.poolsStore.pools;
  }

  get totalInvestmentBalance(): string | null {
    console.log("starting investment calc");
    const { investedInPools } = this.rootStore.poolsStore;
    if (investedInPools == null) return null;
    const value = investedInPools?.reduce(
      (acc, v) => acc.plus(v.liquidityInUsdt),
      BN.ZERO
    );
    console.log("investment calc finished");
    return "$" + value?.toFormat(2);
  }
}
