import React, { useMemo } from "react";
import { useVM } from "@src/hooks/useVM";
import { makeAutoObservable } from "mobx";
import { RootStore, useStores } from "@stores";
import { TOKENS_BY_ASSET_ID } from "@src/constants";

const ctx = React.createContext<ExploreTokenVM | null>(null);

export const ExploreTokenVMProvider: React.FC<{ assetId: string }> = ({
  assetId,
  children,
}) => {
  const rootStore = useStores();
  const store = useMemo(
    () => new ExploreTokenVM(rootStore, assetId),
    [assetId, rootStore]
  );
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useExploreTokenVM = () => useVM(ctx);

class ExploreTokenVM {
  public rootStore: RootStore;
  private readonly assetId: string;

  get asset() {
    return TOKENS_BY_ASSET_ID[this.assetId];
  }

  constructor(rootStore: RootStore, assetId: string) {
    this.rootStore = rootStore;
    this.assetId = assetId;
    makeAutoObservable(this);
  }
}
