import React, { useMemo } from "react";
import { makeAutoObservable } from "mobx";
import { RootStore, useStores } from "@stores";
import { useVM } from "@src/hooks/useVM";

const ctx = React.createContext<LimitVM | null>(null);

export const LimitVMProvider: React.FC = ({ children }) => {
  const rootStore = useStores();
  const store = useMemo(() => new LimitVM(rootStore), [rootStore]);
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useLimitVM = () => useVM(ctx);

class LimitVM {
  constructor(private rootStore: RootStore) {
    makeAutoObservable(this);
  }
}
