import React, { useMemo } from "react";
import { makeAutoObservable, when } from "mobx";
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
import aggregatorService from "@src/services/aggregatorService";
import dayjs from "dayjs";

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
  `order_${orderId}_timestamp`,
];

export interface IOrder {
  id: string;
  amount0: BN;
  token0: string;
  amount1: BN;
  token1: string;
  fulfilled0: BN;
  fulfilled1: BN;
  timestamp: number;
  status: "active" | "closed" | "canceled";
}

class LimitOrdersVM {
  constructor(private rootStore: RootStore) {
    makeAutoObservable(this);
    this.setLoading(true);
    const params = new URLSearchParams(window.location.search);
    const asset0 = params.get("asset0")?.toString();
    const asset1 = params.get("asset1")?.toString();
    this.assetId0 = asset0 ?? TOKENS_BY_SYMBOL.USDN.assetId;
    this.assetId1 = asset1 ?? TOKENS_BY_SYMBOL.PUZZLE.assetId;
    this.sync().then(() => this.setLoading(false));
    setInterval(this.sync, 60 * 1000);

    when(() => this.priceSettings === 1, this.getMarketPrice);
  }

  orders: Array<IOrder> = [];
  setOrders = (orders: Array<IOrder>) => (this.orders = orders);

  assetId0: string = TOKENS_BY_SYMBOL.USDN.assetId;
  setAssetId0 = (assetId: string) => (this.assetId0 = assetId);

  get isMarketPrice() {
    return BN.ZERO;
  }

  price: BN = BN.ZERO;
  setPrice = (amount: BN) => (this.price = amount);

  assetId1: string = TOKENS_BY_SYMBOL.PUZZLE.assetId;
  setAssetId1 = (assetId: string) => (this.assetId1 = assetId);

  payment: BN = BN.ZERO;
  setPayment = (amount: BN) => (this.payment = amount);

  loading: boolean = true;
  private setLoading = (l: boolean) => (this.loading = l);

  priceSettings: 0 | 1 = 0;
  setPriceSettings = (value: 0 | 1) => (this.priceSettings = value);

  paymentSettings: 0 | 1 = 0;
  setPaymentSettings = (value: 0 | 1) => (this.paymentSettings = value);

  switchTokens = () => {
    const assetId0 = this.assetId0;
    this.setAssetId0(this.assetId1);
    this.setAssetId1(assetId0);
  };

  public notificationParams: IDialogNotificationProps | null = null;
  public setNotificationParams = (params: IDialogNotificationProps | null) =>
    (this.notificationParams = params);

  sync = async () => {
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
      timestamp: dayjs(getStateByKey(ordersData, `order_${id}_timestamp`) ?? 0),
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
    console.log(orders);
    const v = [
      {
        id: "1",
        amount0: new BN(100000000),
        token0: "HEB8Qaw9xrWpWs8tHsiATYGBWDBtP2S7kcPALrMu43AS",
        amount1: new BN(18000000),
        token1: "DG2xFkPdDwKUoBkzGAhQtLpSGzfXLiCYPEzeKH2Ad24p",
        fulfilled0: new BN(0),
        fulfilled1: new BN(0),
        status: "active",
        timestamp: dayjs(1659999600000),
      },
      {
        id: "2",
        amount0: new BN(100000000),
        token0: "HEB8Qaw9xrWpWs8tHsiATYGBWDBtP2S7kcPALrMu43AS",
        amount1: new BN(18000000),
        token1: "DG2xFkPdDwKUoBkzGAhQtLpSGzfXLiCYPEzeKH2Ad24p",
        fulfilled0: new BN(80000000),
        fulfilled1: new BN(0),
        status: "canceled",
        timestamp: dayjs(1659999600000),
      },
      {
        id: "3",
        amount0: new BN(100000000),
        token0: "HEB8Qaw9xrWpWs8tHsiATYGBWDBtP2S7kcPALrMu43AS",
        amount1: new BN(18000000),
        token1: "DG2xFkPdDwKUoBkzGAhQtLpSGzfXLiCYPEzeKH2Ad24p",
        fulfilled0: new BN(0),
        fulfilled1: new BN(0),
        status: "active",
        timestamp: dayjs(1662678000000),
      },
      {
        id: "4",
        amount0: new BN(100000000),
        token0: "HEB8Qaw9xrWpWs8tHsiATYGBWDBtP2S7kcPALrMu43AS",
        amount1: new BN(18000000),
        token1: "DG2xFkPdDwKUoBkzGAhQtLpSGzfXLiCYPEzeKH2Ad24p",
        fulfilled0: new BN(0),
        fulfilled1: new BN(0),
        status: "active",
        timestamp: 1662713690993,
      },
    ];
    // this.setOrders(orders as IOrder[]);
    this.setOrders(v as IOrder[]);
  };

