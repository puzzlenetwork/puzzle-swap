import React, { useMemo } from "react";
import { action, makeAutoObservable } from "mobx";
import { RootStore, useStores } from "@stores";
import { useVM } from "@src/hooks/useVM";
import BN from "@src/utils/BN";
import { CONTRACT_ADDRESSES, TOKENS_BY_SYMBOL } from "@src/constants";

const ctx = React.createContext<LimitVM | null>(null);

export const LimitVMProvider: React.FC = ({ children }) => {
  const rootStore = useStores();
  const store = useMemo(() => new LimitVM(rootStore), [rootStore]);
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useLimitVM = () => useVM(ctx);

class LimitVM {
  assetId0: string = TOKENS_BY_SYMBOL.USDN.assetId;
  setAssetId0 = (assetId: string) => (this.assetId0 = assetId);

  amount0: BN = BN.ZERO;
  setAmount0 = (amount: BN) => (this.amount0 = amount);

  assetId1: string = TOKENS_BY_SYMBOL.PUZZLE.assetId;
  setAssetId1 = (assetId: string) => (this.assetId1 = assetId);

  amount1: BN = BN.ZERO;
  setAmount1 = (amount: BN) => (this.amount1 = amount);

  sync = async () => {};

  createOrder = async () =>
    this.rootStore.accountStore
      .invoke({
        dApp: CONTRACT_ADDRESSES.limitOrders,
        payment: [{ assetId: this.assetId0, amount: this.amount0.toString() }],
        call: {
          function: "createOrder",
          args: [
            { type: "string", value: this.assetId1 },
            { type: "integer", value: this.amount1.toString() },
          ],
        },
      })
      .then(() => this.sync())
      .catch((e) =>
        this.rootStore.notificationStore.notify(e.message ?? e.toString(), {
          type: "error",
        })
      );

  cancelOrder = async (orderId: string) =>
    this.rootStore.accountStore
      .invoke({
        payment: [],
        dApp: CONTRACT_ADDRESSES.limitOrders,
        call: {
          function: "cancelOrder",
          args: [{ type: "string", value: orderId }],
        },
      })
      .then(() => this.sync())
      .catch((e) =>
        this.rootStore.notificationStore.notify(e.message ?? e.toString(), {
          type: "error",
        })
      );

  constructor(private rootStore: RootStore) {
    makeAutoObservable(this);
  }
}
