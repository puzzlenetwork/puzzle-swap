import React, { useMemo } from "react";
import { makeAutoObservable } from "mobx";
import { RootStore, useStores } from "@stores";
import { useVM } from "@src/hooks/useVM";
import BN from "@src/utils/BN";
import { CONTRACT_ADDRESSES, TOKENS_BY_SYMBOL } from "@src/constants";
import makeNodeRequest from "@src/utils/makeNodeRequest";
import { INodeData } from "@src/services/nodeService";
import { getStateByKey } from "@src/utils/getStateByKey";
import {
  buildCancelOrderParams,
  IDialogNotificationProps,
} from "@components/Dialog/DialogNotification";

const ctx = React.createContext<LimitOrdersVM | null>(null);

export const LimitOrdersVMProvider: React.FC = ({ children }) => {
  const rootStore = useStores();
  const store = useMemo(() => new LimitOrdersVM(rootStore), [rootStore]);
  return <ctx.Provider value={store}>{children}</ctx.Provider>;
};

export const useLimitOrdersVM = () => useVM(ctx);

const getOrderStateKeys = (orderId: string) => [
  `order_${orderId}_amount0`,
  `order_${orderId}_token0`,
  `order_${orderId}_amount1`,
  `order_${orderId}_token1`,
  `order_${orderId}_fulfilled0`,
  `order_${orderId}_fulfilled1`,
  `order_${orderId}_status`,
];

export interface IOrder {
  id: string;
  amount0: BN;
  token0: string;
  amount1: BN;
  token1: string;
  fulfilled0: BN;
  fulfilled1: BN;
  status: "active" | "closed" | "canceled";
}

class LimitOrdersVM {
  orders: Array<IOrder> = [];
  setOrders = (orders: Array<IOrder>) => (this.orders = orders);

  assetId0: string = TOKENS_BY_SYMBOL.USDN.assetId;
  setAssetId0 = (assetId: string) => (this.assetId0 = assetId);

  price: BN = BN.ZERO;
  setPrice = (price: BN) => (this.price = price);

  get isMarketPrice() {
    return BN.ZERO;
  }

  amount0: BN = BN.ZERO;
  setAmount0 = (amount: BN) => (this.amount0 = amount);

  assetId1: string = TOKENS_BY_SYMBOL.PUZZLE.assetId;
  setAssetId1 = (assetId: string) => (this.assetId1 = assetId);

  amount1: BN = BN.ZERO;
  setAmount1 = (amount: BN) => (this.amount1 = amount);

  loading: boolean = true;
  private setLoading = (l: boolean) => (this.loading = l);

  switchTokens = () => {
    const assetId0 = this.assetId0;
    this.setAssetId0(this.assetId1);
    this.setAssetId1(assetId0);
  };

  public notificationParams: IDialogNotificationProps | null = null;
  public setNotificationParams = (params: IDialogNotificationProps | null) =>
    (this.notificationParams = params);

  sync = async () => {
    this.setLoading(true);
    const orderIdList: string[] = await makeNodeRequest(
      `/addresses/data/${CONTRACT_ADDRESSES.limitOrders}/user_${this.rootStore.accountStore.address}_orders`
    )
      .then(({ data }) => data.value.split(","))
      .catch(() => []);
    if (orderIdList.length === 0) return;

    const keys = orderIdList.reduce(
      (acc, id) => [...acc, ...getOrderStateKeys(id)],
      [] as string[]
    );
    const ordersData: INodeData[] = await makeNodeRequest(
      `/addresses/data/${CONTRACT_ADDRESSES.limitOrders}`,
      { postData: { keys } }
    )
      .then(({ data }) => data)
      .catch(() => []);
    const orders = orderIdList.map((id) => ({
      id,
      amount0: new BN(getStateByKey(ordersData, `order_${id}_amount0`) ?? 0),
      token0: getStateByKey(ordersData, `order_${id}_token0`) ?? "",
      amount1: new BN(getStateByKey(ordersData, `order_${id}_amount1`) ?? 0),
      token1: getStateByKey(ordersData, `order_${id}_token1`) ?? "",
      fulfilled0: new BN(
        getStateByKey(ordersData, `order_${id}_fulfilled0`) ?? 0
      ),
      fulfilled1: new BN(
        getStateByKey(ordersData, `order_${id}_fulfilled1`) ?? 0
      ),
      status: getStateByKey(ordersData, `order_${id}_status`) ?? "closed",
    }));
    this.setOrders(orders as IOrder[]);
    this.setLoading(true);
  };

  get token0() {
    return this.rootStore.accountStore.balances.find(
      ({ assetId }) => assetId === this.assetId0
    )!;
  }

  get balance0() {
    return this.token0?.balance;
  }

  get token1() {
    return this.rootStore.accountStore.balances.find(
      ({ assetId }) => assetId === this.assetId1
    )!;
  }

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
      .then(() => this.setNotificationParams(null))
      .then(() => this.sync())
      .catch((e) =>
        this.rootStore.notificationStore.notify(e.message ?? e.toString(), {
          type: "error",
        })
      );

  checkOrderCancel = (id: string) => {
    console.log(this.notificationParams);
    this.setNotificationParams(
      buildCancelOrderParams({
        onCancel: () => this.cancelOrder(id),
      })
    );
    console.log(this.notificationParams);
  };

  constructor(private rootStore: RootStore) {
    makeAutoObservable(this);
    const params = new URLSearchParams(window.location.search);
    const asset0 = params.get("asset0")?.toString();
    const asset1 = params.get("asset1")?.toString();
    this.assetId0 = asset0 ?? TOKENS_BY_SYMBOL.USDN.assetId;
    this.assetId1 = asset1 ?? TOKENS_BY_SYMBOL.PUZZLE.assetId;
    this.sync().then(() => this.setLoading(false));
    setInterval(this.sync, 60 * 1000);
  }
}
