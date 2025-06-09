import React, { useMemo } from "react";
import { useVM } from "@src/hooks/useVM";
import { makeAutoObservable } from "mobx";
import { RootStore, useStores } from "@stores";

interface IProps {
  children: React.ReactNode;
}

const ctx = React.createContext<AllRangesVm | null>(null);

export const AllRangesProvider: React.FC<IProps> = ({ children }) => {
  const rootStore = useStores();
  const store = useMemo(() => new AllRangesVm(rootStore), [rootStore]);
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useAllRanges = () => useVM(ctx);

class AllRangesVm {
  public rootStore: RootStore;

  rangeCategoryFilter: number = 0;
  setRangeCategoryFilter = (v: number) => (this.rangeCategoryFilter = v);

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    this.syncRanges();
    makeAutoObservable(this);
  }

  rangesFilters = [
    { title: "Fact liquidity", key: "factLiqAsc" },
    { title: "Fact liquidity", key: "factLiqDesc" },
    { title: "Virtual liquidity", key: "virtLiqAsc" },
    { title: "Virtual liquidity", key: "virtLiqDesc" },
    { title: "Earned", key: "earnedAsc" },
    { title: "Earned", key: "earnedDesc" },
  ];
  rangesFilter: number = 0;
  setRangesFilter = (v: number) => (this.rangesFilter = v);

  syncRanges = async () => {};
}