  get token0() {
    return this.rootStore.accountStore.balances.find(
      ({ assetId }) => assetId === this.assetId0
    )!;
  }

  get balance0() {
    return this.token0?.balance;
  }

  get balance1() {
    return this.token1?.balance;
  }

  get token1() {
    return this.rootStore.accountStore.balances.find(
      ({ assetId }) => assetId === this.assetId1
    )!;
  }

  makePriceFromMarket = () => {
    const marketPriceOfToken0 = this.rootStore.poolsStore.t2tPrice(
      this.assetId0,
      this.assetId1
    );
    this.setPrice(marketPriceOfToken0);
  };

  createOrder = async () =>
    this.rootStore.accountStore
      .invoke({
        dApp: CONTRACT_ADDRESSES.limitOrders,
        payment: [{ assetId: this.assetId0, amount: this.price.toString() }],
        call: {
          function: "createOrder",
          args: [
            { type: "string", value: this.assetId1 },
            { type: "integer", value: this.payment.toString() },
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
  cancelAllOrders = async () => {
    const activeOrders = this.orders.filter(
      ({ status }) => status === "active"
    );
    if (activeOrders.length === 0) return;
    const ordersToCancel = activeOrders.map(({ id }) => id).join(",");

    this.rootStore.accountStore
      .invoke({
        payment: [],
        dApp: CONTRACT_ADDRESSES.proxyLimitOrders,
        call: {
          function: "cancelMany",
          args: [{ type: "string", value: ordersToCancel }],
        },
      })
      .then(() => this.setNotificationParams(null))
      .then(() => this.sync())
      .catch((e) =>
        this.rootStore.notificationStore.notify(e.message ?? e.toString(), {
          type: "error",
        })
      );
  };

  checkOrderCancel = (id?: string, many?: boolean) => {
    this.setNotificationParams(
      buildCancelOrderParams({
        onCancel: () =>
          many ? this.cancelAllOrders() : this.cancelOrder(id ?? ""),
        many,
      })
    );
  };

  groupedOrders(opened?: boolean) {
    const orders = opened
      ? this.orders.filter((v) => v.status === "active")
      : this.orders.filter((v) => v.status !== "active");
    const sorted = orders
      .slice()
      .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
    if (sorted.length === 0) return {};
    return sorted.reduce((acc, order) => {
      const day = dayjs(order.timestamp).startOf("day").toDate().getTime();
      Array.isArray(acc[day]) ? acc[day].push(order) : (acc[day] = [order]);
      return acc;
    }, {} as Record<number, Array<IOrder>>);
  }

  get isThereOpenedOrders() {
    return this.orders.filter((v) => v.status === "active").length > 0;
  }

  onPercentClick = (percent: number) => {
    const amount = new BN(percent).times(this.balance1 ?? 1).div(100);
    this.setPayment(amount);
  };

  get dollEq0() {
    const v = this.rootStore.poolsStore
      .usdnRate(this.assetId0)
      ?.times(this.price);
    if (v == null) return "$ 0.00";
    return `$ ${BN.formatUnits(v, this.token0.decimals).toFormat(2)}`;
  }

  get dollEq1() {
    const v = this.rootStore.poolsStore
      .usdnRate(this.assetId1)
      ?.times(this.payment);
    if (v == null) return "$ 0.00";
    return `$ ${BN.formatUnits(v, this.token1.decimals).toFormat(2)}`;
  }

  get finalAmount(): BN {
    if (this.paymentSettings === 0) {
      const v1 = BN.formatUnits(this.price, this.token1.decimals);
      const v2 = BN.formatUnits(this.payment, this.token0.decimals);
      return BN.parseUnits(v1.times(v2), this.token0.decimals);
    } else if (this.paymentSettings === 1) {
      const v1 = BN.formatUnits(this.price, this.token0.decimals);
      const v2 = BN.formatUnits(this.payment, this.token1.decimals);
      return BN.parseUnits(v2.div(v1), this.token1.decimals);
    }
    return BN.ZERO;
  }

  getMarketPrice = async () => {
    this.setLoading(true);
    const res = await aggregatorService.calc(
      this.assetId1,
      this.assetId0,
      BN.parseUnits(1, this.token1.decimals)
    );
    this.setPrice(new BN(res.estimatedOut));
    this.setLoading(false);
  };
}
