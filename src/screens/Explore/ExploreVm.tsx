import React, { useMemo } from "react";
import { useVM } from "@src/hooks/useVM";
import { makeAutoObservable } from "mobx";
import { RootStore, useStores } from "@stores";
import Pool from "@src/entities/Pool";
import BN from "@src/utils/BN";
import poolService from "@src/services/poolsService";
import { TOKENS_BY_ASSET_ID } from "@src/constants";

const ctx = React.createContext<ExploreVM | null>(null);

export const ExploreVMProvider: React.FC = ({ children }) => {
  const rootStore = useStores();
  const store = useMemo(() => new ExploreVM(rootStore), [rootStore]);
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useExploreVM = () => useVM(ctx);

class ExploreVM {
  public rootStore: RootStore;
  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }
}
